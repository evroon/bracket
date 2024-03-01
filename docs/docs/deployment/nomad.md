# Nomad

This section describes how to deploy Bracket (frontend and backend) to
[Nomad](https://www.nomadproject.io).

First, make sure you have a running Nomad cluster. See the
[production deployment guide](https://developer.hashicorp.com/nomad/tutorials/enterprise/production-deployment-guide-vm-with-consul) on how to achieve that. <!-- markdownlint-disable-line line-length no-inline-html -->

Then, you can use the following files describing the tasks for the backend and frontend.

## Backend

```hcl
job "bracket-backend" {
  datacenters = ["*"]

  group "servers" {
    count = 1

    network {
      port "uvicorn" {
        to = 8400
      }
    }

    service {
      provider = "nomad"
      port     = "uvicorn"
    }

    task "api" {
      driver = "docker"
      
      env {
        ENVIRONMENT = "PRODUCTION"
        PG_DSN = "postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod"
        JWT_SECRET = "38af87ade31804cc115166f605586a57c6533eeb4342e66c5229f44a76afdde4"
        AUTO_RUN_MIGRATIONS = "false"
      }

      config {
        image   = "ghcr.io/evroon/bracket-backend"
        ports   = ["uvicorn"]
        command = "pipenv"
        args    = [
          "run",
          "uvicorn",
          "bracket.app:app",
          "--port",
          "${NOMAD_PORT_uvicorn}",
          "--host",
          "0.0.0.0",
       ]
      }

      resources {
        cpu    = 256
        memory = 512
      }
    }
  }
}
```

## Frontend

```hcl
job "bracket-frontend" {
  datacenters = ["*"]

  group "servers" {
    count = 1

    network {
      port "nextjs" { }
    }

    service {
      provider = "nomad"
      port     = "nextjs"
    }

    task "api" {
      driver = "docker"
      
      env {
        NEXT_PUBLIC_API_BASE_URL = "https://my.bracketdomain.com"
        NEXT_PUBLIC_HCAPTCHA_SITE_KEY = "xxxxx"
        NODE_ENV = "production"
      }

      config {
        image   = "ghcr.io/evroon/bracket-frontend"
        ports   = ["nextjs"]
        args = ["yarn", "start", "-p", "${NOMAD_PORT_nextjs}"]
      }

      resources {
        cpu    = 256
        memory = 512
      }
    }
  }
}
```
