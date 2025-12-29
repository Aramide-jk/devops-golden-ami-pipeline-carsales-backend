#!/bin/bash
set -eux

echo "Installing base packages..."
sudo dnf update -y
sudo dnf install -y wget curl git jq
echo "✓ Base done"
