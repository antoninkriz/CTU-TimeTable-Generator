# ctu-timetable-generator

[![ci-web](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/ci-web.yml/badge.svg)](https://github.com/antoninkriz/CTU-TimeTable-Generator/actions/workflows/ci-python.yml)
[![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?logo=yarn&logoColor=white)](https://yarnpkg.com/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?logo=eslint&logoColor=white)](https://eslint.org/)

Front-end Web App for **CTU TimeTable Generator**

---

This is statically generated front end web application intended to be used together with the data from the `kos-loader`.

Since the computation might require a lot of processing powert the app uses Web Workers to offload the computations to a different thread.

This app is designed to be used with modern, recent browsers and works the best (or rather only) on computers, not phones, due to the size of the UI (time tables aren't small) and processing power required.


## Usage

```bash
yarn install --pure-lockfile

# For development
yarn dev

# For production
yarn build
```
