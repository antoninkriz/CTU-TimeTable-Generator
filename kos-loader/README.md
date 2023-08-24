# kos-loader

Data loader for **CTU TimeTable Generator**

---

This tool downloads data from the undocumented private KOS API using a using traditional KOS login details.


## Usage

```bash
KOS_USERNAME=your_username
KOS_PASSWORD=********
LOGLEVEL=info
python3 -m kos_loader.kos_loader
```


## Process description

1. Download list of all semesters
2. Get current and the following semester
3. Download list of all courses
4. Download list of all paralles in the two selected semesters
5. For each semester match parallels to the courses
6. Filter out courses with no parallels for each semester
7. Save these data


## Data format

Example:

```json
{
    "B231": [
        {
            "code": "BI-QAP",
            "course_id": 6809806,
            "name": "Kvantové algoritmy a programování",
            "parallels": [
                {
                    "capacity": 32,
                    "course_id": 6809806,
                    // Parallel number
                    "num": 101,
                    "parallel_id": 1246680571005,
                    "semester": "B231",
                    "timetable": [
                        {
                            // Days indexed from 1 -> 4 = Thursday
                            "day": 4,
                            // Time in the [HH, mm] format
                            "end": [
                                13,
                                30
                            ],
                            "room": "TH:A-s135",
                            "start": [
                                11,
                                0
                            ]
                        }
                    ],
                    // P = Lecture, C = Tutorial, L = Lab
                    "type": "C"
                },
                // ...
            ]
        }
    ],
    // ...
}
```