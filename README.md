# Ladderz
Ladder tournament system meant to be really easy to use.

# Setup
### Frontend
```
yarn
npm run dev
```

### Backend
```
./run.sh
```


#### Database
Create a new `ladderz` database in a `ladderz` cluster:

```shell
sudo pg_createcluster -u postgres -p 5532 13 ladderz
pg_ctlcluster 13 ladderz start

```

```shell
sudo -Hu postgres psql  -p 5532
CREATE USER ladderz_ci WITH PASSWORD 'ladderz_ci';
CREATE DATABASE ladderz_ci OWNER ladderz_ci;
```

### Config
Put JWT_SECRET in prod.env using `openssl rand -hex 32`