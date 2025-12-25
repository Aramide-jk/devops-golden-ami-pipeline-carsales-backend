#!/bin/bash
set -e

echo "=== BeforeInstall Hook Started ==="

REGION="us-east-1"
ACCOUNT_ID="734649603753"
REPO="backend"

echo "Installing dependencies..."
dnf install -y docker awscli jq lsof 2>/dev/null || yum install -y docker awscli jq lsof

# Ensure Docker is running
systemctl enable docker
systemctl start docker

# Wait for Docker to be ready
sleep 3

# Add ec2-user to docker group
usermod -aG docker ec2-user || true

# CRITICAL: Double-check no backend container exists
echo "Final cleanup check before install..."
docker stop backend 2>/dev/null || true
docker rm -f backend 2>/dev/null || true

# Clean up dangling containers
docker container prune -f || true

echo "Authenticating with ECR..."
aws ecr get-login-password --region ${REGION} \
  | docker login \
      --username AWS \
      --password-stdin \
      ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo "Pulling latest Docker image..."
# Remove old image
docker rmi ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest 2>/dev/null || true

# Pull latest
docker pull ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest

echo "✓ Before install completed successfully"
exit 0
