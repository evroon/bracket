# API Configuration: Public vs Private Modes# API Configuration: Public vs Private



This project supports two API operation modes for different deployment scenarios.This project supports two API operation modes:



---## 🔒 Private Mode (Recommended)



## 🔒 Private Mode (Recommended for Production)**Features:**

- ✅ Backend NOT accessible from Internet

### Overview- ✅ Enhanced security

In **Private Mode**, the backend API is **NOT exposed to the internet**. The frontend acts as a transparent proxy, forwarding all API requests internally to the backend container. This provides enhanced security and eliminates CORS issues.- ✅ Frontend acts as transparent proxy

- ✅ No CORS issues

### Features- ✅ Centralized logging

- ✅ **Backend NOT accessible from Internet** - Only internal Docker network access- ✅ **Users NEVER see /api in URLs**

- ✅ **Enhanced security** - Attack surface reduced

- ✅ **Frontend acts as transparent proxy** - Server-side forwarding via `/api/*` routes**What users see:**

- ✅ **No CORS issues** - Same-origin requests- ✅ `https://yourdomain.com/login`

- ✅ **Single domain** - Only frontend needs to be publicly exposed- ✅ `https://yourdomain.com/tournaments`

- ✅ **Users NEVER see internal URLs** - All requests appear as frontend URLs- ✅ Normal frontend URLs



### What Users See**What happens internally (invisible):**

```- 🔄 `yourdomain.com/api/token` → `bracket-backend:8400/token`

✅ https://yourdomain.com/login- 🔄 Transparent server-side proxy

✅ https://yourdomain.com/tournaments

✅ https://yourdomain.com/ (all routes are frontend URLs)**Configuration:**

``````bash

./switch-api-mode.sh private

### What Happens Internally (Transparent)docker-compose down && docker-compose up -d

``````

Browser Request:    GET https://yourdomain.com/

                    ↓**Nginx (frontend only):**

Next.js Frontend:   Calls /api/clubs internally```nginx

                    ↓server {

Proxy Handler:      /api/clubs → http://bracket-backend:8400/clubs    server_name yourdomain.com;

                    ↓    location / {

Backend Response:   Returns data to frontend        proxy_pass http://172.16.0.4:3000;

                    ↓    }

User Receives:      Data rendered on page}

``````



### Docker Compose Configuration## 🌐 Public Mode



**Method 1: Direct Configuration (Simplest)****Features:**

- ⚠️ Backend accessible from Internet

Edit `docker-compose.yml`:- ⚠️ Requires correct CORS configuration

- ⚠️ Two subdomains needed

```yaml- ✅ Potentially lower latency

services:

  bracket-backend:**What users see:**

    container_name: bracket-backend- ✅ `https://yourdomain.com/login`

    environment:- ⚠️ Requests go to `https://api.yourdomain.com/token`

      ENVIRONMENT: PRODUCTION

      # CORS - Only allow internal frontend communication**Configuration:**

      CORS_ORIGINS: http://bracket-frontend:3000```bash

      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod./switch-api-mode.sh public

      JWT_SECRET: change_me_in_productiondocker-compose down && docker-compose up -d

      ADMIN_EMAIL: admin@yourdomain.com```

      ADMIN_PASSWORD: change_me_in_production

      BASE_URL: https://yourdomain.com**Nginx (frontend + backend):**

    image: ghcr.io/evroon/bracket-backend```nginx

    networks:# Frontend

      - bracket_lanserver {

    # Backend is PRIVATE - NO ports exposed    server_name yourdomain.com;

    restart: unless-stopped    location / {

        proxy_pass http://172.16.0.4:3000;

  bracket-frontend:    }

    container_name: bracket-frontend}

    environment:

      # Enable Private API mode# Backend

      NEXT_PUBLIC_USE_PRIVATE_API: "true"server {

      # Internal backend URL (for proxy)    server_name api.yourdomain.com;

      NEXT_PUBLIC_API_BASE_URL: http://bracket-backend:8400    location / {

      INTERNAL_API_BASE_URL: http://bracket-backend:8400        proxy_pass http://172.16.0.4:8400;

      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"    }

    image: bracket-frontend-local  # Must use local image with proxy}

    networks:```

      - bracket_lan

    ports:## Environment Variables

      - "3000:3000"  # Only frontend is exposed

    restart: unless-stopped| Variable | Description | Private | Public |

```|----------|-------------|---------|---------|

| `USE_PRIVATE_API` | Operation mode | `true` | `false` |

**Method 2: Using Environment Files**| `BACKEND_PORT_MAPPING` | Backend port | empty | `172.16.0.4:8400:8400` |

| `CORS_ORIGINS` | Allowed domains | internal | public |

Create `.env.private`:| `PUBLIC_API_URL` | Public API URL | `/api` | `https://api.yourdomain.com` |



```bash## Quick Switch

# Private API Mode - Backend NOT publicly accessible

NEXT_PUBLIC_USE_PRIVATE_API=true```bash

CORS_ORIGINS=http://bracket-frontend:3000# Secure mode (recommended)

BACKEND_PORT_MAPPING=./switch-api-mode.sh private

INTERNAL_API_URL=http://bracket-backend:8400

NEXT_PUBLIC_API_BASE_URL=http://bracket-backend:8400# Public mode  

FRONTEND_PORT_MAPPING=3000:3000./switch-api-mode.sh public

JWT_SECRET=change_me_in_production```

ADMIN_EMAIL=admin@yourdomain.com

ADMIN_PASSWORD=change_me_in_production## Troubleshooting

BASE_URL=https://yourdomain.com

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001### Error: `bracket-backend:8400 not resolved`

```- Verify that `USE_PRIVATE_API=true` in `.env`

- Make sure `/pages/api/[...path].ts` file exists

Then use variables in `docker-compose.yml`:

### Error: `CORS policy`

```yaml- Public mode: verify `CORS_ORIGINS` in backend

services:- Private mode: should not occur

  bracket-backend:

    environment:### Backend not responding

      CORS_ORIGINS: ${CORS_ORIGINS}- Private mode: check frontend logs

      JWT_SECRET: ${JWT_SECRET}- Public mode: verify nginx points to `172.16.0.4:8400`

      ADMIN_EMAIL: ${ADMIN_EMAIL}

      ADMIN_PASSWORD: ${ADMIN_PASSWORD}## Variables de Entorno

      BASE_URL: ${BASE_URL}

    ports:| Variable | Descripción | Privado | Público |

      - "${BACKEND_PORT_MAPPING:-}"  # Empty = not exposed|----------|-------------|---------|---------|

| `USE_PRIVATE_API` | Modo de operación | `true` | `false` |

  bracket-frontend:| `BACKEND_PORT_MAPPING` | Puerto del backend | vacío | `172.16.0.4:8400:8400` |

    environment:| `CORS_ORIGINS` | Dominios permitidos | interno | público |

      NEXT_PUBLIC_USE_PRIVATE_API: ${NEXT_PUBLIC_USE_PRIVATE_API}| `PUBLIC_API_URL` | URL pública del API | `/api` | `https://api.pinar.campeonatos.co` |

      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}

      INTERNAL_API_BASE_URL: ${INTERNAL_API_URL}## Cambio Rápido

    ports:

      - "${FRONTEND_PORT_MAPPING}"```bash

```# Modo seguro (recomendado)

