bash
#!/bin/bash
set -euxo pipefail

echo "========================================="
echo "Configuring Backend Application"
echo "========================================="

REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=${AWS_ACCOUNT_ID}
REPO=${ECR_REPO}
IMAGE_TAG=${DOCKER_IMAGE_TAG:-latest}

IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${IMAGE_TAG}"

echo "Image URI: ${IMAGE_URI}"

# Authenticate with ECR
echo "Authenticating with ECR..."
aws ecr get-login-password --region ${REGION} \
  | sudo docker login \
      --username AWS \
      --password-stdin \
      ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Pull the Docker image
echo "Pulling Docker image..."
sudo docker pull ${IMAGE_URI}

# Verify image is pulled
sudo docker images | grep ${REPO}

# Create systemd service for auto-start (optional, CodeDeploy will handle)
echo "Creating systemd service template..."
sudo tee /etc/systemd/system/backend-bootstrap.service > /dev/null <<EOF
[Unit]
Description=Backend Application Bootstrap
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash -c 'echo "Backend bootstrap placeholder - CodeDeploy will manage deployment"'

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable backend-bootstrap.service

echo "Backend application configured successfully"
echo "Docker image pre-pulled: ${IMAGE_URI}"
