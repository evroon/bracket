# API Configuration: Public vs Private Modes# API Configuration: Public vs Private Modes# API Configuration: Public vs Private



This project supports two API operation modes for different deployment scenarios.



---This project supports two API operation modes for different deployment scenarios.This project supports two API operation modes:



## 🔒 Private Mode (Recommended for Production)



### Overview---## 🔒 Private Mode (Recommended)



In **Private Mode**, the backend API is **NOT exposed to the internet**. The frontend acts as a transparent proxy, forwarding all API requests internally to the backend container. This provides enhanced security and eliminates CORS issues.



### Features## 🔒 Private Mode (Recommended for Production)**Features:**



- ✅ **Backend NOT accessible from Internet** - Only internal Docker network access- ✅ Backend NOT accessible from Internet

- ✅ **Enhanced security** - Attack surface reduced

- ✅ **Frontend acts as transparent proxy** - Server-side forwarding via `/api/*` routes### Overview- ✅ Enhanced security

- ✅ **No CORS issues** - Same-origin requests

- ✅ **Single domain** - Only frontend needs to be publicly exposedIn **Private Mode**, the backend API is **NOT exposed to the internet**. The frontend acts as a transparent proxy, forwarding all API requests internally to the backend container. This provides enhanced security and eliminates CORS issues.- ✅ Frontend acts as transparent proxy

- ✅ **Users NEVER see internal URLs** - All requests appear as frontend URLs

- ✅ No CORS issues

### What Users See

### Features- ✅ Centralized logging

```

✅ https://yourdomain.com/login- ✅ **Backend NOT accessible from Internet** - Only internal Docker network access- ✅ **Users NEVER see /api in URLs**

✅ https://yourdomain.com/tournaments

✅ https://yourdomain.com/ (all routes are frontend URLs)- ✅ **Enhanced security** - Attack surface reduced

```

- ✅ **Frontend acts as transparent proxy** - Server-side forwarding via `/api/*` routes**What users see:**

### What Happens Internally (Transparent)

- ✅ **No CORS issues** - Same-origin requests- ✅ `https://yourdomain.com/login`

```

Browser Request:    GET https://yourdomain.com/- ✅ **Single domain** - Only frontend needs to be publicly exposed- ✅ `https://yourdomain.com/tournaments`

                    ↓

Next.js Frontend:   Calls /api/clubs internally- ✅ **Users NEVER see internal URLs** - All requests appear as frontend URLs- ✅ Normal frontend URLs

                    ↓

Proxy Handler:      /api/clubs → http://bracket-backend:8400/clubs

                    ↓

Backend Response:   Returns data to frontend### What Users See**What happens internally (invisible):**

                    ↓

User Receives:      Data rendered on page```- 🔄 `yourdomain.com/api/token` → `bracket-backend:8400/token`

```

✅ https://yourdomain.com/login- 🔄 Transparent server-side proxy

### Docker Compose Configuration

✅ https://yourdomain.com/tournaments

#### Method 1: Direct Configuration (Simplest)

✅ https://yourdomain.com/ (all routes are frontend URLs)**Configuration:**

Edit `docker-compose.yml`:

``````bash

```yaml

services:./switch-api-mode.sh private

  bracket-backend:

    container_name: bracket-backend### What Happens Internally (Transparent)docker-compose down && docker-compose up -d

    environment:

      ENVIRONMENT: PRODUCTION``````

      # CORS - Only allow internal frontend communication

      CORS_ORIGINS: http://bracket-frontend:3000Browser Request:    GET https://yourdomain.com/

      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod

      JWT_SECRET: change_me_in_production                    ↓**Nginx (frontend only):**

      ADMIN_EMAIL: admin@yourdomain.com

      ADMIN_PASSWORD: change_me_in_productionNext.js Frontend:   Calls /api/clubs internally```nginx

      BASE_URL: https://yourdomain.com

    image: ghcr.io/evroon/bracket-backend                    ↓server {

    networks:

      - bracket_lanProxy Handler:      /api/clubs → http://bracket-backend:8400/clubs    server_name yourdomain.com;

    # Backend is PRIVATE - NO ports exposed

    restart: unless-stopped                    ↓    location / {



  bracket-frontend:Backend Response:   Returns data to frontend        proxy_pass http://172.16.0.4:3000;

    container_name: bracket-frontend

    environment:                    ↓    }

      # Enable Private API mode

      NEXT_PUBLIC_USE_PRIVATE_API: "true"User Receives:      Data rendered on page}

      # Internal backend URL (for proxy)

      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400``````

      INTERNAL_API_BASE_URL: http://bracket-backend:8400

      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"

    image: bracket-frontend-local  # Must use local image with proxy

    networks:### Docker Compose Configuration## 🌐 Public Mode

      - bracket_lan

    ports:

      - "3000:3000"  # Only frontend is exposed

    restart: unless-stopped**Method 1: Direct Configuration (Simplest)****Features:**