./switch-api-mode.sh private

### Deployment

# Modo público  

```bash./switch-api-mode.sh public

# Using .env.private```

cp .env.private .env

docker-compose down## Troubleshooting

docker-compose up -d

### Error: `bracket-backend:8400 not resolved`

# Or with direct configuration- Verifica que `USE_PRIVATE_API=true` en `.env`

docker-compose down- Asegúrate de que el archivo `/pages/api/[...path].ts` existe

docker-compose up -d

```### Error: `CORS policy`

- En modo público: verifica `CORS_ORIGINS` en backend

### Nginx Configuration (Frontend Only)- En modo privado: no debería ocurrir



```nginx### Backend no responde

server {- Modo privado: verifica logs del frontend

    listen 443 ssl http2;- Modo público: verifica que nginx apunte a `172.16.0.4:8400`
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🌐 Public Mode (Direct API Access)

### Overview
In **Public Mode**, both frontend and backend are exposed to the internet. The frontend makes direct requests to the backend API. This requires proper CORS configuration and typically uses two subdomains.

### Features
- ⚠️ **Backend accessible from Internet** - Requires security considerations
- ⚠️ **Requires CORS configuration** - Cross-origin requests must be allowed
- ⚠️ **Two domains/subdomains needed** - Frontend and API separately exposed
- ✅ **Potentially lower latency** - Direct backend communication
- ✅ **API can be used by other clients** - Third-party integrations possible

### What Users See
```
✅ https://yourdomain.com/login
⚠️ Browser requests go to: https://api.yourdomain.com/token
⚠️ Browser requests go to: https://api.yourdomain.com/clubs
```

### Docker Compose Configuration

**Method 1: Direct Configuration**

Edit `docker-compose.yml`:

```yaml
services:
  bracket-backend:
    container_name: bracket-backend
    environment:
      ENVIRONMENT: PRODUCTION
      # CORS - Allow requests from frontend domain
      CORS_ORIGINS: https://yourdomain.com,http://localhost:3000
      PG_DSN: postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod
      JWT_SECRET: change_me_in_production
      ADMIN_EMAIL: admin@yourdomain.com
      ADMIN_PASSWORD: change_me_in_production
      BASE_URL: https://api.yourdomain.com
    image: ghcr.io/evroon/bracket-backend
    networks:
      - bracket_lan
    # Backend is PUBLIC - Port exposed
    ports:
      - "8400:8400"
    restart: unless-stopped

  bracket-frontend:
    container_name: bracket-frontend
    environment:
      # Disable Private API mode
      NEXT_PUBLIC_USE_PRIVATE_API: "false"
      # Public backend URL
      NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001"
    image: ghcr.io/evroon/bracket-frontend  # Can use official image
    networks:
      - bracket_lan
    ports:
      - "3000:3000"
    restart: unless-stopped
```

**Method 2: Using Environment Files**

Create `.env.public`:

```bash
# Public API Mode - Backend IS publicly accessible
NEXT_PUBLIC_USE_PRIVATE_API=false
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
BACKEND_PORT_MAPPING=8400:8400
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
INTERNAL_API_URL=http://bracket-backend:8400
FRONTEND_PORT_MAPPING=3000:3000
JWT_SECRET=change_me_in_production
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change_me_in_production
BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
```

### Deployment

```bash
# Using .env.public
cp .env.public .env
docker-compose down
docker-compose up -d
```

### Nginx Configuration (Frontend + Backend)

```nginx
# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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
