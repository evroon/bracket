---
sidebar_position: 2
---

# Configuration

Copy `ci.env` to `prod.env` and fill in the values:
- `PG_DSN`: The URL of the PostgreSQL database
- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`: Specify allowed frontend domain names for CORS (see the [FastAPI docs](https://fastapi.tiangolo.com/tutorial/cors/))
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: The credentials of the admin user, which is created when initializing the database
- `SENTRY_DSN`: The [Sentry](https://sentry.io) DSN  for monitoring and error tracking

## Example configuration file
This is an example of how the config file should look like:
```
PG_DSN='postgresql://bracket_ci:bracket_ci@localhost:5532/bracket_ci'
JWT_SECRET='60eed5c5dc7a919b8595a23d6c42ddd8274e4feea651dc028d9bee495bbb9acd'
CORS_ORIGINS='https://bracket.mydomain.com'
CORS_ORIGIN_REGEX='https://.*\.vercel\.app'
ADMIN_EMAIL='admin@example.com'
ADMIN_PASSWORD='some unused password'
SENTRY_DSN='my sentry dsn'
```
