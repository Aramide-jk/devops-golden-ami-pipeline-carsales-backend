#!/bin/bash
set -eux

echo "Installing CodeDeploy..."
REGION=${AWS_REGION:-us-east-1}
sudo dnf install -y ruby
cd /tmp
wget -q https://aws-codedeploy-${REGION}.s3.${REGION}.amazonaws.com/latest/install
chmod +x install
sudo ./install auto
sudo systemctl enable codedeploy-agent
echo "✓ CodeDeploy done"
