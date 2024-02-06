---
sidebar_position: 0
---

# Quickstart

To quickly run bracket to see how it works, clone it and run `docker-compose up`:

```bash
git clone git@github.com:evroon/bracket.git
cd bracket
sudo docker-compose up -d
```

This will start the backend and frontend of Bracket, as well as a postgres instance. You should now
be able to view bracket at `http://localhost:3000`. You can log in with the following credentials:

- Username: `test@example.org`
- Password: `aeGhoe1ahng2Aezai0Dei6Aih6dieHoo`.

To insert dummy rows into the database, run:

```bash
sudo docker exec bracket-backend pipenv run ./cli.py create-dev-db
```
