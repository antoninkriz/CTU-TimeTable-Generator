"""Module with requests API models and helper functions for parsin the API responses"""

import abc
import dataclasses
import datetime
import enum
from typing import Any, Optional, TypedDict

from kos_loader.consts import KOS_API


class CanExclude:
    """Abstract class to force implementation of custom dict_factory"""

    @abc.abstractmethod
    def dict_factory(self) -> dict[str, Any]:
        """Creates dict out of a class in its own way"""


@dataclasses.dataclass
class Semester(CanExclude):
    """Class representing information about a single Semester"""

    semester_id: str
    name: str
    start: datetime.date
    end: datetime.date

    def dict_factory(self) -> dict[str, Any]:
        return self.__dict__


@dataclasses.dataclass
class TimeTable(CanExclude):
    """Clas representing a single TimeTable event"""

    day: int
    start: tuple[int, int]
    end: tuple[int, int]
    room: Optional[str]

    def dict_factory(self) -> dict[str, Any]:
        return self.__dict__


class ParallelType(enum.StrEnum):
    """Enum dividing types of each Parallel"""

    LEC = "P"
    TUT = "C"
    LAB = "L"


@dataclasses.dataclass
class Parallel(CanExclude):
    """Class representing a single Parallel and its TimeTable events"""

    parallel_id: int
    course_id: int
    semester: str
    type: ParallelType
    num: Optional[int]
    capacity: Optional[int]
    timetable: list[TimeTable]

    def dict_factory(self) -> dict[str, Any]:
        res = self.__dict__
        res.pop("parallel_id")
        res.pop("course_id")
        res.pop("semester")
        return res


@dataclasses.dataclass
class Course(CanExclude):
    """Class represeting a single Course and its Parallels"""

    course_id: int
    code: str
    name: str
    parallels: list[Parallel]

    def dict_factory(self) -> dict[str, Any]:
        res = self.__dict__
        res.pop("course_id")
        return res


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
