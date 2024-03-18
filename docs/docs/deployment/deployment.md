---
sidebar_position: 0
---

# Deployment

The guides in this directory explain how to run Bracket in production. If you quickly want to get up
and running, please read [quickstart.md](../running-bracket/quickstart.md).

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

See [the config docs](../running-bracket/configuration.md) for more information.

### Frontend configuration

The following configuration variables need to be adjusted for the frontend to run it in production:

- `NEXT_PUBLIC_API_BASE_URL`: The base URL of the backend API to which the frontend sends requests.
  For example: `https://api.bracket.com`

Optional:

- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: The HCaptcha key used for captcha challenges when creating new
  accounts. You get the secret when you create a new site in HCaptcha. If left blank, HCaptcha will
  be disabled for your site.

## Running in production

There's a few ways to run Bracket (frontend and backend) in production, such as via docker-compose
and Nomad. The frontend can also be deployed to a cloud service like Vercel. See the other pages in
this category for more details per platform.
