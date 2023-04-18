---
sidebar_position: 2
---

# Configuration

Copy `ci.env` to `prod.env` and fill in the values:
- `PG_DSN`: The URL of the PostgreSQL database
- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`: Specify allowed frontend domain names for CORS (see the [FastAPI docs](https://fastapi.tiangolo.com/tutorial/cors/))
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: The credentials of the admin user, which is created when initializing the database
