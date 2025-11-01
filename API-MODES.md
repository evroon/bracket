# API modes: Private vs Public

Overview
- The application supports two modes of API access.
- Private mode (recommended): only the frontend is public; the backend stays private and is reached via the frontend’s internal proxy.
- Public mode: both frontend and backend are public; the frontend calls the backend directly.

# Private mode (recommended)
## What it is
  - The backend is not exposed to the internet.
  - The frontend exposes an internal proxy under /api that forwards requests to the backend inside the Docker network.
  - This eliminates CORS issues and reduces the attack surface.
## How it works
  - Browser → Frontend (public) → /api/... → Frontend proxy → Backend (private) → Response → Browser.
## Configure
  - Frontend
    - NEXT_PUBLIC_USE_PRIVATE_API = "true" (string)
    - INTERNAL_API_BASE_URL points to the backend service URL on the Docker network (for example: http://bracket-backend:8400)
    - Expose only the frontend port publicly (for example: 3000)
  - Backend
    - Do not publish the backend port; the backend must be reachable only from the Docker network
    - CORS_ORIGINS must include the frontend container origin (for example: http://bracket-frontend:3000)
    - BASE_URL is your public site URL (for example: https://yourdomain.com)
## When to use
  - Production behind Cloudflare/Nginx
  - Single-frontend deployments where the backend should not be directly reachable

## Example Docker-Compose in Private Mode
```bash
networks:
  bracket_lan:
    driver: bridge

volumes:
  bracket_pg_data:

services:
  bracket-backend:
    container_name: bracket-backend
    depends_on:
      - postgres
    environment:
      ENVIRONMENT: PRODUCTION
      # CORS - Internal communication between frontend and backend
      CORS_ORIGINS: http://bracket-frontend:3000
      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod
      JWT_SECRET: change_me_in_production
      ADMIN_EMAIL: admin@yourdomain.com
      ADMIN_PASSWORD: change_me_in_production
      BASE_URL: https://youdomain.com
    image: ghcr.io/evroon/bracket-backend
    networks:
      - bracket_lan
    # Backend is PRIVATE - Uncomment ports below for PUBLIC API mode
    # ports:
    #   - "8400:8400"
    restart: unless-stopped
    volumes:
      - ./backend/static:/app/static

  bracket-frontend:
    container_name: bracket-frontend
    environment:
      # Private API mode - Uses internal proxy to communicate with backend
      NEXT_PUBLIC_USE_PRIVATE_API: "true"
      # Backend URL (for proxy reference)
      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400
      # Internal URL for proxy (server-side only)
      INTERNAL_API_BASE_URL: http://bracket-backend:8400
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"
    # Use local image with internal proxy
    image: ghcr.io/evroon/bracket-frontend
    networks:
      - bracket_lan
    ports:
      - "3000:3000"
    restart: unless-stopped

  postgres:
    environment:
      POSTGRES_DB: bracket_prod
      POSTGRES_PASSWORD: bracket_prod
      POSTGRES_USER: bracket_prod
    image: postgres
    networks:
      - bracket_lan
    restart: always
    volumes:
      - bracket_pg_data:/var/lib/postgresql

```


# Public mode (direct API)
## What it is
  - Both frontend and backend are publicly accessible.
  - The frontend calls the backend directly using the public API URL.
## Configure
  - Frontend
    - NEXT_PUBLIC_USE_PRIVATE_API = "false" (string)
    - NEXT_PUBLIC_API_BASE_URL is the public API URL (for example: https://api.yourdomain.com)
  - Backend
    - Publish the backend port (for example: 8400)
    - CORS_ORIGINS must include the public frontend domain (for example: https://yourdomain.com)
    - BASE_URL is the public API base URL (for example: https://api.yourdomain.com)
## When to use
  - Multi-client scenarios (mobile + web) or when third parties must call your API directly

## Example Docker-Compose Direct Api
```bash
networks:
  bracket_lan:
    driver: bridge

volumes:
  bracket_pg_data:

services:
  bracket-backend:
    container_name: bracket-backend
    depends_on:
      - postgres
    environment:
      # Private API mode - Uses internal proxy to communicate with backend
      ENVIRONMENT: PRODUCTION
      # CORS - Internal communication between frontend and backend
      CORS_ORIGINS: https://youdomain.com
      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod
      JWT_SECRET: change_me_in_production
      ADMIN_EMAIL: admin@yourdomain.com
      ADMIN_PASSWORD: change_me_in_production
      BASE_URL: https://youdomain.com
    image: ghcr.io/evroon/bracket-backend
    networks:
      - bracket_lan
    # Backend for PUBLIC API mode
    ports:
      - "8400:8400"
    restart: unless-stopped
    volumes:
      - ./backend/static:/app/static

  bracket-frontend:
    container_name: bracket-frontend
    environment:
      # Private API mode - Uses internal proxy to communicate with backend
      NEXT_PUBLIC_USE_PRIVATE_API: "false"
      # Backend URL (for proxy reference)
      NEXT_PUBLIC_API_BASE_URL: https://api.youdomain.com
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"
    # Use local image with internal proxy
    image: ghcr.io/evroon/bracket-frontend
    networks:
      - bracket_lan
    ports:
      - "3000:3000"
    restart: unless-stopped

  postgres:
    environment:
      POSTGRES_DB: bracket_prod
      POSTGRES_PASSWORD: bracket_prod
      POSTGRES_USER: bracket_prod
    image: postgres
    networks:
      - bracket_lan
    restart: always
    volumes:
      - bracket_pg_data:/var/lib/postgresql

```

# Environment variables
- Frontend
  - NEXT_PUBLIC_USE_PRIVATE_API: "true" or "false" to select Private or Public mode
  - NEXT_PUBLIC_API_BASE_URL: public backend URL used by the browser in Public mode
  - INTERNAL_API_BASE_URL: internal backend URL used by the proxy in Private mode
  - NEXT_PUBLIC_HCAPTCHA_SITE_KEY: hCaptcha site key used by forms
- Backend
  - ENVIRONMENT: typically PRODUCTION
  - CORS_ORIGINS: comma-separated list of allowed origins
  - PG_DSN: PostgreSQL connection string
  - JWT_SECRET: secret for signing tokens
  - ADMIN_EMAIL and ADMIN_PASSWORD: initial admin user
  - BASE_URL: public base URL of the app (Private mode: site URL; Public mode: API URL)
- Important
  - Variables prefixed with NEXT_PUBLIC_ are embedded at build time in Next.js. Changing them requires rebuilding the frontend image and restarting the container.
  - Backend variable changes usually require only a container restart.

# Docker Compose hints
- Private mode
  - Publish only the frontend service port.
  - Do not publish the backend port; both services must share the same private Docker network.
  - Set NEXT_PUBLIC_USE_PRIVATE_API to "true" and INTERNAL_API_BASE_URL to the backend service URL.
  - Set backend CORS_ORIGINS to the frontend container origin (for example: http://bracket-frontend:3000).
- Public mode
  - Publish both frontend and backend ports.
  - Set NEXT_PUBLIC_USE_PRIVATE_API to "false" and NEXT_PUBLIC_API_BASE_URL to the public API URL.
  - Set backend CORS_ORIGINS to include the public frontend domain.

# Reverse proxy notes
- Private mode
  - Only proxy the frontend (for example: Cloudflare/Nginx → frontend:3000).
  - Do not expose the backend externally.
- Public mode
  - Proxy both frontend and backend using separate hostnames (for example: yourdomain.com → frontend, api.yourdomain.com → backend).

# Troubleshooting
- Browser shows requests to bracket-backend:8400 or net::ERR_NAME_NOT_RESOLVED
  - Cause: the browser is trying to reach the internal Docker hostname directly.
  - Fix: use Private mode (NEXT_PUBLIC_USE_PRIVATE_API = "true") so the frontend proxy is used, or set NEXT_PUBLIC_API_BASE_URL to a public URL in Public mode.
- CORS policy errors
  - Cause: backend CORS_ORIGINS does not match the actual frontend origin.
  - Fix: in Private mode, allow http://bracket-frontend:3000; in Public mode, allow the public frontend domain.
- NEXT_PUBLIC_* changes not reflected
  - Cause: these variables are baked into the Next.js build.
  - Fix: rebuild the frontend image without cache and restart the container.
- Verifying Private mode in the browser
  - In the Network tab, API calls should appear under /api/... on the same origin, not direct calls to the backend hostname.

# Which mode should I use?
- Use Private mode for most deployments: simpler SSL, no CORS, smaller attack surface.
- Use Public mode when the API must be directly reachable by other clients or services.

**Default recommendation:** Use **Private Mode** for most deployments.
