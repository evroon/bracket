<img align="left" alt="Favicon of Bracket" src="frontend/public/favicon.svg" height="130" />

# Bracket
[![codecov](https://codecov.io/gh/evroon/bracket/branch/master/graph/badge.svg?token=YJL0DVPFFG)](https://codecov.io/gh/evroon/bracket)
[![backend](https://github.com/evroon/bracket/actions/workflows/backend.yml/badge.svg)](https://github.com/evroon/bracket/actions/workflows/backend.yml)
[![frontend](https://github.com/evroon/bracket/actions/workflows/frontend.yml/badge.svg)](https://github.com/evroon/bracket/actions/workflows/frontend.yml)
[![last commit](https://img.shields.io/github/last-commit/evroon/bracket)](https://img.shields.io/github/last-commit/evroon/bracket)
[![release](https://img.shields.io/github/v/release/evroon/bracket)](https://img.shields.io/github/v/release/evroon/bracket)

<br/>

> **Warning** This project is still under construction and considered beta software.
> Release v1.0.0 will be the first out-of-beta release.

Ladder tournament system meant to be easy to use.
Bracket is written in async Python (with [FastAPI](https://fastapi.tiangolo.com)) and Next.js as frontend using the [Mantine](https://mantine.dev/) library.


### Preview
<img alt="" src="misc/img/schedule_preview.png" width="100%" />

# Quickstart
To quickly run bracket to see how it works, clone it and run `docker-compose up`:
```shell
git clone git@github.com:evroon/bracket.git
cd bracket
sudo docker-compose up -d
```

This will start the backend and frontend of Bracket, as well as a postgres instance. You should now
be able to view bracket at http://localhost:3000. You can log in with username `test@example.org`
and password `aeGhoe1ahng2Aezai0Dei6Aih6dieHoo`.

To insert dummy rows into the database, run:
```shell
sudo docker exec bracket-backend pipenv run ./cli.py create-dev-db
```

# Setup
## Database
First create a `bracket` cluster:
```shell
sudo pg_createcluster -u postgres -p 5532 13 bracket
pg_ctlcluster 13 bracket start
```

Subsequently, create a new `bracket_dev` database:
```shell
sudo -Hu postgres psql  -p 5532
CREATE USER bracket_dev WITH PASSWORD 'bracket_dev';
CREATE DATABASE bracket_dev OWNER bracket_dev;
```

You can do the same but replace the user and database name with:
- `bracket_ci`: for running tests
- `bracket_prod`: for a production database

The database URL can be specified per environment in the `.env` files (see [config](#config)).

## Config
Copy [ci.env](backend/ci.env) to `prod.env` and fill in the values:
- `PG_DSN`: The URL of the PostgreSQL database
- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`: Specify allowed frontend domain names for CORS (see the [FastAPI docs](https://fastapi.tiangolo.com/tutorial/cors/))
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: The credentials of the admin user, which is created when initializing the database


## Running the frontend and backend
The following starts the frontend and backend for local development:
### Frontend
```
cd frontend
yarn run dev
```

### Backend
```
cd backend
pipenv install -d
pipenv shell
./run.sh
```
