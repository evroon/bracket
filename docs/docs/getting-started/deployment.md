---
sidebar_position: 1
---

# Deploying Bracket

This guide explains how to run Bracket without Docker. If you quickly want to get up and running,
please read [quickstart.md](quickstart.md).

## Docker

Use the
[template docker-compose.yml](https://github.com/evroon/bracket/blob/master/docker-compose.yml)
to deploy Bracket using Docker.

## As systemd services

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
pipenv install
pipenv shell
./run.sh
```

## Configuration

### Backend configuration

The following configuration variables need to be adjusted for the backend to run it in production:

- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `PG_DSN`: The URL of the PostgreSQL database
- `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`: Specify allowed frontend domain names for CORS (see the
  [FastAPI docs](https://fastapi.tiangolo.com/tutorial/cors/)).
  For example: `CORS_ORIGINS=https://frontend.bracket.com`.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: The credentials of the admin user, which is created when
  initializing the database. It's important to not leave it to the default values.
- `ALLOW_INSECURE_HTTP_SSO`: Must be set to `false`

Optional:

- `SENTRY_DSN`: The [Sentry](https://sentry.io) DSN  for monitoring and error tracking
- `BASE_URL`: The base url of the API used for SSO

### Frontend configuration

The following configuration variables need to be adjusted for the frontend to run it in production:

- `NEXT_PUBLIC_API_BASE_URL`: The base URL of the backend API to which the frontend sends requests.
  For example: `https://api.bracket.com`

Optional:

- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: The HCaptcha key used for captcha challenges when creating new
  accounts. You get the secret when you create a new site in HCaptcha. If left blank, HCaptcha will
  be disabled for your site.
