# API Configuration: Public vs Private

This project supports two API operation modes:

## 🔒 Private Mode (Recommended)

**Features:**
- ✅ Backend NOT accessible from Internet
- ✅ Enhanced security
- ✅ Frontend acts as transparent proxy
- ✅ No CORS issues
- ✅ Centralized logging
- ✅ **Users NEVER see /api in URLs**

**What users see:**
- ✅ `https://yourdomain.com/login`
- ✅ `https://yourdomain.com/tournaments`
- ✅ Normal frontend URLs

**What happens internally (invisible):**
- 🔄 `yourdomain.com/api/token` → `bracket-backend:8400/token`
- 🔄 Transparent server-side proxy

**Configuration:**
```bash
./switch-api-mode.sh private
docker-compose down && docker-compose up -d
```

**Nginx (frontend only):**
```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://172.16.0.4:3000;
    }
}
```

## 🌐 Public Mode

**Features:**
- ⚠️ Backend accessible from Internet
- ⚠️ Requires correct CORS configuration
- ⚠️ Two subdomains needed
- ✅ Potentially lower latency

**What users see:**
- ✅ `https://yourdomain.com/login`
- ⚠️ Requests go to `https://api.yourdomain.com/token`

**Configuration:**
```bash
./switch-api-mode.sh public
docker-compose down && docker-compose up -d
```

**Nginx (frontend + backend):**
```nginx
# Frontend
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://172.16.0.4:3000;
    }
}

# Backend
server {
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://172.16.0.4:8400;
    }
}
```

## Environment Variables

| Variable | Description | Private | Public |
|----------|-------------|---------|---------|
| `USE_PRIVATE_API` | Operation mode | `true` | `false` |
| `BACKEND_PORT_MAPPING` | Backend port | empty | `172.16.0.4:8400:8400` |
| `CORS_ORIGINS` | Allowed domains | internal | public |
| `PUBLIC_API_URL` | Public API URL | `/api` | `https://api.yourdomain.com` |

## Quick Switch

```bash
# Secure mode (recommended)
./switch-api-mode.sh private

# Public mode  
./switch-api-mode.sh public
```

## Troubleshooting

### Error: `bracket-backend:8400 not resolved`
- Verify that `USE_PRIVATE_API=true` in `.env`
- Make sure `/pages/api/[...path].ts` file exists

### Error: `CORS policy`
- Public mode: verify `CORS_ORIGINS` in backend
- Private mode: should not occur

### Backend not responding
- Private mode: check frontend logs
- Public mode: verify nginx points to `172.16.0.4:8400`

## Variables de Entorno

| Variable | Descripción | Privado | Público |
|----------|-------------|---------|---------|
| `USE_PRIVATE_API` | Modo de operación | `true` | `false` |
| `BACKEND_PORT_MAPPING` | Puerto del backend | vacío | `172.16.0.4:8400:8400` |
| `CORS_ORIGINS` | Dominios permitidos | interno | público |
| `PUBLIC_API_URL` | URL pública del API | `/api` | `https://api.pinar.campeonatos.co` |

## Cambio Rápido

```bash
# Modo seguro (recomendado)
./switch-api-mode.sh private

# Modo público  
./switch-api-mode.sh public
```

## Troubleshooting

### Error: `bracket-backend:8400 not resolved`
- Verifica que `USE_PRIVATE_API=true` en `.env`
- Asegúrate de que el archivo `/pages/api/[...path].ts` existe

### Error: `CORS policy`
- En modo público: verifica `CORS_ORIGINS` en backend
- En modo privado: no debería ocurrir

### Backend no responde
- Modo privado: verifica logs del frontend
- Modo público: verifica que nginx apunte a `172.16.0.4:8400`