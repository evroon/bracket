#!/bin/sh

echo "Check that we have NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_HCAPTCHA_SITE_KEY vars"
test -n "$NEXT_PUBLIC_API_BASE_URL"
test -n "$NEXT_PUBLIC_HCAPTCHA_SITE_KEY"

find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_PLACEHOLDER_NEXT_PUBLIC_API_BASE_URL#$NEXT_PUBLIC_API_BASE_URL#g" # Replace NEXT_PUBLIC_API_BASE_URL

find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_PLACEHOLDER_NEXT_PUBLIC_HCAPTCHA_SITE_KEY#$NEXT_PUBLIC_HCAPTCHA_SITE_KEY#g" # Replace NEXT_PUBLIC_HCAPTCHA_SITE_KEY

echo "Starting Nextjs"
exec "$@"