```

- ⚠️ Backend accessible from Internet

#### Method 2: Using Environment Files

Edit `docker-compose.yml`:- ⚠️ Requires correct CORS configuration

Create `.env.private`:

- ⚠️ Two subdomains needed

```bash

# Private API Mode - Backend NOT publicly accessible```yaml- ✅ Potentially lower latency

NEXT_PUBLIC_USE_PRIVATE_API=true

CORS_ORIGINS=http://bracket-frontend:3000services:

BACKEND_PORT_MAPPING=

INTERNAL_API_URL=http://bracket-backend:8400  bracket-backend:**What users see:**

NEXT_PUBLIC_API_BASE_URL=http://bracket-backend:8400

FRONTEND_PORT_MAPPING=3000:3000    container_name: bracket-backend- ✅ `https://yourdomain.com/login`

JWT_SECRET=change_me_in_production

ADMIN_EMAIL=admin@yourdomain.com    environment:- ⚠️ Requests go to `https://api.yourdomain.com/token`

ADMIN_PASSWORD=change_me_in_production

BASE_URL=https://yourdomain.com      ENVIRONMENT: PRODUCTION

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

```      # CORS - Only allow internal frontend communication**Configuration:**



Then use variables in `docker-compose.yml`:      CORS_ORIGINS: http://bracket-frontend:3000```bash



