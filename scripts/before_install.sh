#!/bin/bash
set -e

echo "=== BeforeInstall Hook Started ==="

REGION="us-east-1"
ACCOUNT_ID="734649603753"
REPO="backend"

# Ensure Docker is running
systemctl start docker

# Authenticate with ECR
echo "Authenticating with ECR..."
aws ecr get-login-password --region ${REGION} \
  | docker login \
      --username AWS \
      --password-stdin \
      ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Pull latest image
echo "Pulling latest Docker image..."
docker pull ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest

echo "✓ Before install completed successfully"
exit 0
