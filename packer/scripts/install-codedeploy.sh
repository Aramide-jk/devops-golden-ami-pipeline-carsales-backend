bash
#!/bin/bash
set -euxo pipefail

echo "========================================="
echo "Installing CodeDeploy Agent"
echo "========================================="

REGION=${AWS_REGION:-us-east-1}

# Install Ruby (required for CodeDeploy agent)
sudo dnf install -y ruby

# Download CodeDeploy agent
cd /tmp
wget https://aws-codedeploy-${REGION}.s3.${REGION}.amazonaws.com/latest/install

# Make it executable
chmod +x ./install

# Install the agent
sudo ./install auto

# Enable and start CodeDeploy agent
sudo systemctl enable codedeploy-agent
sudo systemctl start codedeploy-agent

# Verify installation
sudo systemctl status codedeploy-agent --no-pager

echo "✓ CodeDeploy agent installed successfully"
