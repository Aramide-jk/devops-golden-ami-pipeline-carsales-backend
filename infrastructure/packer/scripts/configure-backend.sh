#!/bin/bash
set -euxo pipefail

echo "========== Configuring Backend Application =========="

REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=${AWS_ACCOUNT_ID}

echo "Testing ECR authentication..."
aws ecr get-login-password --region ${REGION} | sudo docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo "ECR authentication successful"
echo "Skipping Docker image pre-pull - will pull on first instance launch"
echo "✓ Backend configured"
