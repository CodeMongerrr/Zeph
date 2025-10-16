#!/bin/sh

# Docker-Out-of-Docker (DooD) Startup Script for Windows Docker Desktop
# This script handles Docker socket permissions and user switching

echo "[STARTUP] Starting Zeph Infra API with Docker-Out-of-Docker support"
echo "[STARTUP] Platform: $(uname -a)"
echo "[STARTUP] Current user: $(whoami)"
echo "[STARTUP] Current user ID: $(id)"

# Check if Docker socket exists
DOCKER_SOCKET="/var/run/docker.sock"
if [ -S "$DOCKER_SOCKET" ]; then
    echo "[STARTUP] Docker socket found at: $DOCKER_SOCKET"
    
    # Get Docker socket permissions
    SOCKET_PERMS=$(ls -la "$DOCKER_SOCKET" 2>/dev/null || echo "Unable to read socket permissions")
    echo "[STARTUP] Docker socket permissions: $SOCKET_PERMS"
    
    # Get Docker socket group ID
    SOCKET_GID=$(stat -c '%g' "$DOCKER_SOCKET" 2>/dev/null || echo "Unable to get socket GID")
    echo "[STARTUP] Docker socket group ID: $SOCKET_GID"
    
    # Check if docker group exists and has the correct GID
    if [ "$SOCKET_GID" != "Unable to get socket GID" ] && [ "$SOCKET_GID" != "0" ]; then
        echo "[STARTUP] Updating docker group GID to match socket: $SOCKET_GID"
        
        # Update docker group GID to match the socket
        if command -v groupmod >/dev/null 2>&1; then
            groupmod -g "$SOCKET_GID" docker 2>/dev/null || echo "[STARTUP] Warning: Could not modify docker group GID"
        else
            echo "[STARTUP] Warning: groupmod not available, using delgroup/addgroup"
            delgroup docker 2>/dev/null || true
            addgroup -g "$SOCKET_GID" docker 2>/dev/null || echo "[STARTUP] Warning: Could not create docker group with GID $SOCKET_GID"
        fi
        
        # Add nodejs user to docker group
        echo "[STARTUP] Adding nodejs user to docker group"
        adduser nodejs docker 2>/dev/null || echo "[STARTUP] Warning: Could not add nodejs user to docker group"
        
        # Verify docker group membership
        GROUPS=$(groups nodejs 2>/dev/null || echo "Unable to get groups")
        echo "[STARTUP] nodejs user groups: $GROUPS"
    else
        echo "[STARTUP] Warning: Docker socket GID is 0 (root) or unreadable"
        echo "[STARTUP] This may indicate permission issues"
    fi
else
    echo "[STARTUP] Warning: Docker socket not found at $DOCKER_SOCKET"
    echo "[STARTUP] Docker functionality may not work properly"
fi

# Test Docker access as root first
echo "[STARTUP] Testing Docker access as root..."
if docker info >/dev/null 2>&1; then
    echo "[STARTUP] ✅ Docker access confirmed as root"
else
    echo "[STARTUP] ❌ Docker access failed as root"
    echo "[STARTUP] Docker error details:"
    docker info 2>&1 || true
fi

# Switch to nodejs user and test Docker access
echo "[STARTUP] Switching to nodejs user and testing Docker access..."
if su-exec nodejs docker info >/dev/null 2>&1; then
    echo "[STARTUP] ✅ Docker access confirmed as nodejs user"
    echo "[STARTUP] Starting application as nodejs user..."
    exec su-exec nodejs node server.js
else
    echo "[STARTUP] ❌ Docker access failed as nodejs user"
    echo "[STARTUP] Docker error details:"
    su-exec nodejs docker info 2>&1 || true
    echo "[STARTUP] Starting application as root (Docker access may be limited)..."
    exec node server.js
fi
