---
sidebar_position: 3
---

# Deployment

This guide explains how to run Bracket in production with Docker. If you quickly want to get up and
running, please read [quickstart.md](quickstart.md).

## Docker
First, make sure you have docker and docker-compose installed.

Then, store the following YAML in a file called `docker-compose.yml` and run it using
`docker-compose up -d` in the same directory as the file:

```yaml
version: '3.1'

services:
    bracket-frontend:
        image: ghcr.io/evroon/bracket-frontend
        container_name: bracket-frontend
        ports:
            - "3000:3000"
        environment:
            NEXT_PUBLIC_API_BASE_URL: "https://bracket.mywebsite.com"
            # Go to https://dashboard.hcaptcha.com/signup, create a site and put the site key here
            NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "xxxxx"
        restart: unless-stopped

    bracket-backend:
        image: ghcr.io/evroon/bracket-backend
        container_name: bracket-backend
        ports:
            - "8400:8400"
        environment:
            ENVIRONMENT: "PRODUCTION"
            PG_DSN: "postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod"
        restart: unless-stopped
        depends_on:
          - postgres

    postgres:
        image: postgres
        restart: always
        environment:
          POSTGRES_DB: bracket_prod
          POSTGRES_USER: bracket_prod
          POSTGRES_PASSWORD: bracket_prod
```


## Configuration

### Backend configuration

The following configuration variables need to be adjusted for the backend to run it in production:

- `JWT_SECRET`: Create a random secret using `openssl rand -hex 32`
- `CORS_ORIGINS`: Set frontend domain names for CORS.
  For example: `CORS_ORIGINS=https://frontend.bracket.com`.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: It's important to not leave the admin credentials to the
  default values.
- `ALLOW_INSECURE_HTTP_SSO`: Must be set to `false`

Optional:

- `SENTRY_DSN`: The [Sentry](https://sentry.io) DSN  for monitoring and error tracking
- `BASE_URL`: The base url of the API used for SSO

See [the config docs](configuration.md) for more information.

### Frontend configuration

The following configuration variables need to be adjusted for the frontend to run it in production:

- `NEXT_PUBLIC_API_BASE_URL`: The base URL of the backend API to which the frontend sends requests.
  For example: `https://api.bracket.com`

Optional:

- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: The HCaptcha key used for captcha challenges when creating new
  accounts. You get the secret when you create a new site in HCaptcha. If left blank, HCaptcha will
  be disabled for your site.

# Deploy to cloud service


## Vercel
To deploy the frontend to Vercel, use the following link:

```text
https://vercel.com/new/project?template=https://github.com/evroon/bracket
```

Make sure to select the `frontend` directory as root directory, and use Next.js as framework.
