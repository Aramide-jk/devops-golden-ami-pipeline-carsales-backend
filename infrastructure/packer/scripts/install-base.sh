#!/bin/bash
set -euo pipefail

dnf update -y
dnf install -y curl unzip jq amazon-ssm-agent

timedatectl set-timezone UTC

systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent
