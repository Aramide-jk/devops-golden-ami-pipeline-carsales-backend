#!/bin/bash
set -euxo pipefail

echo "========== Installing CodeDeploy Agent =========="

REGION=${AWS_REGION:-us-east-1}

sudo dnf install -y ruby

cd /tmp
wget https://aws-codedeploy-${REGION}.s3.${REGION}.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

sudo systemctl enable codedeploy-agent
sudo systemctl start codedeploy-agent
sudo systemctl status codedeploy-agent --no-pager

echo "✓ CodeDeploy agent installed"
