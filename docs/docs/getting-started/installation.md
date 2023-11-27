---
sidebar_position: 1
---

# Installation
This guide explains how to run Bracket without Docker. If you quickly want to get up and running, please read [quickstart.md](quickstart.md).

## Database
First create a `bracket` cluster:
```bash
sudo pg_createcluster -u postgres -p 5532 13 bracket
pg_ctlcluster 13 bracket start
```

Subsequently, create a new `bracket_dev` database. First connect via `sudo -Hu postgres psql -p 5532`, and then run:
```sql
CREATE USER bracket_dev WITH PASSWORD 'bracket_dev';
CREATE DATABASE bracket_dev OWNER bracket_dev;
```

You can do the same but replace the user and database name with:
- `bracket_ci`: for running tests
- `bracket_prod`: for a production database

The database URL can be specified per environment in the `.env` files (see [config](#config)).

## Running the frontend and backend
The following starts the frontend and backend for local development:
### Frontend
```bash
cd frontend
yarn
npm run dev
```

### Backend
```bash
cd backend
pipenv install -d
pipenv shell
./run.sh
```
