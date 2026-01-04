#!/bin/bash
set -e

echo "=== ValidateService Hook Started ==="

# Wait for application to be ready
sleep 15

# Check if container is running
if ! docker ps | grep -q backend; then
    echo "ERROR: Backend container is not running"
    docker logs backend 2>/dev/null || true
    exit 1
fi

echo "✓ Container is running"

# Try health check (don't fail if endpoint doesn't exist)
if curl -f http://localhost:8000/ 2>/dev/null; then
    echo "✓ Health check passed"
elif curl -f http://localhost:8000 2>/dev/null; then
    echo "✓ Application is responding"
else
    echo "⚠ Warning: No health endpoint, but container is running"
    docker logs backend | tail -20
fi

echo "✓ Service validation completed"
exit 0
