---
sidebar_position: 2
---

# Developing

This guide explains how to run Bracket without Docker. They cover database setup, configuration and
how to run the frontend and backend. If you quickly want to get up and running, please read
[quickstart.md](../running-bracket/quickstart.md).

## Database

First create a `bracket` cluster:

```bash
sudo pg_createcluster -u postgres -p 5532 13 bracket
pg_ctlcluster 13 bracket start
```

Subsequently, create a new `bracket_dev` database. First connect via `sudo -Hu postgres psql -p
5532`, and then run:

```sql
CREATE USER bracket_dev WITH PASSWORD 'bracket_dev';
CREATE DATABASE bracket_dev OWNER bracket_dev;
```

You can do the same but replace the user and database name with:

- `bracket_ci`: for running tests
- `bracket_prod`: for a production database

The database URL can be specified per environment in the `.env` files (see
[config](../running-bracket/configuration.md)).

## Running the frontend and backend

To run Bracket (frontend and backend) locally without Docker, one needs `yarn` and `pipenv`.

The following starts the frontend and backend for local development in the root
directory of Bracket:

```shell
./run.sh
```

If either the frontend or backend doesn't shut down correctly, you can run (on Linux)
`killall gunicorn node`.

But **be careful** that this will also kill other gunicorn and node processes.

In case you want to run the frontend and backend yourself, see the following
two sections.

### Frontend

```bash
cd frontend
yarn run dev
```

### Backend

```bash
cd backend
pipenv install -d
pipenv shell
./run.sh
```
