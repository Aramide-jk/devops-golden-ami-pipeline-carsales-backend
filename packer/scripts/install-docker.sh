#!/bin/bash
set -euxo pipefail

echo "========================================="
echo "Installing Docker"
echo "========================================="

# Install Docker
sudo dnf install -y docker

# Start and enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add ec2-user to docker group
sudo usermod -aG docker ec2-user

# Verify Docker installation
sudo docker --version

# Test Docker
sudo docker run hello-world

echo "✓ Docker installed and configured successfully"
