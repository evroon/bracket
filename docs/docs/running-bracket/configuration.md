---
sidebar_position: 2
---

# Configuration

## Backend

Copy `ci.env` to `prod.env` and fill in the values:

- `PG_DSN`: The URL of the PostgreSQL database
- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`: Specify allowed frontend domain names for CORS (see the
  [FastAPI docs](https://fastapi.tiangolo.com/tutorial/cors/))
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: The credentials of the admin user, which is created when
  initializing the database
- `SENTRY_DSN`: The [Sentry](https://sentry.io) DSN  for monitoring and error tracking
- `BASE_URL`: The base url of the API used for SSO
- `ALLOW_USER_REGISTRATION`: Can be used to disallow user registration in the web app, currently
  used for production while bracket is still in beta
- `ALLOW_INSECURE_HTTP_SSO`: Should not be used in production. Allows use of INSECURE requests for
  SSO auth.
- `AUTO_RUN_MIGRATIONS`: Whether to run (alembic) migrations automatically on startup or not.
  Migrations can be applied manually using `pipenv run alembic upgrade head`.

### Backend: Example configuration file

This is an example of how the config file should look like:

```bash
PG_DSN='postgresql://bracket_ci:bracket_ci@localhost:5532/bracket_ci'
JWT_SECRET='60eed5c5dc7a919b8595a23d6c42ddd8274e4feea651dc028d9bee495bbb9acd'
CORS_ORIGINS='https://bracket.mydomain.com'
CORS_ORIGIN_REGEX='https://.*\.vercel\.app'
ADMIN_EMAIL='admin@example.com'
ADMIN_PASSWORD='some unused password'
SENTRY_DSN='my sentry dsn'
ALLOW_USER_REGISTRATION=false
ALLOW_INSECURE_HTTP_SSO=false
CAPTCHA_SECRET='xxx'
AUTO_RUN_MIGRATIONS=true
```

## Frontend

- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: The HCaptcha key used for captcha challenges when creating new
  accounts. You get the secret when you create a new site in HCaptcha.
- `NEXT_PUBLIC_API_BASE_URL`:  The base URL of the backend API to which the frontend sends requests.
  For example: `https://api.bracket.com`
- `ANALYTICS_DATA_DOMAIN`: The `data-domain` attribute passed to the script for Plausible
  analytics
- `ANALYTICS_DATA_WEBSITE_ID`: The `data-website-id` attribute passed to the script for Umami
  analytics
- `ANALYTICS_SCRIPT_SRC`: The URL to the script for analytics purposes.

### Frontend: Example configuration file

You can store the config in `.env.local` (as described in the [Next docs][next-config-url]).

This is an example of how the config file should look like:

```shell
NEXT_PUBLIC_HCAPTCHA_SITE_KEY='10000000-ffff-ffff-ffff-000000000001'
NEXT_PUBLIC_API_BASE_URL='https://api.bracket.com'
ANALYTICS_SCRIPT_SRC='https://analytics.bracket.com/script.js'
ANALYTICS_DATA_DOMAIN='bracket.com'
ANALYTICS_DATA_WEBSITE_ID='bracket.com'
```

[next-config-url]: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#loading-environment-variables