```yaml      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod./switch-api-mode.sh public

services:

  bracket-backend:      JWT_SECRET: change_me_in_productiondocker-compose down && docker-compose up -d

    environment:

      CORS_ORIGINS: ${CORS_ORIGINS}      ADMIN_EMAIL: admin@yourdomain.com```

      JWT_SECRET: ${JWT_SECRET}

      ADMIN_EMAIL: ${ADMIN_EMAIL}      ADMIN_PASSWORD: change_me_in_production

      ADMIN_PASSWORD: ${ADMIN_PASSWORD}

      BASE_URL: ${BASE_URL}      BASE_URL: https://yourdomain.com**Nginx (frontend + backend):**

    ports:

      - "${BACKEND_PORT_MAPPING:-}"  # Empty = not exposed    image: ghcr.io/evroon/bracket-backend```nginx



  bracket-frontend:    networks:# Frontend

    environment:

      NEXT_PUBLIC_USE_PRIVATE_API: ${NEXT_PUBLIC_USE_PRIVATE_API}      - bracket_lanserver {

      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}

      INTERNAL_API_BASE_URL: ${INTERNAL_API_URL}    # Backend is PRIVATE - NO ports exposed    server_name yourdomain.com;

    ports:

      - "${FRONTEND_PORT_MAPPING}"    restart: unless-stopped    location / {

```

        proxy_pass http://172.16.0.4:3000;

### Deployment

  bracket-frontend:    }

```bash

# Using .env.private    container_name: bracket-frontend}

cp .env.private .env

docker-compose down    environment:

docker-compose up -d

      # Enable Private API mode# Backend

# Or with direct configuration

docker-compose down      NEXT_PUBLIC_USE_PRIVATE_API: "true"server {

docker-compose up -d

```      # Internal backend URL (for proxy)    server_name api.yourdomain.com;



### Nginx Configuration (Frontend Only)      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400    location / {



```nginx      INTERNAL_API_BASE_URL: http://bracket-backend:8400        proxy_pass http://172.16.0.4:8400;

server {

    listen 443 ssl http2;      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"    }

    server_name yourdomain.com;

    image: bracket-frontend-local  # Must use local image with proxy}

    ssl_certificate /path/to/cert.pem;

    ssl_certificate_key /path/to/key.pem;    networks:```



    location / {      - bracket_lan

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;    ports:## Environment Variables

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection 'upgrade';      - "3000:3000"  # Only frontend is exposed

        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;    restart: unless-stopped| Variable | Description | Private | Public |

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;```|----------|-------------|---------|---------|

        proxy_set_header X-Forwarded-Proto $scheme;

    }| `USE_PRIVATE_API` | Operation mode | `true` | `false` |

}

```**Method 2: Using Environment Files**| `BACKEND_PORT_MAPPING` | Backend port | empty | `172.16.0.4:8400:8400` |



---| `CORS_ORIGINS` | Allowed domains | internal | public |



## 🌐 Public Mode (Direct API Access)Create `.env.private`:| `PUBLIC_API_URL` | Public API URL | `/api` | `https://api.yourdomain.com` |



### Overview



In **Public Mode**, both frontend and backend are exposed to the internet. The frontend makes direct requests to the backend API. This requires proper CORS configuration and typically uses two subdomains.```bash## Quick Switch



### Features# Private API Mode - Backend NOT publicly accessible



- ⚠️ **Backend accessible from Internet** - Requires security considerationsNEXT_PUBLIC_USE_PRIVATE_API=true```bash

- ⚠️ **Requires CORS configuration** - Cross-origin requests must be allowed

- ⚠️ **Two domains/subdomains needed** - Frontend and API separately exposedCORS_ORIGINS=http://bracket-frontend:3000# Secure mode (recommended)

- ✅ **Potentially lower latency** - Direct backend communication

- ✅ **API can be used by other clients** - Third-party integrations possibleBACKEND_PORT_MAPPING=./switch-api-mode.sh private



### What Users SeeINTERNAL_API_URL=http://bracket-backend:8400



```NEXT_PUBLIC_API_BASE_URL=http://bracket-backend:8400# Public mode  

✅ https://yourdomain.com/login

⚠️ Browser requests go to: https://api.yourdomain.com/tokenFRONTEND_PORT_MAPPING=3000:3000./switch-api-mode.sh public

⚠️ Browser requests go to: https://api.yourdomain.com/clubs

```JWT_SECRET=change_me_in_production```



### Docker Compose ConfigurationADMIN_EMAIL=admin@yourdomain.com



#### Method 1: Direct ConfigurationADMIN_PASSWORD=change_me_in_production## Troubleshooting



Edit `docker-compose.yml`:BASE_URL=https://yourdomain.com



```yamlNEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001### Error: `bracket-backend:8400 not resolved`

services:

  bracket-backend:```- Verify that `USE_PRIVATE_API=true` in `.env`

    container_name: bracket-backend

    environment:- Make sure `/pages/api/[...path].ts` file exists

      ENVIRONMENT: PRODUCTION

      # CORS - Allow requests from frontend domainThen use variables in `docker-compose.yml`:

      CORS_ORIGINS: https://yourdomain.com,http://localhost:3000

      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod### Error: `CORS policy`

      JWT_SECRET: change_me_in_production

      ADMIN_EMAIL: admin@yourdomain.com```yaml- Public mode: verify `CORS_ORIGINS` in backend

      ADMIN_PASSWORD: change_me_in_production

      BASE_URL: https://api.yourdomain.comservices:- Private mode: should not occur

    image: ghcr.io/evroon/bracket-backend

    networks:  bracket-backend:

      - bracket_lan

    # Backend is PUBLIC - Port exposed    environment:### Backend not responding

    ports:

      - "8400:8400"      CORS_ORIGINS: ${CORS_ORIGINS}- Private mode: check frontend logs

    restart: unless-stopped

      JWT_SECRET: ${JWT_SECRET}- Public mode: verify nginx points to `172.16.0.4:8400`

  bracket-frontend:

    container_name: bracket-frontend      ADMIN_EMAIL: ${ADMIN_EMAIL}

    environment:

      # Disable Private API mode      ADMIN_PASSWORD: ${ADMIN_PASSWORD}## Variables de Entorno

      NEXT_PUBLIC_USE_PRIVATE_API: "false"

      # Public backend URL      BASE_URL: ${BASE_URL}

      NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com

      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"    ports:| Variable | Descripción | Privado | Público |

    image: ghcr.io/evroon/bracket-frontend  # Can use official image

    networks:      - "${BACKEND_PORT_MAPPING:-}"  # Empty = not exposed|----------|-------------|---------|---------|

      - bracket_lan

    ports:| `USE_PRIVATE_API` | Modo de operación | `true` | `false` |

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
