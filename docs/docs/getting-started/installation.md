---
sidebar_position: 1
---

# Installation


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

## Running the frontend and backend
The following starts the frontend and backend for local development:
### Frontend
```
cd frontend
yarn
npm run dev
```

### Backend
```
cd backend
pipenv install -d
pipenv shell
./run.sh
```
