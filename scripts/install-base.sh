bash
#!/bin/bash
set -euxo pipefail

echo "========================================="
echo "Installing Base Packages"
echo "========================================="

# Update system
sudo dnf update -y

# Install essential packages
sudo dnf install -y \
    wget \
    curl \
    git \
    jq \
    vim \
    htop \
    lsof \
    net-tools \
    telnet \
    nc \
    bind-utils \
    amazon-cloudwatch-agent

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Verify installation
aws --version

echo "✓ Base packages installed successfully"
