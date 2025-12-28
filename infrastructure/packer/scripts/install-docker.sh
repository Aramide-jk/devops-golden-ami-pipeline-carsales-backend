#!/bin/bash
set -euxo pipefail

echo "========== Installing Docker =========="

sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

sudo docker --version
sudo docker run hello-world

echo "✓ Docker installed"
