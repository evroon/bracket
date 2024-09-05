#!/bin/bash
set -eo pipefail

# Replace the statically built placeholder literals from Dockerfile with run-time
# the value of the `NEXT_PUBLIC_WEBAPP_URL` environment variable
replace_placeholder() {
  find .next public -type f |
  while read file; do
      sed -i "s|$1|$2|g" "$file" || true
  done
}

replace_placeholder "http://NEXT_PUBLIC_API_BASE_URL_PLACEHOLDER" "$NEXT_PUBLIC_API_BASE_URL"
replace_placeholder "NEXT_PUBLIC_HCAPTCHA_SITE_KEY_PLACEHOLDER" "$NEXT_PUBLIC_HCAPTCHA_SITE_KEY"

echo "Starting Nextjs"
exec "$@"
