#!/bin/bash
set -e

echo "=== ApplicationStop Hook Started ==="

# Get all backend containers
BACKEND_CONTAINERS=$(docker ps -aq -f name=backend 2>/dev/null)

if [ -n "$BACKEND_CONTAINERS" ]; then
    echo "Found existing backend container(s), removing..."
    docker stop backend 2>/dev/null || true
    
    for container_id in $BACKEND_CONTAINERS; do
        echo "Removing container: $container_id"
        docker rm -f $container_id 2>/dev/null || true
    done
else
    echo "No existing backend containers found"
fi

# Kill any process on port 8000
if sudo lsof -ti:8000 >/dev/null 2>&1; then
    echo "Killing process on port 8000..."
    sudo kill -9 $(sudo lsof -ti:8000) 2>/dev/null || true
fi

echo "✓ Application stopped successfully"
exit 0
