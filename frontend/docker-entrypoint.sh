#!/bin/bash
set -eo pipefail

# Replace the statically built http://NEXT_PUBLIC_API_BASE_URL_PLACEHOLDER literal with run-time
# NEXT_PUBLIC_WEBAPP_URL environment variable
FROM="http://NEXT_PUBLIC_API_BASE_URL_PLACEHOLDER"
TO="$NEXT_PUBLIC_API_BASE_URL"

find .next public -type f |
while read file; do
    sed -i "s|$FROM|$TO|g" "$file" || true
done

echo "Starting Nextjs"
exec "$@"
