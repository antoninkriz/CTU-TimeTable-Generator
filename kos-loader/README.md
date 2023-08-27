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
    // Code of a semester
    "B231": [
        {
            // Course code, should be unique among all courses
            "code": "BI-QAP",
            // Name of the class in Czech, or English if Czech is not available, or null
            "name": "Kvantové algoritmy a programování",
            "parallels": [
                {
                    // Parallel capacity or null
                    "capacity": 32,
                    // Parallel number, should not be null but I can't promise anything
                    "num": 101,
                    // List of all events of a given parallel, this shouldn't be empty
                    "timetable": [
                        {
                            // Days indexed from 1 -> 4 = Thursday
                            "day": 4,
                            // L, S or null for odd, even and both types of weeks classes
                            "week": "L",
                            // Room code, this should correctly indentify a room, or null
                            "room": "TH:A-s135",
                            // Time in the [HH, mm] format
                            "end": [
                                13,
                                30
                            ],
                            // Time in the [HH, mm] format
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