<img align="left" alt="Favicon of Bracket" src="frontend/public/favicon.svg" height="130" />

# Bracket
[![codecov](https://codecov.io/gh/evroon/bracket/branch/master/graph/badge.svg?token=YJL0DVPFFG)](https://codecov.io/gh/evroon/bracket)
[![backend](https://github.com/evroon/bracket/actions/workflows/backend.yml/badge.svg)](https://github.com/evroon/bracket/actions/workflows/backend.yml)
[![frontend](https://github.com/evroon/bracket/actions/workflows/frontend.yml/badge.svg)](https://github.com/evroon/bracket/actions/workflows/frontend.yml)
[![last
commit](https://img.shields.io/github/last-commit/evroon/bracket)](https://img.shields.io/github/last-commit/evroon/bracket)
[![release](https://img.shields.io/github/v/release/evroon/bracket)](https://img.shields.io/github/v/release/evroon/bracket)

<br/>

Tournament system meant to be easy to use. Bracket is written in async Python (with
[FastAPI](https://fastapi.tiangolo.com)) and [Next.js](https://nextjs.org/) as frontend using the
[Mantine](https://mantine.dev/) library.

It has the following features:
- Supports **single elimination, round-robin and swiss** formats.
- **Build your tournament structure** with multiple stages that can have multiple groups/brackets in
  them.
- **Drag-and-drop matches** to different courts or reschedule them to another start time.
- Various **dashboard pages** are available that can be presented to the public, customized with a
  logo.
- Create/update **teams**, and add players to **teams**.
- Create **multiple clubs**, with **multiple tournaments** per club.
- **Swiss tournaments** can be handled dynamically, with automatic scheduling of matches.

### Preview
<img alt="" src="docs/static/img/bracket-screenshot-design.png" width="100%" />


# Quickstart
To quickly run bracket to see how it works, clone it and run `docker-compose up`:
```bash
git clone git@github.com:evroon/bracket.git
cd bracket
sudo docker-compose up -d
```

This will start the backend and frontend of Bracket, as well as a postgres instance. You should now
be able to view bracket at http://localhost:3000. You can log in with username `test@example.org`
and password `aeGhoe1ahng2Aezai0Dei6Aih6dieHoo`.

To insert dummy rows into the database, run:
```bash
sudo docker exec bracket-backend pipenv run ./cli.py create-dev-db
```

# Setup for development
The following sections describe how to run Bracket locally without Docker. They cover
database setup, configuration and how to run the frontend and backend.

## Database
First create a `bracket` cluster:
```bash
sudo pg_createcluster -u postgres -p 5532 16 bracket
pg_ctlcluster 16 bracket start
```

Subsequently, create a new `bracket_dev` database:
```bash
sudo -Hu postgres psql  -p 5532
CREATE USER bracket_dev WITH PASSWORD 'bracket_dev';
CREATE DATABASE bracket_dev OWNER bracket_dev;
```

You can do the same but replace the user and database name with:
- `bracket_ci`: for running tests
- `bracket_prod`: for a production database

The database URL can be specified per environment in the `.env` files (see [config](#config)).

Read the full documentation about setting up Bracket [in the docs](https://evroon.github.io/bracket/docs/getting-started/installation).

## Config
Copy [ci.env](backend/ci.env) to `prod.env` and fill in the values:
- `PG_DSN`: The URL of the PostgreSQL database
- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`: Specify allowed frontend domain names for CORS (see the
  [FastAPI docs](https://fastapi.tiangolo.com/tutorial/cors/))
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: The credentials of the admin user, which is created when
  initializing the database

Read more about configuration [in the docs](https://evroon.github.io/bracket/docs/getting-started/configuration).


## Running the frontend and backend for development
To run Bracket (frontend and backend) locally without Docker, one needs `yarn` and `pipenv`.

The following starts the frontend and backend for local development in the root
directory of Bracket:

```shell
./run.sh
```

If either the frontend or backend doesn't shut down correctly, you can run (on Linux) `killall gunicorn node`.
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

# Translations
Based on your browser settings, your language should be automatically detected and loaded. For now,
there's no manual way of choosing a different language.

## Supported Languages

- 🇺🇸 English `en-US` - *Default*
- 🇨🇳 Chinese `zh-CN` - Contributed by @Sevichecc

# More screenshots
<img alt="" src="docs/static/img/schedule_preview.png" width="50%" /><img alt=""
src="docs/static/img/planning_preview.png" width="50%" /> <img alt=""
src="docs/static/img/builder_preview.png" width="50%" /><img alt=""
src="docs/static/img/standings_preview.png" width="50%" />

# Help
If you're having trouble getting Bracket up and running, or have a question about usage or configuration, feel free to ask.
The best place to do this is by creating a [Discussion](https://github.com/evroon/bracket/discussions).

# Supporting Bracket
If you're using Bracket and would like to help support its development, that would be greatly appreciated!

Several areas that we need a bit of help with at the moment are:
- ⭐ **Star Bracket** on GitHub
- 🌐 **Translating**: Help make Bracket available to non-native English speakers by adding your language
- 📣 **Spread the word** by sharing Bracket to help new users discover it
- 🖥️ **Submit a PR** to add a new feature, fix a bug, extend/update the docs or something else

# License
Bracket is licensed under AGPL-v3.0
See [LICENSE](LICENSE)
