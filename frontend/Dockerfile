# Install dependencies only when needed
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# Increase timeout for slow QEMU arm64 builds
# https://github.com/nodejs/docker-node/issues/1335
RUN yarn --network-timeout 1000000

# Rebuild the source code only when needed
FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN NEXT_PUBLIC_API_BASE_URL=http://NEXT_PUBLIC_API_BASE_URL_PLACEHOLDER \
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY=NEXT_PUBLIC_HCAPTCHA_SITE_KEY_PLACEHOLDER \
    yarn build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 --system nodejs && \
    adduser --system nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chmod=0755 /app/docker-entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

RUN apk add bash

RUN yarn next telemetry disable

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD ["wget", "--spider", "http://0.0.0.0:3000", "||", "exit", "1"]

CMD ["yarn", "start"]
