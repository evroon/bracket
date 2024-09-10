# Docker

This section describes how to deploy Bracket (frontend and backend) to docker using docker-compose.

## 1. Install Docker and docker compose

First, make sure you have docker and docker compose installed.

## 2. Store the docker-compose.yml file

Then, store the following YAML in a file called `docker-compose.yml` in an empty directory.

The highlighted lines will be discussed in the next steps.

```yaml
services:
    bracket-frontend:
        image: ghcr.io/evroon/bracket-frontend
        container_name: bracket-frontend
        ports:
            - "3000:3000"
        environment:
            NODE_ENV: "production"
            // highlight-start
            NEXT_PUBLIC_API_BASE_URL: "http://your-site.com:8400"
            NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"
            // highlight-end
        restart: unless-stopped

    bracket-backend:
        image: ghcr.io/evroon/bracket-backend
        container_name: bracket-backend
        ports:
            - "8400:8400"
        environment:
            ENVIRONMENT: "PRODUCTION"
            // highlight-start
            PG_DSN: "postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod"
            CORS_ORIGINS: https://your-site.com
            JWT_SECRET: change_me
            // highlight-end
        volumes:
            // highlight-next-line
            - ./backend/static:/app/static
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
        volumes:
            // highlight-next-line
          - ./postgres:/var/lib/postgresql/data
```

## 3. Set up the environment variables

Replace the lines that are highlighted in the code block from the previous step.

Replace the following values for `bracket-frontend`:

- `NEXT_PUBLIC_API_BASE_URL`: The address of your backend. The frontend will send
  requests to this address.
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: Either leave empty to disable it or
  [signup for hCaptcha](https://dashboard.hcaptcha.com/signup), create a site and
  put the site key here

Replace the following values for `bracket-backend`:

- `PG_DSN`: The DSN with format `postgresql://<username>:<password>@<host>:<port>/<database>`
- `CORS_ORIGINS`: Put the address of your frontend here, it's used to make sure incoming requests
  can only come from your actual frontend
- `JWT_SECRET`: Generate a secret to create JWTs using `openssl rand -hex 32`

:::warning

Note that your `docker-compose.yml` file now contains secrets.
If you want a more secure setup, you can store secrets in separate files on the host and
load them via [docker secrets](https://docs.docker.com/compose/use-secrets/).

:::

## 4. Update volume bindings

Bracket needs two volume bindings: for the backend and for the database.

Update the two volume binding paths to point to a directory where you want to store the
persistent data.

## 5. Access the application

Run it using `docker compose up -d` in the same directory as the file.
Access Bracket at `http://localhost:3000`.
