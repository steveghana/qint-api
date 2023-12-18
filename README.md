# Queueint

Intelligent queue management on the cloud.

---

## Legal

All original and derived works in this repository are intellectual property of Ran Shushan, and when Queueint will become a legal entity the intellectual property will become property of Queueint.

### License

All rights reserved. You may not share the contents of this repository.
By contributing, you consent that the contributed work is intellectual property of Ran Shushan or Queueint.

---

### Execution environment

This project uses [NodeJS](https://nodejs.org/en/). You'll need a LTS version of NodeJS and NPM installed. NPM is usually bundled with NodeJS.

- To check your installed NodeJS version: `node -v`.
- To check your installed NPM version: `npm -v`

After NodeJS is installed, you'll need to install the project's dependencies. Run `npm install`, and they will be downloaded and installed in the `node_modules` directory.

---

## Environment set-up

### Database

This project uses [PostgreSQL](https://www.postgresql.org/).
In the development environment, it can be easily set up locally via [docker](https://www.docker.com/).
By using the [postgres image @ docker hub](https://hub.docker.com/_/postgres).
Just run `npm run start-db`

---

## Running

### Building

This project uses [TypeScript](https://www.typescriptlang.org/) with very modern JavaScript features. For compatibility the source code needs to be transpiled before it can be run.

- To build everything, run `npm run build`

### Execution

The Back end (api).

- To start the api, run `npm run start`

Note: These commands only work with the non-production build.

---
