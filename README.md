# CTU TimeTable Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![fetch-data](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/fetch-data.yml/badge.svg)](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/fetch-data.yml)
[![pages-build-deployment](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/pages/pages-build-deployment)

[![ci-python](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/ci-python.yml/badge.svg)](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/ci-python.yml)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=ef8336)](https://pycqa.github.io/isort/)
[![Checked with mypy](https://www.mypy-lang.org/static/mypy_badge.svg)](https://mypy-lang.org/)
[![linting: pylint](https://img.shields.io/badge/linting-pylint-yellowgreen)](https://github.com/pylint-dev/pylint)

[![ci-web](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/ci-web.yml/badge.svg)](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/ci-python.yml)
[![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?logo=yarn&logoColor=white)](https://yarnpkg.com/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?logo=eslint&logoColor=white)](https://eslint.org/)

Harder, better, faster, stronger

This project was created as a tribute to the memory of [CTU-TimeTableGenerator](https://github.com/antoninkriz/CTU-TimeTableGenerator) and [CTU-TimeTableGenerator-new](https://github.com/antoninkriz/CTU-TimeTableGenerator-new) - older variants written in C++, Python, Bash and some React. Rest in peace.


## Usage

Just open [the website](https://antoninkriz.github.io/CTU-TimeTable-Generator/) - no more downloading, installing, compiling, generating auth tokens and crying!


## Data

You don't need to login or generate any auth tokens. The data are fetched every 2 hours or so (check [`fetch-data.yml`](https://github.com/antoninkriz/CTU-TimeTable-Generator/blob/main/.github/workflows/fetch-data.yml)) from the KOS API. If you have a better strategy, which doesn't include frying the KOS API every minute, please let me know. ❤


## Components

- `kos-loader` - Loads data from the KOS API
- `ctu-timetable-generator` - User-facing app


## Development

See `README.md` in each component's folder.
