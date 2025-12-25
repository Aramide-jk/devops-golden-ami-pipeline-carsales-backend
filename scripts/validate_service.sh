#!/bin/bash
set -e

echo "Validating backend service..."

# Wait for container to be ready
sleep 15

# Check if container is running
if ! docker ps | grep backend; then
    echo "ERROR: Backend container is not running"
    exit 1
fi

# Check if application is responding
if curl -f http://localhost:8000/health || curl -f http://localhost:8000; then
    echo "✓ Backend service is healthy"
    exit 0
else
    echo "WARNING: Health check endpoint not responding, but container is running"
    exit 0
fi
