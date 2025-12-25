#!/bin/bash
# This runs BEFORE anything else - clean up completely

echo "=== ApplicationStop Hook Started ==="

# Get all backend containers (running or stopped)
BACKEND_CONTAINERS=$(docker ps -aq -f name=backend 2>/dev/null)

if [ -n "$BACKEND_CONTAINERS" ]; then
    echo "Found existing backend container(s), removing..."
    
    # Stop all backend containers
    docker stop backend 2>/dev/null || true
    
    # Force remove all backend containers
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

# Final verification
if docker ps -a | grep -q backend; then
    echo "WARNING: Backend container still exists after cleanup"
    docker ps -a | grep backend
    exit 1
fi

echo "✓ Application stopped and cleaned up successfully"
exit 0
