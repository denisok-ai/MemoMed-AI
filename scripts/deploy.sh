#!/bin/bash
# deploy.sh — Production deployment script for MemoMed AI

set -e

echo "🚀 MemoMed AI — Starting deployment..."

# Check required environment variables
required_vars=("NEXTAUTH_SECRET" "DEEPSEEK_API_KEY" "POSTGRES_PASSWORD")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: Required env variable $var is not set"
    exit 1
  fi
done

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build and restart containers
echo "🔨 Building Docker images..."
docker compose build --no-cache

echo "🗄️  Running database migrations..."
docker compose run --rm app npx prisma migrate deploy

echo "🔄 Restarting services..."
docker compose up -d --remove-orphans

echo "⏳ Waiting for health check..."
sleep 10
curl -sf http://localhost:3000/api/health | python3 -m json.tool

echo "✅ Deployment complete!"
