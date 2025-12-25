#!/bin/bash
set -e

echo "=== ApplicationStart Hook Started ==="

REGION="us-east-1"
ACCOUNT_ID="734649603753"
REPO="backend"
ENV_FILE="/etc/backend.env"

# CRITICAL: One last check before starting
if docker ps -a | grep -q backend; then
    echo "ERROR: Backend container still exists! This should not happen."
    echo "Current containers:"
    docker ps -a
    echo "Attempting emergency cleanup..."
    docker stop backend 2>/dev/null || true
    docker rm -f backend 2>/dev/null || true
    sleep 2
fi

echo "Fetching configuration from SSM..."
rm -f ${ENV_FILE}
touch ${ENV_FILE}
chmod 600 ${ENV_FILE}

aws ssm get-parameters \
  --region ${REGION} \
  --names \
    /prod/backend/MONGO_URI \
    /prod/backend/JWT_SECRET \
    /prod/backend/PORT \
    /prod/backend/NODE_ENV \
    /prod/backend/FRONTEND_URL \
    /prod/backend/FRONTEND_URL2 \
  --with-decryption \
  --query "Parameters[*].{Name:Name,Value:Value}" \
  --output text \
| while read name value; do
    echo "$(basename "$name")=$value" >> ${ENV_FILE}
  done

echo "Starting backend container..."
docker run -d \
  --name backend \
  --env-file ${ENV_FILE} \
  -p 8000:8000 \
  --restart always \
  ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest

# Verify container started
sleep 5
if docker ps | grep -q backend; then
    echo "✓ Backend container started successfully"
    docker ps | grep backend
else
    echo "✗ ERROR: Backend container failed to start"
    docker logs backend 2>/dev/null || true
    exit 1
fi

echo "✓ Application started successfully"
exit 0
