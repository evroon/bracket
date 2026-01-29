# Build static files
FROM node:25-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .

RUN apk add pnpm && \
    CI=true pnpm install && \
    pnpm build

# Production image, copy all the static files and run next
FROM caddy:2-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000

HEALTHCHECK --interval=3s --timeout=5s --retries=10 \
    CMD ["wget", "-O", "/dev/null", "http://localhost:3000"]
