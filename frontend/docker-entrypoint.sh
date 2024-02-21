#!/bin/bash
set -evo pipefail

# Script to replace `NEXT_PUBLIC_*` environment variables because they're set at build-time but we want to set them at runtime in `docker-compose.yml`
# Define an array of environment variable names
env_vars=("NEXT_PUBLIC_API_BASE_URL" "NEXT_PUBLIC_HCAPTCHA_SITE_KEY")

echo "Checking that we have variables..."
# Iterate over the array and perform checks
for var in "${env_vars[@]}"; do
  test -n "${!var}"
done

# Iterate over the array and perform substitutions
for var in "${env_vars[@]}"; do
  find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_PLACEHOLDER_$var#${!var}#g"
done

echo "Starting Nextjs"
exec "$@"
