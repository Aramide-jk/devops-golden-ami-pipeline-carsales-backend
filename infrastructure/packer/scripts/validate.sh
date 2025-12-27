#!/bin/bash
set -euo pipefail

echo "Validating Docker..."
systemctl is-active docker

echo "Validating CodeDeploy agent..."
systemctl is-active codedeploy-agent

echo "Running test container..."
docker run -d -p 8080:80 nginx

sleep 5
curl -f http://localhost:8080

docker rm -f $(docker ps -q)

echo "Golden AMI validation PASSED"
