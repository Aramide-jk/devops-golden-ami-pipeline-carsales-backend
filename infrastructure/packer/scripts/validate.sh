#!/bin/bash
set -euxo pipefail

echo "Validating Docker service..."
systemctl is-active docker

echo "Validating CodeDeploy agent..."
systemctl is-active codedeploy-agent

echo "Running backend container for validation..."

docker run -d \
  --name backend-validate \
  -p 8000:8000 \
  ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${DOCKER_IMAGE_TAG}

sleep 10

echo "Validating backend health endpoint..."
curl -f http://localhost:8000 || {
  echo "Backend health check failed"
  docker logs backend-validate
  exit 1
}

docker rm -f backend-validate

echo "✓ Golden AMI validation PASSED"
