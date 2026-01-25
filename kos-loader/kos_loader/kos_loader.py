"""Main kos_loader module"""

import asyncio
import dataclasses
import datetime
import itertools
import json
import logging
import math
import os
import pathlib
import random
import sys
from typing import Any, Callable, TypeVar

import aiofiles
import aiohttp
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey

from kos_loader.consts import KOS_API, KOS_HOST, PAGINATION
from kos_loader.lib import JSONEncoder, Timer
from kos_loader.requests import Request, parse_course, parse_parallel, parse_semester, req_courses, req_parallels, req_semesters

LOG_LEVELS = {"debug": logging.DEBUG, "info": logging.INFO, "warn": logging.WARN, "error": logging.ERROR}
logging.basicConfig(level=LOG_LEVELS[os.environ.get("LOGLEVEL", "info").lower()])
logger = logging.getLogger("kos_loader")


async def on_request_start(_: aiohttp.ClientSession, __: Any, params: aiohttp.TraceRequestStartParams):
    """Debug print for aiohttp client"""
    logging.debug("Request START: %s %s %s", params.method, params.url, params.headers)


async def on_request_end(_: aiohttp.ClientSession, __: Any, params: aiohttp.TraceRequestEndParams):
    """Debug print for aiohttp client"""
    logging.debug("Request END: %s %s %s [%s]", params.method, params.url, params.headers, params.response.status)


def get_output_file_path() -> pathlib.Path:
    """Get path to the output file from the program argument and create the folder if it doesn't exist yet"""
    if len(sys.argv) != 2:
        logger.error("This program needs exactly one argument with the path of the output file")
        raise ValueError("Missing file path program argument")

    path = pathlib.Path(sys.argv[1])
    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.is_file() and not path.parent.exists():
        logger.error("Invalid output file path")
        raise ValueError("Invalid output file path")

    return path


def decrypt_string(key: RSAPrivateKey, ciphertext_b64: str) -> str:
    """Decrypt base64 encoded ciphertext with the given private key"""
    import base64

    ciphertext = base64.b64decode(ciphertext_b64)
    plaintext = key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return plaintext.decode("utf-8")


@dataclasses.dataclass
class Cookies:
    """KOS User cookies"""

    jsessionid: str
    xsrf_token: str
    bigipserverfarm_is_stud_newkos_https: str
    msal_cache_encryption: str


def load_cookies() -> Cookies:
    """Load KOS user cookies from env"""
    logging.debug("Loading user from env")

    private_key_pem = os.environ.get("COOKIES_PRIVATE_KEY")
    if private_key_pem is None:
        logger.error("Missing env var with COOKIES_PRIVATE_KEY")
        raise ValueError("Cookies could not be loaded")

    jsessionid_enc = os.environ.get("JSESSIONID_ENC")
    xsrf_token_enc = os.environ.get("XSRF_TOKEN_ENC")
    bigipserverfarm_is_stud_newkos_https = os.environ.get("BIGIPSERVERFARM_IS_STUD_NEWKOS_HTTPS_ENC")
    msal_cache_encryption = os.environ.get("MSAL_CACHE_ENCRYPTION_ENC")

    if jsessionid_enc is None or xsrf_token_enc is None or bigipserverfarm_is_stud_newkos_https is None or msal_cache_encryption is None:
        logger.error("Missing env vars with encrypted cookies")
        raise ValueError("Cookies could not be loaded")

    private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    if not isinstance(private_key, RSAPrivateKey):
        logger.error("Invalid private key type for COOKIES_PRIVATE_KEY")
        raise ValueError("Cookies could not be loaded")

    jsessionid = decrypt_string(private_key, jsessionid_enc)
    xsrf_token = decrypt_string(private_key, xsrf_token_enc)
    bigipserverfarm_is_stud_newkos_https = decrypt_string(private_key, bigipserverfarm_is_stud_newkos_https)
    msal_cache_encryption = decrypt_string(private_key, msal_cache_encryption)
    print(jsessionid)
    print(xsrf_token)

    return Cookies(
        jsessionid=jsessionid,
        xsrf_token=xsrf_token,
        bigipserverfarm_is_stud_newkos_https=bigipserverfarm_is_stud_newkos_https,
        msal_cache_encryption=msal_cache_encryption,
    )


async def kos_session(user: Cookies) -> aiohttp.ClientSession:
    """Start new HTTP session with KOS user logged in"""
    trace_config = aiohttp.TraceConfig()
    trace_config.on_request_start.append(on_request_start)
    trace_config.on_request_end.append(on_request_end)

    # This is OK since aiohttp.ClientSession.__aenter__(...) is NOOP
    session = aiohttp.ClientSession(
        headers={
            "Host": KOS_HOST,
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
        },
        trace_configs=[trace_config],
        raise_for_status=True,
    )
    session.cookie_jar.update_cookies(
        {
            "JSESSIONID": user.jsessionid,
            "XSRF-TOKEN": user.xsrf_token,
            "BIGipServerFARM-IS-STUD-NEWKOS-HTTPS": user.bigipserverfarm_is_stud_newkos_https,
            "msal.cache.encryption": user.msal_cache_encryption,
        }
    )

    logger.info("Testing KOS session")

    # Try to access user info endpoint to verify if the cookies are valid
    ATTEMPTS = 5
    for attempt in range(ATTEMPTS):
        try:
            async with session.get(f"{KOS_API}/me") as resp:
                response = await resp.json()
                assert "person" in response
                assert "id" in response["person"] and isinstance(response["person"]["id"], int)
                assert "username" in response["person"] and isinstance(response["person"]["username"], str)
                logger.info("KOS session is valid", response)
                break
        except (aiohttp.ClientResponseError, AssertionError) as ex:
            logger.exception("KOS session is not valid - could not access user info", exc_info=ex)
            if attempt < ATTEMPTS - 1:
                logger.info("Retrying in 2 seconds...")
                await asyncio.sleep(2)
            else:
                logger.error("All attempts to verify KOS session failed")
                raise

    # Return the session with cookies and headers set
    return session


