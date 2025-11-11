# Install dependencies only when needed
FROM node:22-alpine AS deps

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

RUN corepack enable && pnpm i

# Rebuild the source code only when needed
FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN corepack enable

RUN VITE_API_BASE_URL=http://VITE_API_BASE_URL_PLACEHOLDER \
    VITE_HCAPTCHA_SITE_KEY=VITE_HCAPTCHA_SITE_KEY_PLACEHOLDER \
    pnpm build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 --system nodejs && \
    adduser --system vite -u 1001 -G nodejs

COPY --from=builder --chown=vite:nodejs /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chmod=0755 /app/docker-entrypoint.sh ./entrypoint.sh

RUN apk add bash

USER vite

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD ["wget", "--spider", "http://0.0.0.0:3000", "||", "exit", "1"]

CMD ["pnpm", "start"]
