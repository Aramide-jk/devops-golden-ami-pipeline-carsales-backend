#!/bin/bash
set -euxo pipefail

echo "Starting backend container..."

systemctl start docker

docker stop backend || true
docker rm backend || true

docker run -d \
  --name backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e MONGO_URI="$MONGO_URI" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e FRONTEND_URL="$FRONTEND_URL" \
  -e FRONTEND_URL2="$FRONTEND_URL2" \
  734649603753.dkr.ecr.us-east-1.amazonaws.com/backend-docker-build:latest

echo "Backend started"
