#!/bin/bash
set -euxo pipefail

echo "========== Installing Base Packages =========="

sudo dnf update -y
sudo dnf install -y wget curl git jq vim lsof

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

aws --version
echo "✓ Base packages installed"
