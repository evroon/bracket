# Install dependencies only when needed
FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

# Rebuild the source code only when needed
FROM node:18-alpine AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN NEXT_PUBLIC_API_BASE_URL="APP_PLACEHOLDER_NEXT_PUBLIC_API_BASE_URL" NEXT_PUBLIC_HCAPTCHA_SITE_KEY="APP_PLACEHOLDER_NEXT_PUBLIC_HCAPTCHA_SITE_KEY" yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/docker-entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

RUN addgroup -g 1001 --system nodejs && \
    adduser --system nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app/.next && \
    chmod +x /app/entrypoint.sh

RUN apk add bash

RUN yarn next telemetry disable

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

CMD yarn start
