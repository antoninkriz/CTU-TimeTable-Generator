"""Module with requests API models and helper functions for parsin the API responses"""

import dataclasses
import datetime
import enum
from typing import Any, Optional, TypedDict

from kos_loader.consts import KOS_API


@dataclasses.dataclass
class Semester:
    """Class representing information about a single Semester"""

    semester_id: str
    name: str
    start: datetime.date
    end: datetime.date


class ParallelType(enum.StrEnum):
    """Enum dividing types of each Parallel"""

    LEC = "P"
    TUT = "C"
    LAB = "L"


@dataclasses.dataclass
class TimeTable:
    """Clas representing a single TimeTable event"""

    day: int
    start: tuple[int, int]
    end: tuple[int, int]
    room: Optional[str]


@dataclasses.dataclass
class Parallel:
    """Class representing a single Parallel and its TimeTable events"""

    parallel_id: int
    course_id: int
    semester: str
    type: ParallelType
    num: Optional[int]
    capacity: Optional[int]
    timetable: list[TimeTable]


@dataclasses.dataclass
class Course:
    """Class represeting a single Course and its Parallels"""

    course_id: int
    code: str
    name: str
    parallels: list[Parallel]


def parse_semester(sem: dict[str, Any]) -> Semester:
    """Parse Semesters out of an API reponse"""
    return Semester(
        semester_id=sem["id"],
        name=sem["nameCs"],
        start=datetime.date.fromisoformat(sem["semesterStart"]) if "semesterStart" in sem else datetime.date.min,
        end=datetime.date.fromisoformat(sem["semesterEnd"]) if "semesterEnd" in sem else datetime.date.min,
    )


def str_to_time_tuple(string: str) -> tuple[int, int]:
    """Convert string from HH:MM to tuple (HH, MM)"""
    split = string.split(":", maxsplit=1)
    return int(split[0]), int(split[1])


def parse_parallel(par: dict[str, Any]) -> Parallel:
    """Parse Parallels out of an API reponse"""
    return Parallel(
        parallel_id=par["id"],
        course_id=par["courseView"]["id"],
        semester=par["semester"]["id"],
        type=par["parallelType"]["code"],
        num=par.get("parallelNumber"),
        capacity=par.get("capacity"),
        timetable=[
            TimeTable(
                day=t["dayNumber"],
                start=str_to_time_tuple(t["ticketStart"]),
                end=str_to_time_tuple(t["ticketEnd"]),
                room=t["room"]["roomNumber"] if "room" in t else None,
            )
            for t in par["timetable"]
        ],
    )


def parse_course(cou: dict[str, Any]) -> Course:
    """Parse Courses out of an API reponse"""
    return Course(course_id=cou["id"], code=cou["code"], name=cou.get("nameCs", cou.get("nameEn")), parallels=[])


class Request(TypedDict):
    """Request class to clean up the aiohttp requests code"""

    url: str
    params: dict[str, str | int]


def req_semesters(size: int = 0) -> Request:
    """Factory for the Request to the /semesters endpoint"""
    return Request(url=f"{KOS_API}/semesters", params={"size": size})


def req_courses(size: int = 0) -> Request:
    """Factory for the Request to the /courses endpoint"""
    return Request(url=f"{KOS_API}/courses", params={"size": size})


def req_parallels(semester: str, size: int = 0) -> Request:
    """Factory for the Request to the /timetables/parallel-classes endpoint"""
    return Request(
        url=f"{KOS_API}/timetables/parallel-classes",
        params={"expanded": "teachers,timetable.teachers,timetable.room", "query": f"semesterId=={semester}", "size": size},
    )
