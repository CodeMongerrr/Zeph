# Docker-Out-of-Docker (DooD) Configuration for Windows

This document explains how the Zeph Infra API is configured to run Docker containers from within a Docker container on Windows using Docker Desktop.

## Overview

The Docker-Out-of-Docker (DooD) pattern allows a containerized application to create and manage other Docker containers by accessing the host's Docker daemon through a mounted socket.

## Windows Docker Desktop Considerations

### Docker Socket Location
On Windows with Docker Desktop, the Docker socket is available at `/var/run/docker.sock` within the WSL2 environment or Linux containers. The socket is automatically mounted and accessible to containers.

### Permission Handling
Windows Docker Desktop handles socket permissions differently than native Linux. The configuration includes:

1. **Dynamic Group ID Adjustment**: The startup script detects the actual Docker socket group ID and adjusts the container's docker group accordingly.
2. **User Switching**: The application starts as root to set up permissions, then switches to a non-root user for security.
3. **Fallback Mechanism**: If Docker access fails as the non-root user, the application falls back to running as root.

## Configuration Files

### 1. Docker Compose (`docker-compose.yml`)

```yaml
volumes:
  # Mount Docker socket to access host Docker daemon
  - /var/run/docker.sock:/var/run/docker.sock:ro

environment:
  # Docker-Out-of-Docker configuration
  - DOCKER_HOST=unix:///var/run/docker.sock
  # Windows-specific Docker Desktop settings
  - COMPOSE_CONVERT_WINDOWS_PATHS=1
  - COMPOSE_FORCE_WINDOWS_HOST=1
```

**Key Points:**
- Socket is mounted as read-only (`:ro`) for security
- `COMPOSE_CONVERT_WINDOWS_PATHS=1` ensures Windows path compatibility
- `COMPOSE_FORCE_WINDOWS_HOST=1` forces Windows host behavior

### 2. Dockerfile

```dockerfile
# Install Docker CLI and permission management tools
RUN apk add --no-cache docker-cli docker-compose su-exec shadow

# Create docker group (GID will be updated at runtime)
RUN addgroup -g 998 -S docker

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN adduser nodejs docker

# Use startup script to handle permissions
CMD ["./start.sh"]
```

**Key Points:**
- Installs `shadow` package for advanced user/group management
- Creates docker group with placeholder GID
- Adds nodejs user to docker group
- Uses startup script for dynamic permission handling

### 3. Startup Script (`start.sh`)

The startup script performs the following operations:

1. **Socket Detection**: Checks if Docker socket exists and is accessible
2. **Permission Analysis**: Reads the actual socket group ID
3. **Group Adjustment**: Updates the container's docker group to match the socket
4. **User Management**: Ensures the nodejs user is in the docker group
5. **Access Testing**: Verifies Docker access as both root and nodejs user
6. **User Switching**: Switches to nodejs user if Docker access is successful

## Usage

### Starting the Application

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Testing Docker Access

The application will log detailed information about Docker access during startup:

```
[STARTUP] Docker socket found at: /var/run/docker.sock
[STARTUP] Docker socket group ID: 999
[STARTUP] ✅ Docker access confirmed as nodejs user
```

### API Endpoints

The application provides endpoints to test Docker functionality:

- `GET /` - Health check with Docker status
- `POST /api/action` - Deploy repositories using Docker

Example deployment request:
```json
{
  "action": "deploy",
  "link": "https://github.com/user/repo.git"
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   ```
   Error: permission denied while trying to connect to the Docker daemon socket
   ```
   **Solution**: Check that Docker Desktop is running and the socket is properly mounted.

2. **Socket Not Found**
   ```
   Warning: Docker socket not found at /var/run/docker.sock
   ```
   **Solution**: Ensure Docker Desktop is running and the volume mount is correct.

3. **Group ID Mismatch**
   ```
   Warning: Docker socket GID is 0 (root) or unreadable
   ```
   **Solution**: This may indicate Docker Desktop configuration issues. Try restarting Docker Desktop.

### Debug Commands

```bash
# Check Docker socket permissions
docker exec -it zeph-infra-api ls -la /var/run/docker.sock

# Test Docker access from within container
docker exec -it zeph-infra-api docker info

# Check user groups
docker exec -it zeph-infra-api groups nodejs

# View startup logs
docker logs zeph-infra-api
```

### Windows-Specific Debugging

1. **WSL2 Integration**: Ensure Docker Desktop is using WSL2 backend
2. **Resource Allocation**: Verify Docker Desktop has sufficient resources allocated
3. **Firewall**: Check Windows Firewall settings for Docker Desktop
4. **Antivirus**: Some antivirus software may interfere with Docker socket access

## Security Considerations

1. **Read-Only Socket**: The Docker socket is mounted as read-only to prevent accidental modifications
2. **Non-Root User**: The application runs as a non-root user when possible
3. **Minimal Permissions**: Only necessary Docker permissions are granted
4. **Container Isolation**: The application container is isolated from the host system

## Performance Notes

- **Socket Access**: Direct socket access provides better performance than Docker-in-Docker
- **Resource Usage**: Lower resource overhead compared to nested Docker containers
- **Network**: Containers created by the application share the host's network stack

## Alternative Configurations

### For Different Windows Setups

If you encounter issues with the default configuration, try these alternatives:

1. **Named Pipe Path** (uncomment in docker-compose.yml):
   ```yaml
   - //var/run/docker.sock:/var/run/docker.sock:ro
   ```

2. **TCP Connection** (if socket mounting fails):
   ```yaml
   environment:
     - DOCKER_HOST=tcp://host.docker.internal:2375
   ```

3. **Privileged Mode** (not recommended for production):
   ```yaml
   privileged: true
   ```

## Support

For issues specific to Windows Docker Desktop integration:

1. Check Docker Desktop logs
2. Verify WSL2 integration is enabled
3. Ensure Docker Desktop is up to date
4. Review Windows security software settings

## References

- [Docker Desktop for Windows Documentation](https://docs.docker.com/desktop/windows/)
- [Docker Socket Security](https://docs.docker.com/engine/security/#docker-daemon-attack-surface)
- [Docker-Out-of-Docker Pattern](https://jpetazzo.github.io/2015/09/03/do-not-use-docker-in-docker-for-ci/)
