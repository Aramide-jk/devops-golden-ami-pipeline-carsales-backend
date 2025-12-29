#!/bin/bash
set -eux

echo "Installing Docker..."
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
echo "✓ Docker done"
