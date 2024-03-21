# Docker

This section describes how to deploy Bracket (frontend and backend) to docker using docker-compose.

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
            NODE_ENV: "production"
        restart: unless-stopped

    bracket-backend:
        image: ghcr.io/evroon/bracket-backend
        container_name: bracket-backend
        ports:
            - "8400:8400"
        environment:
            ENVIRONMENT: "PRODUCTION"
            PG_DSN: "postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod"
        volumes:
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
```
