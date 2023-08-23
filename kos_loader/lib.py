"""Library with tools used in the kos_loader project"""

import dataclasses
import json
import time


class Timer:
    """Timer class to measure run time"""

    def __init__(self) -> None:
        self._start_time_ns: int = 0
        self._measured: float = 0

    def start(self):
        """Start measurement"""
        self._start_time_ns = time.perf_counter_ns()
        self._measured = 0

    def measure(self) -> float:
        """Save measurement"""
        end_time = time.perf_counter_ns()
        res = (end_time - self._start_time_ns) / 1_000_000_000
        self._measured = res
        return res

    def __str__(self) -> str:
        return f"{self._measured:.3f}s"


class JSONEncoder(json.JSONEncoder):
    """Custom JSON Encode class to help serializing unknown types"""

    def default(self, o):
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        return super().default(o)
