"""Main kos_loader module"""

import asyncio
import dataclasses
import datetime
import itertools
import json
import logging
import os
from typing import Any, Callable, TypeVar

import aiofiles
import aiohttp
import yarl

from kos_loader.consts import KOS_API, KOS_HOST, KOS_REST, KOS_URL
from kos_loader.lib import JSONEncoder, Timer
from kos_loader.requests import Request, parse_course, parse_parallel, parse_semester, req_courses, req_parallels, req_semesters

LOG_LEVELS = {"debug": logging.DEBUG, "info": logging.INFO, "warn": logging.WARN, "error": logging.ERROR}
logging.basicConfig(level=LOG_LEVELS[os.environ.get("LOGLEVEL", "info").lower()])
logger = logging.getLogger("kos_loader")

timer = Timer()


async def on_request_start(_: aiohttp.ClientSession, __: Any, params: aiohttp.TraceRequestStartParams):
    """Debug print for aiohttp client"""
    logging.debug("Request START: %s %s %s", params.method, params.url, params.headers)


async def on_request_end(_: aiohttp.ClientSession, __: Any, params: aiohttp.TraceRequestEndParams):
    """Debug print for aiohttp client"""
    logging.debug("Request END: %s %s %s [%s]", params.method, params.url, params.headers, params.response.status)


@dataclasses.dataclass
class User:
    """KOS User login credentials class"""

    username: str
    password: str


def load_user() -> User | None:
    """Load KOS user login credentials from env"""
    logging.debug("Loading user from env")
    username = os.environ.get("KOS_USERNAME")
    password = os.environ.get("KOS_PASSWORD")

    if username is None or password is None:
        logger.error("Missing env vars with username and/or password")
        raise ValueError("User could not be laoded")

    return User(username=username, password=password)


async def kos_session(user: User) -> aiohttp.ClientSession:
    """Start new HTTP session with KOS user logged in"""
    trace_config = aiohttp.TraceConfig()
    trace_config.on_request_start.append(on_request_start)
    trace_config.on_request_end.append(on_request_end)

    # This is OK since aiohttp.ClientSession.__aenter__(...) is NOOP
    session = aiohttp.ClientSession(headers={"Host": KOS_HOST}, trace_configs=[trace_config], raise_for_status=True)

    logger.info("Logging in")

    # Extract XSRF cookie and save it as a permanent header
    try:
        async with session.get(f"{KOS_API}/info"):
            session.headers["X-XSRF-TOKEN"] = session.cookie_jar.filter_cookies(yarl.URL(KOS_URL))["XSRF-TOKEN"].value
    except aiohttp.ClientResponseError as ex:
        logger.exception("Login failed - Could not load the %s endpoint", f"{KOS_API}/info", exc_info=ex)
        raise
    except KeyError:
        logger.error("Login failed - Missing cookie XSRF-TOKEN from the %s endpoint", f"{KOS_API}/info")
        raise

    # Login with the username and a password
    try:
        async with session.post(f"{KOS_REST}/login", data=dataclasses.asdict(user)):
            pass
    except aiohttp.ClientResponseError as ex:
        logger.exception("Login failed - Could not login", exc_info=ex)
        raise

    # Return the session with cookies and headers set
    return session


ParserResultT = TypeVar("ParserResultT")


async def load_data(session: aiohttp.ClientSession, request: Request, parser: Callable[[dict[str, Any]], ParserResultT]) -> list[ParserResultT]:
    """Load data from the KOS API and parse it"""
    try:
        async with session.get(**request) as resp:
            data: list[dict[str, Any]] = (await resp.json())["elements"]
            return list(filter(lambda x: x is not None, (parser(element) for element in data)))
    except aiohttp.ClientResponseError as ex:
        logger.exception("Failed to load %s", request, exc_info=ex)
        raise
    except KeyError as ex:
        logger.error('Failed to load %s, missing key "elements"', request)
        raise ValueError('Invalid response - missing key "elements"') from ex


async def main():
    """Main function"""
    user = load_user()
    async with await kos_session(user) as session:
        logger.info("Downloading semesters")
        timer.start()
        semesters = sorted(await load_data(session, req_semesters(), parse_semester), key=lambda x: x.semester_id)
        timer.measure()
        logger.info("Downloaded data in %s", timer)

        today = datetime.date.today()
        sem_it = (s for s in semesters)
        sem_curr = next(s for s in sem_it if s.start <= today <= s.end)
        sem_next = next(sem_it)

        logger.info("Found semesters %s", [sem_curr.semester_id, sem_next.semester_id])
        logger.info("Downloading courses and parallels for semesters %s", [sem_curr.semester_id, sem_next.semester_id])

        timer.start()
        courses, par_curr, par_next = await asyncio.gather(
            load_data(session, req_courses(), parse_course),
            load_data(session, req_parallels(sem_curr.semester_id), parse_parallel),
            load_data(session, req_parallels(sem_next.semester_id), parse_parallel),
        )
        timer.measure()
        logger.info("Downloaded data in %s", timer)

        logger.info("Matching parallels and courses")

        par_curr_by_course = {k: list(v) for k, v in itertools.groupby(par_curr, lambda p: p.course_id)}
        par_next_by_course = {k: list(v) for k, v in itertools.groupby(par_next, lambda p: p.course_id)}

        courses_curr = [dataclasses.replace(c, parallels=par_curr_by_course[c.course_id]) for c in courses if c.course_id in par_curr_by_course]
        courses_next = [dataclasses.replace(c, parallels=par_next_by_course[c.course_id]) for c in courses if c.course_id in par_next_by_course]

        logger.info("Writing the result to data.json")
        timer.start()

        async with aiofiles.open("data.json", "w", encoding="utf-8") as file:
            await file.write(
                json.dumps(
                    {
                        sem_curr.semester_id: courses_curr,
                        sem_next.semester_id: courses_next,
                    },
                    cls=JSONEncoder,
                    sort_keys=True,
                )
            )

        timer.measure()
        logger.info("Saved file in %s", timer)

        logger.info("Done")


if __name__ == "__main__":
    asyncio.run(main())