ParserResultT = TypeVar("ParserResultT")


async def load_data(
    session: aiohttp.ClientSession, request: Request, parser: Callable[[dict[str, Any]], ParserResultT], *, sleep: int | float | bool | None = None
) -> tuple[list[ParserResultT], int]:
    """Load data from the KOS API and parse it"""

    timer = Timer()
    try:
        if sleep is None or sleep is False:
            delay: int | float = 0
        elif sleep is True:
            delay = random.random() * 5
        else:
            delay = sleep

        logger.debug("Waiting for %s seconds for request %s", delay, request)
        await asyncio.sleep(float(delay))

        logger.debug("Started request %s", request)
        timer.start()
        async with session.get(**request) as response:
            resp: dict[str, Any] = await response.json()
            data: list[dict[str, Any]] = resp["elements"]
            count: int = resp["page"]["totalElements"]
            result = list(filter(lambda x: x is not None, (parser(element) for element in data)))
            timer.measure()
            logger.debug("Finished request %s in %s", request, timer)
            return result, count
    except aiohttp.ClientResponseError as ex:
        timer.measure()
        logger.exception("Failed to load %s in %s", request, timer, exc_info=ex)
        raise
    except KeyError as ex:
        timer.measure()
        logger.error("Failed to load %s in %s, missing key 'elements'", request, timer)
        raise ValueError("Invalid response - missing key 'elements'") from ex


async def main():
    """Main function"""
    timer = Timer()

    path = get_output_file_path()
    cookies = load_cookies()

    async with await kos_session(cookies) as session:
        logger.info("Downloading semesters")
        timer.start()
        semesters = sorted((await load_data(session, req_semesters(), parse_semester))[0], key=lambda x: x.semester_id)
        timer.measure()
        logger.info("Downloaded data in %s", timer)

        today = datetime.date.today()
        sem_it = (s for s in semesters)
        sem_curr = next(s for s in sem_it if s.start <= today <= s.end)
        sem_next = next(sem_it)

        logger.info("Found semesters %s", [sem_curr.semester_id, sem_next.semester_id])
        logger.info("Get total counts of parallels")
        timer.start()
        (_, par_count_curr) = await load_data(session, req_parallels(sem_curr.semester_id, size=1), parse_parallel)
        (_, par_count_next) = await load_data(session, req_parallels(sem_next.semester_id, size=1), parse_parallel)
        timer.measure()
        logger.info("Found %s parallels for current semester and %s for next semester in %s", par_count_curr, par_count_next, timer)

        logger.info("Downloading courses and parallels for semesters %s", [sem_curr.semester_id, sem_next.semester_id])
        timer.start()
        data = await asyncio.gather(
            load_data(session, req_courses(), parse_course),
            *(
                load_data(session, req_parallels(sem_curr.semester_id, size=PAGINATION, page=p), parse_parallel, sleep=p)
                for p in range(math.ceil(par_count_curr / PAGINATION))
            ),
            *(
                load_data(
                    session, req_parallels(sem_next.semester_id, size=PAGINATION, page=p), parse_parallel, sleep=p + math.ceil(par_count_curr / PAGINATION)
                )
                for p in range(math.ceil(par_count_next / PAGINATION))
            ),
        )

        (courses, _) = data[0]
        par_curr = list(itertools.chain.from_iterable(x[0] for x in data[1 : 1 + math.ceil(par_count_curr / PAGINATION)]))
        par_next = list(itertools.chain.from_iterable(x[0] for x in data[1 + math.ceil(par_count_curr / PAGINATION) :]))

        timer.measure()
        logger.info("Downloaded data in %s", timer)

        logger.info("Matching parallels and courses")
        par_curr_by_course = {k: list(v) for k, v in itertools.groupby(sorted(par_curr, key=lambda p: p.course_id), lambda p: p.course_id)}
        par_next_by_course = {k: list(v) for k, v in itertools.groupby(sorted(par_next, key=lambda p: p.course_id), lambda p: p.course_id)}
        courses_curr = [dataclasses.replace(c, parallels=par_curr_by_course[c.course_id]) for c in courses if c.course_id in par_curr_by_course]
        courses_next = [dataclasses.replace(c, parallels=par_next_by_course[c.course_id]) for c in courses if c.course_id in par_next_by_course]

        logger.info("Writing the result to data.json")
        timer.start()

        async with aiofiles.open(path, "w", encoding="utf-8") as file:
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
