#!/bin/bash
set -euxo pipefail

echo "========== Configuring Backend Application =========="

REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=${AWS_ACCOUNT_ID}
REPO=${ECR_REPO}
IMAGE_TAG=${DOCKER_IMAGE_TAG:-latest}

IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${IMAGE_TAG}"

echo "Image URI: ${IMAGE_URI}"

echo "Authenticating with ECR..."
aws ecr get-login-password --region ${REGION} | sudo docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo "Pulling Docker image..."
sudo docker pull ${IMAGE_URI}

sudo docker images | grep ${REPO}

echo "✓ Backend configured, image pre-pulled"
EOF
