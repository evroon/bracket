API modes: Private vs Public

Overview
- The application supports two modes of API access.
- Private mode (recommended): only the frontend is public; the backend stays private and is reached via the frontend’s internal proxy.
- Public mode: both frontend and backend are public; the frontend calls the backend directly.

Private mode (recommended)
- What it is
  - The backend is not exposed to the internet.
  - The frontend exposes an internal proxy under /api that forwards requests to the backend inside the Docker network.
  - This eliminates CORS issues and reduces the attack surface.
- How it works
  - Browser → Frontend (public) → /api/... → Frontend proxy → Backend (private) → Response → Browser.
- Configure
  - Frontend
    - NEXT_PUBLIC_USE_PRIVATE_API = "true" (string)
    - INTERNAL_API_BASE_URL points to the backend service URL on the Docker network (for example: http://bracket-backend:8400)
    - Expose only the frontend port publicly (for example: 3000)
  - Backend
    - Do not publish the backend port; the backend must be reachable only from the Docker network
    - CORS_ORIGINS must include the frontend container origin (for example: http://bracket-frontend:3000)
    - BASE_URL is your public site URL (for example: https://yourdomain.com)
- When to use
  - Production behind Cloudflare/Nginx
  - Single-frontend deployments where the backend should not be directly reachable

Public mode (direct API)
- What it is
  - Both frontend and backend are publicly accessible.
  - The frontend calls the backend directly using the public API URL.
- Configure
  - Frontend
    - NEXT_PUBLIC_USE_PRIVATE_API = "false" (string)
    - NEXT_PUBLIC_API_BASE_URL is the public API URL (for example: https://api.yourdomain.com)
  - Backend
    - Publish the backend port (for example: 8400)
    - CORS_ORIGINS must include the public frontend domain (for example: https://yourdomain.com)
    - BASE_URL is the public API base URL (for example: https://api.yourdomain.com)
- When to use
  - Multi-client scenarios (mobile + web) or when third parties must call your API directly

Environment variables
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

Docker Compose hints
- Private mode
  - Publish only the frontend service port.
  - Do not publish the backend port; both services must share the same private Docker network.
  - Set NEXT_PUBLIC_USE_PRIVATE_API to "true" and INTERNAL_API_BASE_URL to the backend service URL.
  - Set backend CORS_ORIGINS to the frontend container origin (for example: http://bracket-frontend:3000).
- Public mode
  - Publish both frontend and backend ports.
  - Set NEXT_PUBLIC_USE_PRIVATE_API to "false" and NEXT_PUBLIC_API_BASE_URL to the public API URL.
  - Set backend CORS_ORIGINS to include the public frontend domain.

Reverse proxy notes
- Private mode
  - Only proxy the frontend (for example: Cloudflare/Nginx → frontend:3000).
  - Do not expose the backend externally.
- Public mode
  - Proxy both frontend and backend using separate hostnames (for example: yourdomain.com → frontend, api.yourdomain.com → backend).

Troubleshooting
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

Which mode should I use?
- Use Private mode for most deployments: simpler SSL, no CORS, smaller attack surface.
- Use Public mode when the API must be directly reachable by other clients or services.
# API Configuration: Public vs Private Modes# API Configuration: Public vs Private Modes# API Configuration: Public vs Private Modes# API Configuration: Public vs Private



This project supports two API operation modes for different deployment scenarios.



---This project supports two API operation modes for different deployment scenarios.



## Private Mode (Recommended for Production)



### Overview---This project supports two API operation modes for different deployment scenarios.This project supports two API operation modes:



In Private Mode, the backend API is NOT exposed to the internet. The frontend acts as a transparent proxy, forwarding all API requests internally to the backend container. This provides enhanced security and eliminates CORS issues.



### Features## 🔒 Private Mode (Recommended for Production)



- Backend NOT accessible from Internet - Only internal Docker network access

- Enhanced security - Attack surface reduced

- Frontend acts as transparent proxy - Server-side forwarding via /api/* routes### Overview---## 🔒 Private Mode (Recommended)

- No CORS issues - Same-origin requests

- Single domain - Only frontend needs to be publicly exposed

- Users NEVER see internal URLs - All requests appear as frontend URLs

In **Private Mode**, the backend API is **NOT exposed to the internet**. The frontend acts as a transparent proxy, forwarding all API requests internally to the backend container. This provides enhanced security and eliminates CORS issues.

### What Users See



Users access:

- https://yourdomain.com/login### Features## 🔒 Private Mode (Recommended for Production)**Features:**

- https://yourdomain.com/tournaments

- All routes are frontend URLs



### What Happens Internally- ✅ **Backend NOT accessible from Internet** - Only internal Docker network access- ✅ Backend NOT accessible from Internet



The flow is transparent to users:- ✅ **Enhanced security** - Attack surface reduced



Browser Request: GET https://yourdomain.com/- ✅ **Frontend acts as transparent proxy** - Server-side forwarding via `/api/*` routes### Overview- ✅ Enhanced security

Next.js Frontend: Calls /api/clubs internally

Proxy Handler: /api/clubs → http://bracket-backend:8400/clubs- ✅ **No CORS issues** - Same-origin requests

Backend Response: Returns data to frontend

User Receives: Data rendered on page- ✅ **Single domain** - Only frontend needs to be publicly exposedIn **Private Mode**, the backend API is **NOT exposed to the internet**. The frontend acts as a transparent proxy, forwarding all API requests internally to the backend container. This provides enhanced security and eliminates CORS issues.- ✅ Frontend acts as transparent proxy



### Docker Compose Configuration- ✅ **Users NEVER see internal URLs** - All requests appear as frontend URLs



Method 1: Direct Configuration (Simplest)- ✅ No CORS issues



Edit docker-compose.yml:### What Users See



services:### Features- ✅ Centralized logging

  bracket-backend:

    container_name: bracket-backend```

    environment:

      ENVIRONMENT: PRODUCTION✅ https://yourdomain.com/login- ✅ **Backend NOT accessible from Internet** - Only internal Docker network access- ✅ **Users NEVER see /api in URLs**

      CORS_ORIGINS: http://bracket-frontend:3000

      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod✅ https://yourdomain.com/tournaments

      JWT_SECRET: change_me_in_production

      ADMIN_EMAIL: admin@yourdomain.com✅ https://yourdomain.com/ (all routes are frontend URLs)- ✅ **Enhanced security** - Attack surface reduced

      ADMIN_PASSWORD: change_me_in_production

      BASE_URL: https://yourdomain.com```

    image: ghcr.io/evroon/bracket-backend

    networks:- ✅ **Frontend acts as transparent proxy** - Server-side forwarding via `/api/*` routes**What users see:**

      - bracket_lan

    # Backend is PRIVATE - NO ports exposed### What Happens Internally (Transparent)

    restart: unless-stopped

- ✅ **No CORS issues** - Same-origin requests- ✅ `https://yourdomain.com/login`

  bracket-frontend:

    container_name: bracket-frontend```

    environment:

      NEXT_PUBLIC_USE_PRIVATE_API: "true"Browser Request:    GET https://yourdomain.com/- ✅ **Single domain** - Only frontend needs to be publicly exposed- ✅ `https://yourdomain.com/tournaments`

      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400

      INTERNAL_API_BASE_URL: http://bracket-backend:8400                    ↓

      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"

    image: bracket-frontend-localNext.js Frontend:   Calls /api/clubs internally- ✅ **Users NEVER see internal URLs** - All requests appear as frontend URLs- ✅ Normal frontend URLs

    networks:

      - bracket_lan                    ↓

    ports:

      - "3000:3000"Proxy Handler:      /api/clubs → http://bracket-backend:8400/clubs

    restart: unless-stopped

                    ↓

Method 2: Using Environment Files

Backend Response:   Returns data to frontend### What Users See**What happens internally (invisible):**

Create .env.private file:

                    ↓

NEXT_PUBLIC_USE_PRIVATE_API=true

CORS_ORIGINS=http://bracket-frontend:3000User Receives:      Data rendered on page```- 🔄 `yourdomain.com/api/token` → `bracket-backend:8400/token`

BACKEND_PORT_MAPPING=

INTERNAL_API_URL=http://bracket-backend:8400```

NEXT_PUBLIC_API_BASE_URL=http://bracket-backend:8400

FRONTEND_PORT_MAPPING=3000:3000✅ https://yourdomain.com/login- 🔄 Transparent server-side proxy

JWT_SECRET=change_me_in_production

ADMIN_EMAIL=admin@yourdomain.com### Docker Compose Configuration

ADMIN_PASSWORD=change_me_in_production

BASE_URL=https://yourdomain.com✅ https://yourdomain.com/tournaments

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

#### Method 1: Direct Configuration (Simplest)

Then use variables in docker-compose.yml:

✅ https://yourdomain.com/ (all routes are frontend URLs)**Configuration:**

services:

  bracket-backend:Edit `docker-compose.yml`:

    environment:

      CORS_ORIGINS: ${CORS_ORIGINS}``````bash

      JWT_SECRET: ${JWT_SECRET}

      ADMIN_EMAIL: ${ADMIN_EMAIL}```yaml

      ADMIN_PASSWORD: ${ADMIN_PASSWORD}

      BASE_URL: ${BASE_URL}services:./switch-api-mode.sh private

    ports:

      - "${BACKEND_PORT_MAPPING:-}"  bracket-backend:



  bracket-frontend:    container_name: bracket-backend### What Happens Internally (Transparent)docker-compose down && docker-compose up -d

    environment:

      NEXT_PUBLIC_USE_PRIVATE_API: ${NEXT_PUBLIC_USE_PRIVATE_API}    environment:

      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}

      INTERNAL_API_BASE_URL: ${INTERNAL_API_URL}      ENVIRONMENT: PRODUCTION``````

    ports:

      - "${FRONTEND_PORT_MAPPING}"      # CORS - Only allow internal frontend communication



### Deployment      CORS_ORIGINS: http://bracket-frontend:3000Browser Request:    GET https://yourdomain.com/



Using .env.private:      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod



cp .env.private .env      JWT_SECRET: change_me_in_production                    ↓**Nginx (frontend only):**

docker-compose down

docker-compose up -d      ADMIN_EMAIL: admin@yourdomain.com



Or with direct configuration:      ADMIN_PASSWORD: change_me_in_productionNext.js Frontend:   Calls /api/clubs internally```nginx



docker-compose down      BASE_URL: https://yourdomain.com

docker-compose up -d

    image: ghcr.io/evroon/bracket-backend                    ↓server {

### Nginx Configuration (Frontend Only)

    networks:

server {

    listen 443 ssl http2;      - bracket_lanProxy Handler:      /api/clubs → http://bracket-backend:8400/clubs    server_name yourdomain.com;

    server_name yourdomain.com;

    # Backend is PRIVATE - NO ports exposed

    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;    restart: unless-stopped                    ↓    location / {



    location / {

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;  bracket-frontend:Backend Response:   Returns data to frontend        proxy_pass http://172.16.0.4:3000;

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection 'upgrade';    container_name: bracket-frontend

        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;    environment:                    ↓    }

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;      # Enable Private API mode

        proxy_set_header X-Forwarded-Proto $scheme;

    }      NEXT_PUBLIC_USE_PRIVATE_API: "true"User Receives:      Data rendered on page}

}

      # Internal backend URL (for proxy)

---

      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400``````

## Public Mode (Direct API Access)

      INTERNAL_API_BASE_URL: http://bracket-backend:8400

### Overview

      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"

In Public Mode, both frontend and backend are exposed to the internet. The frontend makes direct requests to the backend API. This requires proper CORS configuration and typically uses two subdomains.

    image: bracket-frontend-local  # Must use local image with proxy

### Features

    networks:### Docker Compose Configuration## 🌐 Public Mode

- Backend accessible from Internet - Requires security considerations

- Requires CORS configuration - Cross-origin requests must be allowed      - bracket_lan

- Two domains/subdomains needed - Frontend and API separately exposed

- Potentially lower latency - Direct backend communication    ports:

- API can be used by other clients - Third-party integrations possible

      - "3000:3000"  # Only frontend is exposed

### What Users See

    restart: unless-stopped**Method 1: Direct Configuration (Simplest)****Features:**

Users access:

- https://yourdomain.com/login```

- Browser requests go to: https://api.yourdomain.com/token

- Browser requests go to: https://api.yourdomain.com/clubs- ⚠️ Backend accessible from Internet



### Docker Compose Configuration#### Method 2: Using Environment Files



Method 1: Direct ConfigurationEdit `docker-compose.yml`:- ⚠️ Requires correct CORS configuration



Edit docker-compose.yml:Create `.env.private`:



services:- ⚠️ Two subdomains needed

  bracket-backend:

    container_name: bracket-backend```bash

    environment:

      ENVIRONMENT: PRODUCTION# Private API Mode - Backend NOT publicly accessible```yaml- ✅ Potentially lower latency

      CORS_ORIGINS: https://yourdomain.com,http://localhost:3000

      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prodNEXT_PUBLIC_USE_PRIVATE_API=true

      JWT_SECRET: change_me_in_production

      ADMIN_EMAIL: admin@yourdomain.comCORS_ORIGINS=http://bracket-frontend:3000services:

      ADMIN_PASSWORD: change_me_in_production

      BASE_URL: https://api.yourdomain.comBACKEND_PORT_MAPPING=

    image: ghcr.io/evroon/bracket-backend

    networks:INTERNAL_API_URL=http://bracket-backend:8400  bracket-backend:**What users see:**

      - bracket_lan

    ports:NEXT_PUBLIC_API_BASE_URL=http://bracket-backend:8400

      - "8400:8400"

    restart: unless-stoppedFRONTEND_PORT_MAPPING=3000:3000    container_name: bracket-backend- ✅ `https://yourdomain.com/login`



  bracket-frontend:JWT_SECRET=change_me_in_production

    container_name: bracket-frontend

    environment:ADMIN_EMAIL=admin@yourdomain.com    environment:- ⚠️ Requests go to `https://api.yourdomain.com/token`

      NEXT_PUBLIC_USE_PRIVATE_API: "false"

      NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.comADMIN_PASSWORD=change_me_in_production

      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"

    image: ghcr.io/evroon/bracket-frontendBASE_URL=https://yourdomain.com      ENVIRONMENT: PRODUCTION

    networks:

      - bracket_lanNEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

    ports:

      - "3000:3000"```      # CORS - Only allow internal frontend communication**Configuration:**

    restart: unless-stopped



Method 2: Using Environment Files

Then use variables in `docker-compose.yml`:      CORS_ORIGINS: http://bracket-frontend:3000```bash

Create .env.public file:



NEXT_PUBLIC_USE_PRIVATE_API=false

CORS_ORIGINS=https://yourdomain.com,http://localhost:3000```yaml      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod./switch-api-mode.sh public

BACKEND_PORT_MAPPING=8400:8400

NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.comservices:

INTERNAL_API_URL=http://bracket-backend:8400

FRONTEND_PORT_MAPPING=3000:3000  bracket-backend:      JWT_SECRET: change_me_in_productiondocker-compose down && docker-compose up -d

JWT_SECRET=change_me_in_production

ADMIN_EMAIL=admin@yourdomain.com    environment:

ADMIN_PASSWORD=change_me_in_production

BASE_URL=https://api.yourdomain.com      CORS_ORIGINS: ${CORS_ORIGINS}      ADMIN_EMAIL: admin@yourdomain.com```

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

      JWT_SECRET: ${JWT_SECRET}

### Deployment

      ADMIN_EMAIL: ${ADMIN_EMAIL}      ADMIN_PASSWORD: change_me_in_production

Using .env.public:

      ADMIN_PASSWORD: ${ADMIN_PASSWORD}

cp .env.public .env

docker-compose down      BASE_URL: ${BASE_URL}      BASE_URL: https://yourdomain.com**Nginx (frontend + backend):**

docker-compose up -d

    ports:

### Nginx Configuration (Frontend + Backend)

      - "${BACKEND_PORT_MAPPING:-}"  # Empty = not exposed    image: ghcr.io/evroon/bracket-backend```nginx

Frontend:



server {

    listen 443 ssl http2;  bracket-frontend:    networks:# Frontend

    server_name yourdomain.com;

    environment:

    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;      NEXT_PUBLIC_USE_PRIVATE_API: ${NEXT_PUBLIC_USE_PRIVATE_API}      - bracket_lanserver {



    location / {      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;      INTERNAL_API_BASE_URL: ${INTERNAL_API_URL}    # Backend is PRIVATE - NO ports exposed    server_name yourdomain.com;

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection 'upgrade';    ports:

        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;      - "${FRONTEND_PORT_MAPPING}"    restart: unless-stopped    location / {

    }

}```



Backend API:        proxy_pass http://172.16.0.4:3000;



server {### Deployment

    listen 443 ssl http2;

    server_name api.yourdomain.com;  bracket-frontend:    }



    ssl_certificate /path/to/cert.pem;```bash

    ssl_certificate_key /path/to/key.pem;

# Using .env.private    container_name: bracket-frontend}

    location / {

        proxy_pass http://localhost:8400;cp .env.private .env

        proxy_http_version 1.1;

        proxy_set_header Host $host;docker-compose down    environment:

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;docker-compose up -d

        proxy_set_header X-Forwarded-Proto $scheme;

    }      # Enable Private API mode# Backend

}

# Or with direct configuration

---

docker-compose down      NEXT_PUBLIC_USE_PRIVATE_API: "true"server {

## Environment Variables Reference

docker-compose up -d

### Frontend Environment Variables

```      # Internal backend URL (for proxy)    server_name api.yourdomain.com;

Variable: NEXT_PUBLIC_USE_PRIVATE_API

Description: Enables/disables private API mode

Private Mode: "true"

Public Mode: "false"### Nginx Configuration (Frontend Only)      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400    location / {

Required: Yes



Variable: NEXT_PUBLIC_API_BASE_URL

Description: Backend API URL visible to browser```nginx      INTERNAL_API_BASE_URL: http://bracket-backend:8400        proxy_pass http://172.16.0.4:8400;

Private Mode: http://bracket-backend:8400

Public Mode: https://api.yourdomain.comserver {

Required: Yes

    listen 443 ssl http2;      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"    }

Variable: INTERNAL_API_BASE_URL

Description: Backend URL for server-side proxy    server_name yourdomain.com;

Private Mode: http://bracket-backend:8400

Public Mode: http://bracket-backend:8400    image: bracket-frontend-local  # Must use local image with proxy}

Required: Private only

    ssl_certificate /path/to/cert.pem;

Variable: NEXT_PUBLIC_HCAPTCHA_SITE_KEY

Description: hCaptcha site key for forms    ssl_certificate_key /path/to/key.pem;    networks:```

Private Mode: 10000000-ffff-ffff-ffff-000000000001 (test key)

Public Mode: Same

Required: Yes

    location / {      - bracket_lan

Important: NEXT_PUBLIC_* variables are embedded at build time in Next.js. Changes require rebuilding the Docker image.

        proxy_pass http://localhost:3000;

### Backend Environment Variables

        proxy_http_version 1.1;    ports:## Environment Variables

Variable: ENVIRONMENT

Description: Deployment environment        proxy_set_header Upgrade $http_upgrade;

Private Mode: PRODUCTION

Public Mode: PRODUCTION        proxy_set_header Connection 'upgrade';      - "3000:3000"  # Only frontend is exposed

Required: Yes

        proxy_set_header Host $host;

Variable: CORS_ORIGINS

Description: Allowed origin domains        proxy_cache_bypass $http_upgrade;    restart: unless-stopped| Variable | Description | Private | Public |

Private Mode: http://bracket-frontend:3000

Public Mode: https://yourdomain.com        proxy_set_header X-Real-IP $remote_addr;

Required: Yes

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;```|----------|-------------|---------|---------|

Variable: PG_DSN

Description: PostgreSQL connection string        proxy_set_header X-Forwarded-Proto $scheme;

Private Mode: postgresql://user:pass@postgres:5432/db

Public Mode: Same    }| `USE_PRIVATE_API` | Operation mode | `true` | `false` |

Required: Yes

}

Variable: JWT_SECRET

Description: Secret for JWT token signing```**Method 2: Using Environment Files**| `BACKEND_PORT_MAPPING` | Backend port | empty | `172.16.0.4:8400:8400` |

Private Mode: Strong random string

Public Mode: Same

Required: Yes

---| `CORS_ORIGINS` | Allowed domains | internal | public |

Variable: ADMIN_EMAIL

Description: Initial admin user email

Private Mode: admin@yourdomain.com

Public Mode: Same## 🌐 Public Mode (Direct API Access)Create `.env.private`:| `PUBLIC_API_URL` | Public API URL | `/api` | `https://api.yourdomain.com` |

Required: Yes



Variable: ADMIN_PASSWORD

Description: Initial admin password### Overview

Private Mode: Strong password

Public Mode: Same

Required: Yes

In **Public Mode**, both frontend and backend are exposed to the internet. The frontend makes direct requests to the backend API. This requires proper CORS configuration and typically uses two subdomains.```bash## Quick Switch

Variable: BASE_URL

Description: Public base URL of application

Private Mode: https://yourdomain.com

Public Mode: https://api.yourdomain.com### Features# Private API Mode - Backend NOT publicly accessible

Required: Yes



### Docker Compose Variables

- ⚠️ **Backend accessible from Internet** - Requires security considerationsNEXT_PUBLIC_USE_PRIVATE_API=true```bash

Variable: BACKEND_PORT_MAPPING

Description: Backend container port mapping- ⚠️ **Requires CORS configuration** - Cross-origin requests must be allowed

Private Mode: (empty or omit)

Public Mode: 8400:8400- ⚠️ **Two domains/subdomains needed** - Frontend and API separately exposedCORS_ORIGINS=http://bracket-frontend:3000# Secure mode (recommended)



Variable: FRONTEND_PORT_MAPPING- ✅ **Potentially lower latency** - Direct backend communication

Description: Frontend container port mapping

Private Mode: 3000:3000- ✅ **API can be used by other clients** - Third-party integrations possibleBACKEND_PORT_MAPPING=./switch-api-mode.sh private

Public Mode: 3000:3000



---

### What Users SeeINTERNAL_API_URL=http://bracket-backend:8400

## Quick Mode Switching



If using the switch-api-mode.sh script:

```NEXT_PUBLIC_API_BASE_URL=http://bracket-backend:8400# Public mode  

Switch to Private Mode (secure):

✅ https://yourdomain.com/login

./switch-api-mode.sh private

docker-compose down && docker-compose up -d⚠️ Browser requests go to: https://api.yourdomain.com/tokenFRONTEND_PORT_MAPPING=3000:3000./switch-api-mode.sh public



Switch to Public Mode:⚠️ Browser requests go to: https://api.yourdomain.com/clubs



./switch-api-mode.sh public```JWT_SECRET=change_me_in_production```

docker-compose down && docker-compose up -d



---

### Docker Compose ConfigurationADMIN_EMAIL=admin@yourdomain.com

## Troubleshooting



### Error: bracket-backend:8400 net::ERR_NAME_NOT_RESOLVED

#### Method 1: Direct ConfigurationADMIN_PASSWORD=change_me_in_production## Troubleshooting

Cause: Frontend is trying to connect directly to internal Docker hostname from browser.



Solutions:

1. Verify NEXT_PUBLIC_USE_PRIVATE_API="true" in frontend environmentEdit `docker-compose.yml`:BASE_URL=https://yourdomain.com

2. Ensure frontend image is bracket-frontend-local (has proxy code)

3. Rebuild frontend image: docker build -t bracket-frontend-local ./frontend

4. Check that /frontend/src/pages/api/[...path].ts exists in your source code

```yamlNEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001### Error: `bracket-backend:8400 not resolved`

### Error: CORS policy: No 'Access-Control-Allow-Origin' header

services:

Cause: Backend CORS settings don't match frontend origin.

  bracket-backend:```- Verify that `USE_PRIVATE_API=true` in `.env`

Solutions:

1. Private Mode: Set CORS_ORIGINS=http://bracket-frontend:3000 in backend    container_name: bracket-backend

2. Public Mode: Set CORS_ORIGINS=https://yourdomain.com in backend (match frontend domain)

3. Restart backend: docker-compose restart bracket-backend    environment:- Make sure `/pages/api/[...path].ts` file exists



### Backend not responding      ENVIRONMENT: PRODUCTION



Private Mode:      # CORS - Allow requests from frontend domainThen use variables in `docker-compose.yml`:

- Check frontend logs: docker-compose logs bracket-frontend

- Verify proxy is working: docker exec bracket-frontend curl http://bracket-backend:8400      CORS_ORIGINS: https://yourdomain.com,http://localhost:3000

- Ensure backend has no ports: section in docker-compose.yml

      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod### Error: `CORS policy`

Public Mode:

- Check backend logs: docker-compose logs bracket-backend      JWT_SECRET: change_me_in_production

- Verify backend port is exposed: docker-compose ps should show 8400:8400

- Test direct access: curl http://localhost:8400      ADMIN_EMAIL: admin@yourdomain.com```yaml- Public mode: verify `CORS_ORIGINS` in backend

- Check Nginx proxy configuration

      ADMIN_PASSWORD: change_me_in_production

### Frontend shows blank page or errors

      BASE_URL: https://api.yourdomain.comservices:- Private mode: should not occur

1. Check browser console (F12) for errors

2. Verify environment variables: docker exec bracket-frontend env | grep NEXT_PUBLIC    image: ghcr.io/evroon/bracket-backend

3. Ensure correct image is running: docker inspect bracket-frontend | grep Image

4. Clear browser cache (Ctrl+Shift+R) or try incognito mode    networks:  bracket-backend:



### Changes to environment variables not taking effect      - bracket_lan



For NEXT_PUBLIC_* variables:    # Backend is PUBLIC - Port exposed    environment:### Backend not responding

- These are embedded at build time in Next.js

- Must rebuild frontend image: docker build --no-cache -t bracket-frontend-local ./frontend    ports:

- Then restart: docker-compose up -d

      - "8400:8400"      CORS_ORIGINS: ${CORS_ORIGINS}- Private mode: check frontend logs

For backend variables:

- Simply restart: docker-compose restart bracket-backend    restart: unless-stopped



---      JWT_SECRET: ${JWT_SECRET}- Public mode: verify nginx points to `172.16.0.4:8400`



## Summary: Which Mode Should I Use?  bracket-frontend:



Scenario: Production deployment with Cloudflare/Nginx    container_name: bracket-frontend      ADMIN_EMAIL: ${ADMIN_EMAIL}

Recommended Mode: Private

Reason: Enhanced security, simpler SSL setup    environment:



Scenario: Development/testing      # Disable Private API mode      ADMIN_PASSWORD: ${ADMIN_PASSWORD}## Variables de Entorno

Recommended Mode: Private

Reason: Easier setup, no CORS issues      NEXT_PUBLIC_USE_PRIVATE_API: "false"



Scenario: Need third-party API access      # Public backend URL      BASE_URL: ${BASE_URL}

Recommended Mode: Public

Reason: Backend must be directly accessible      NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com



Scenario: Multi-client architecture (mobile app + web)      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"    ports:| Variable | Descripción | Privado | Público |

Recommended Mode: Public

Reason: Shared API endpoint    image: ghcr.io/evroon/bracket-frontend  # Can use official image



Scenario: Simple single-app deployment    networks:      - "${BACKEND_PORT_MAPPING:-}"  # Empty = not exposed|----------|-------------|---------|---------|

Recommended Mode: Private

Reason: Reduced attack surface      - bracket_lan



Default recommendation: Use Private Mode for most deployments.    ports:| `USE_PRIVATE_API` | Modo de operación | `true` | `false` |


      - "3000:3000"

    restart: unless-stopped  bracket-frontend:| `BACKEND_PORT_MAPPING` | Puerto del backend | vacío | `172.16.0.4:8400:8400` |

```

    environment:| `CORS_ORIGINS` | Dominios permitidos | interno | público |

#### Method 2: Using Environment Files

      NEXT_PUBLIC_USE_PRIVATE_API: ${NEXT_PUBLIC_USE_PRIVATE_API}| `PUBLIC_API_URL` | URL pública del API | `/api` | `https://api.pinar.campeonatos.co` |

Create `.env.public`:

      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}

```bash

# Public API Mode - Backend IS publicly accessible      INTERNAL_API_BASE_URL: ${INTERNAL_API_URL}## Cambio Rápido

NEXT_PUBLIC_USE_PRIVATE_API=false

CORS_ORIGINS=https://yourdomain.com,http://localhost:3000    ports:

BACKEND_PORT_MAPPING=8400:8400

NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com      - "${FRONTEND_PORT_MAPPING}"```bash

INTERNAL_API_URL=http://bracket-backend:8400

FRONTEND_PORT_MAPPING=3000:3000```# Modo seguro (recomendado)

JWT_SECRET=change_me_in_production

ADMIN_EMAIL=admin@yourdomain.com./switch-api-mode.sh private

ADMIN_PASSWORD=change_me_in_production

BASE_URL=https://api.yourdomain.com### Deployment

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

```# Modo público  



### Deployment```bash./switch-api-mode.sh public



```bash# Using .env.private```

# Using .env.public

cp .env.public .envcp .env.private .env

docker-compose down

docker-compose up -ddocker-compose down## Troubleshooting

```

docker-compose up -d

### Nginx Configuration (Frontend + Backend)

### Error: `bracket-backend:8400 not resolved`

```nginx

# Frontend# Or with direct configuration- Verifica que `USE_PRIVATE_API=true` en `.env`

server {

    listen 443 ssl http2;docker-compose down- Asegúrate de que el archivo `/pages/api/[...path].ts` existe

    server_name yourdomain.com;

docker-compose up -d

    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;```### Error: `CORS policy`



    location / {- En modo público: verifica `CORS_ORIGINS` en backend

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;### Nginx Configuration (Frontend Only)- En modo privado: no debería ocurrir

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;```nginx### Backend no responde

    }

}server {- Modo privado: verifica logs del frontend



# Backend API    listen 443 ssl http2;- Modo público: verifica que nginx apunte a `172.16.0.4:8400`

server {    server_name yourdomain.com;

    listen 443 ssl http2;

    server_name api.yourdomain.com;    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;

    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;    location / {

        proxy_pass http://localhost:3000;

    location / {        proxy_http_version 1.1;

        proxy_pass http://localhost:8400;        proxy_set_header Upgrade $http_upgrade;

        proxy_http_version 1.1;        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-Proto $scheme;        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    }        proxy_set_header X-Forwarded-Proto $scheme;

}    }

```}

```

---

---

## Environment Variables Reference

## 🌐 Public Mode (Direct API Access)

### Frontend Environment Variables

### Overview

| Variable | Description | Private Mode | Public Mode | Required |In **Public Mode**, both frontend and backend are exposed to the internet. The frontend makes direct requests to the backend API. This requires proper CORS configuration and typically uses two subdomains.

|----------|-------------|--------------|-------------|----------|

| `NEXT_PUBLIC_USE_PRIVATE_API` | Enables/disables private API mode | `"true"` | `"false"` | ✅ Yes |### Features

| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL visible to browser | `http://bracket-backend:8400` | `https://api.yourdomain.com` | ✅ Yes |- ⚠️ **Backend accessible from Internet** - Requires security considerations

| `INTERNAL_API_BASE_URL` | Backend URL for server-side proxy | `http://bracket-backend:8400` | `http://bracket-backend:8400` | Private only |- ⚠️ **Requires CORS configuration** - Cross-origin requests must be allowed

| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key for forms | `10000000-ffff-ffff-ffff-000000000001` (test key) | Same | ✅ Yes |- ⚠️ **Two domains/subdomains needed** - Frontend and API separately exposed

- ✅ **Potentially lower latency** - Direct backend communication

**Important:** `NEXT_PUBLIC_*` variables are **embedded at build time** in Next.js. Changes require rebuilding the Docker image.- ✅ **API can be used by other clients** - Third-party integrations possible



### Backend Environment Variables### What Users See

```

| Variable | Description | Private Mode | Public Mode | Required |✅ https://yourdomain.com/login

|----------|-------------|--------------|-------------|----------|⚠️ Browser requests go to: https://api.yourdomain.com/token

| `ENVIRONMENT` | Deployment environment | `PRODUCTION` | `PRODUCTION` | ✅ Yes |⚠️ Browser requests go to: https://api.yourdomain.com/clubs

| `CORS_ORIGINS` | Allowed origin domains | `http://bracket-frontend:3000` | `https://yourdomain.com` | ✅ Yes |```

| `PG_DSN` | PostgreSQL connection string | `postgresql://user:pass@postgres:5432/db` | Same | ✅ Yes |

| `JWT_SECRET` | Secret for JWT token signing | Strong random string | Same | ✅ Yes |### Docker Compose Configuration

| `ADMIN_EMAIL` | Initial admin user email | `admin@yourdomain.com` | Same | ✅ Yes |

| `ADMIN_PASSWORD` | Initial admin password | Strong password | Same | ✅ Yes |**Method 1: Direct Configuration**

| `BASE_URL` | Public base URL of application | `https://yourdomain.com` | `https://api.yourdomain.com` | ✅ Yes |

Edit `docker-compose.yml`:

### Docker Compose Variables

```yaml

| Variable | Description | Private Mode | Public Mode |services:

|----------|-------------|--------------|-------------|  bracket-backend:

| `BACKEND_PORT_MAPPING` | Backend container port mapping | (empty or omit) | `8400:8400` |    container_name: bracket-backend

| `FRONTEND_PORT_MAPPING` | Frontend container port mapping | `3000:3000` | `3000:3000` |    environment:

      ENVIRONMENT: PRODUCTION

---      # CORS - Allow requests from frontend domain

      CORS_ORIGINS: https://yourdomain.com,http://localhost:3000

## Quick Mode Switching      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod

      JWT_SECRET: change_me_in_production

If using the `switch-api-mode.sh` script:      ADMIN_EMAIL: admin@yourdomain.com

      ADMIN_PASSWORD: change_me_in_production

```bash      BASE_URL: https://api.yourdomain.com

# Switch to Private Mode (secure)    image: ghcr.io/evroon/bracket-backend

./switch-api-mode.sh private    networks:

docker-compose down && docker-compose up -d      - bracket_lan

    # Backend is PUBLIC - Port exposed

# Switch to Public Mode    ports:

./switch-api-mode.sh public      - "8400:8400"

docker-compose down && docker-compose up -d    restart: unless-stopped

```

  bracket-frontend:

---    container_name: bracket-frontend

    environment:

## Troubleshooting      # Disable Private API mode

      NEXT_PUBLIC_USE_PRIVATE_API: "false"

### Error: `bracket-backend:8400 net::ERR_NAME_NOT_RESOLVED`      # Public backend URL

      NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com

**Cause:** Frontend is trying to connect directly to internal Docker hostname from browser.      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"

    image: ghcr.io/evroon/bracket-frontend  # Can use official image

**Solutions:**    networks:

      - bracket_lan

1. Verify `NEXT_PUBLIC_USE_PRIVATE_API="true"` in frontend environment    ports:

2. Ensure frontend image is `bracket-frontend-local` (has proxy code)      - "3000:3000"

3. Rebuild frontend image: `docker build -t bracket-frontend-local ./frontend`    restart: unless-stopped

4. Check that `/frontend/src/pages/api/[...path].ts` exists in your source code```



### Error: `CORS policy: No 'Access-Control-Allow-Origin' header`**Method 2: Using Environment Files**



**Cause:** Backend CORS settings don't match frontend origin.Create `.env.public`:



**Solutions:**```bash

# Public API Mode - Backend IS publicly accessible

1. **Private Mode:** Set `CORS_ORIGINS=http://bracket-frontend:3000` in backendNEXT_PUBLIC_USE_PRIVATE_API=false

2. **Public Mode:** Set `CORS_ORIGINS=https://yourdomain.com` in backend (match frontend domain)CORS_ORIGINS=https://yourdomain.com,http://localhost:3000

3. Restart backend: `docker-compose restart bracket-backend`BACKEND_PORT_MAPPING=8400:8400

NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

### Backend not respondingINTERNAL_API_URL=http://bracket-backend:8400

FRONTEND_PORT_MAPPING=3000:3000

**Private Mode:**JWT_SECRET=change_me_in_production

ADMIN_EMAIL=admin@yourdomain.com

- Check frontend logs: `docker-compose logs bracket-frontend`ADMIN_PASSWORD=change_me_in_production

- Verify proxy is working: `docker exec bracket-frontend curl http://bracket-backend:8400`BASE_URL=https://api.yourdomain.com

- Ensure backend has no `ports:` section in docker-compose.ymlNEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

```

**Public Mode:**

### Deployment

- Check backend logs: `docker-compose logs bracket-backend`

- Verify backend port is exposed: `docker-compose ps` should show `8400:8400````bash

- Test direct access: `curl http://localhost:8400`# Using .env.public

- Check Nginx proxy configurationcp .env.public .env

docker-compose down

### Frontend shows blank page or errorsdocker-compose up -d

```

1. Check browser console (F12) for errors

2. Verify environment variables: `docker exec bracket-frontend env | grep NEXT_PUBLIC`### Nginx Configuration (Frontend + Backend)

3. Ensure correct image is running: `docker inspect bracket-frontend | grep Image`

4. Clear browser cache (Ctrl+Shift+R) or try incognito mode```nginx

# Frontend

### Changes to environment variables not taking effectserver {

    listen 443 ssl http2;

**For `NEXT_PUBLIC_*` variables:**    server_name yourdomain.com;



- These are **embedded at build time** in Next.js    ssl_certificate /path/to/cert.pem;

- Must rebuild frontend image: `docker build --no-cache -t bracket-frontend-local ./frontend`    ssl_certificate_key /path/to/key.pem;

- Then restart: `docker-compose up -d`

    location / {

**For backend variables:**        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;

- Simply restart: `docker-compose restart bracket-backend`        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection 'upgrade';

---        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;

## Summary: Which Mode Should I Use?    }

}

| Scenario | Recommended Mode | Reason |

|----------|------------------|--------|# Backend API

| Production deployment with Cloudflare/Nginx | **Private** | Enhanced security, simpler SSL setup |server {

| Development/testing | **Private** | Easier setup, no CORS issues |    listen 443 ssl http2;

| Need third-party API access | **Public** | Backend must be directly accessible |    server_name api.yourdomain.com;

| Multi-client architecture (mobile app + web) | **Public** | Shared API endpoint |

| Simple single-app deployment | **Private** | Reduced attack surface |    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;

**Default recommendation:** Use **Private Mode** for most deployments.

    location / {
        proxy_pass http://localhost:8400;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Environment Variables Reference

### Frontend Environment Variables

| Variable | Description | Private Mode | Public Mode | Required |
|----------|-------------|--------------|-------------|----------|
| `NEXT_PUBLIC_USE_PRIVATE_API` | Enables/disables private API mode | `"true"` | `"false"` | ✅ Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL visible to browser | `http://bracket-backend:8400` | `https://api.yourdomain.com` | ✅ Yes |
| `INTERNAL_API_BASE_URL` | Backend URL for server-side proxy | `http://bracket-backend:8400` | `http://bracket-backend:8400` | Private only |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key for forms | `10000000-ffff-ffff-ffff-000000000001` (test key) | Same | ✅ Yes |

**Important:** `NEXT_PUBLIC_*` variables are **embedded at build time** in Next.js. Changes require rebuilding the Docker image.

### Backend Environment Variables

| Variable | Description | Private Mode | Public Mode | Required |
|----------|-------------|--------------|-------------|----------|
| `ENVIRONMENT` | Deployment environment | `PRODUCTION` | `PRODUCTION` | ✅ Yes |
| `CORS_ORIGINS` | Allowed origin domains | `http://bracket-frontend:3000` | `https://yourdomain.com` | ✅ Yes |
| `PG_DSN` | PostgreSQL connection string | `postgresql://user:pass@postgres:5432/db` | Same | ✅ Yes |
| `JWT_SECRET` | Secret for JWT token signing | Strong random string | Same | ✅ Yes |
| `ADMIN_EMAIL` | Initial admin user email | `admin@yourdomain.com` | Same | ✅ Yes |
| `ADMIN_PASSWORD` | Initial admin password | Strong password | Same | ✅ Yes |
| `BASE_URL` | Public base URL of application | `https://yourdomain.com` | `https://api.yourdomain.com` | ✅ Yes |

### Docker Compose Variables

| Variable | Description | Private Mode | Public Mode |
|----------|-------------|--------------|-------------|
| `BACKEND_PORT_MAPPING` | Backend container port mapping | (empty or omit) | `8400:8400` |
| `FRONTEND_PORT_MAPPING` | Frontend container port mapping | `3000:3000` | `3000:3000` |

---

## Quick Mode Switching

If using the `switch-api-mode.sh` script:

```bash
# Switch to Private Mode (secure)
./switch-api-mode.sh private
docker-compose down && docker-compose up -d

# Switch to Public Mode
./switch-api-mode.sh public
docker-compose down && docker-compose up -d
```

---

## Troubleshooting

### Error: `bracket-backend:8400 net::ERR_NAME_NOT_RESOLVED`

**Cause:** Frontend is trying to connect directly to internal Docker hostname from browser.

**Solutions:**
1. Verify `NEXT_PUBLIC_USE_PRIVATE_API="true"` in frontend environment
2. Ensure frontend image is `bracket-frontend-local` (has proxy code)
3. Rebuild frontend image: `docker build -t bracket-frontend-local ./frontend`
4. Check that `/frontend/src/pages/api/[...path].ts` exists in your source code

### Error: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Cause:** Backend CORS settings don't match frontend origin.

**Solutions:**
1. **Private Mode:** Set `CORS_ORIGINS=http://bracket-frontend:3000` in backend
2. **Public Mode:** Set `CORS_ORIGINS=https://yourdomain.com` in backend (match frontend domain)
3. Restart backend: `docker-compose restart bracket-backend`

### Backend not responding

**Private Mode:**
- Check frontend logs: `docker-compose logs bracket-frontend`
- Verify proxy is working: `docker exec bracket-frontend curl http://bracket-backend:8400`
- Ensure backend has no `ports:` section in docker-compose.yml

**Public Mode:**
- Check backend logs: `docker-compose logs bracket-backend`
- Verify backend port is exposed: `docker-compose ps` should show `8400:8400`
- Test direct access: `curl http://localhost:8400`
- Check Nginx proxy configuration

### Frontend shows blank page or errors

1. Check browser console (F12) for errors
2. Verify environment variables: `docker exec bracket-frontend env | grep NEXT_PUBLIC`
3. Ensure correct image is running: `docker inspect bracket-frontend | grep Image`
4. Clear browser cache (Ctrl+Shift+R) or try incognito mode

### Changes to environment variables not taking effect

**For `NEXT_PUBLIC_*` variables:**
- These are **embedded at build time** in Next.js
- Must rebuild frontend image: `docker build --no-cache -t bracket-frontend-local ./frontend`
- Then restart: `docker-compose up -d`

**For backend variables:**
- Simply restart: `docker-compose restart bracket-backend`

---

## Summary: Which Mode Should I Use?

| Scenario | Recommended Mode | Reason |
|----------|------------------|--------|
| Production deployment with Cloudflare/Nginx | **Private** | Enhanced security, simpler SSL setup |
| Development/testing | **Private** | Easier setup, no CORS issues |
| Need third-party API access | **Public** | Backend must be directly accessible |
| Multi-client architecture (mobile app + web) | **Public** | Shared API endpoint |
| Simple single-app deployment | **Private** | Reduced attack surface |

**Default recommendation:** Use **Private Mode** for most deployments.
