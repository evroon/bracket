#!/bin/bash

# Script to switch between public and private API modes
# Usage: ./switch-api-mode.sh [private|public]

set -e

MODE=${1:-private}

case $MODE in
    "private")
        echo "🔒 Configuring PRIVATE API (secure mode)..."
        cp .env.private .env
        echo "✅ Backend will NOT be accessible from Internet"
        echo "✅ Frontend will use TRANSPARENT internal proxy"
        echo "✅ Users will NEVER see /api in URLs"
        echo "✅ Only one domain needed: yourdomain.com"
        echo "✅ Enhanced security"
        ;;
    "public")
        echo "🌐 Configuring PUBLIC API..."
        cp .env.public .env
        echo "⚠️  Backend WILL be accessible from Internet"
        echo "⚠️  Users will see requests to api.yourdomain.com"
        echo "⚠️  Browser connects directly to backend"
        echo "⚠️  Requires correct CORS configuration"
        echo "⚠️  Two domains required"
        ;;
    *)
        echo "❌ Invalid mode. Use: private or public"
        echo "Example: ./switch-api-mode.sh private"
        exit 1
        ;;
esac

echo ""
echo "📝 .env file configured for mode: $MODE"
echo "🐳 Run: docker-compose down && docker-compose up -d"
echo ""

if [ "$MODE" = "private" ]; then
    echo "✅ NGINX CONFIGURATION FOR PRIVATE MODE:"
    echo "   - Only configure: yourdomain.com → 172.16.0.4:3000"
    echo "   - DO NOT configure api.yourdomain.com"
    echo "   - Users only see normal frontend URLs"
elif [ "$MODE" = "public" ]; then
    echo "⚠️  IMPORTANT for public mode:"
    echo "   - Configure nginx for yourdomain.com → 172.16.0.4:3000"
    echo "   - Configure nginx for api.yourdomain.com → 172.16.0.4:8400"
    echo "   - Make sure CORS_ORIGINS is correct"
fi