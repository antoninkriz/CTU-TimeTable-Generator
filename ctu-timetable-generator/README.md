# ctu-timetable-generator

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
