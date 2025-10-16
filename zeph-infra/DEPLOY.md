# Deploy Functionality

The Zeph Infra API now supports automatic deployment of repositories using Docker.

## How to Use

Send a POST request to `/api/action` with the following JSON structure:

```json
{
  "action": "deploy",
  "link": "https://github.com/username/repository.git"
}
```

## Requirements

1. **Repository must contain at least one of:**
   - `Dockerfile` (for direct Docker builds)
   - `docker-compose.yml` (for multi-container deployments)
   - Both files (docker-compose.yml will be preferred)

2. **System requirements:**
   - Docker must be installed and running on the host machine
   - Docker Compose must be available on the host machine (either `docker-compose` or `docker compose`)
   - Git must be installed and available in the container
   - Node.js dependencies must be installed

3. **Container requirements:**
   - The Dockerfile includes Git, Docker CLI, and Docker Compose installation
   - Git, Docker CLI, Docker daemon connection, and Docker Compose are automatically checked on server startup
   - Docker socket must be mounted to access host Docker daemon
   - If any required tool is not available, deploy operations will fail with a clear error message

## How it Works

1. **Repository Cloning**: The API clones the repository from the provided link
2. **Docker Detection**: Checks for `Dockerfile` and `docker-compose.yml`
3. **Deployment Logic**:
   - **Both files exist**: Uses `docker-compose up -d --build` (preferred method)
   - **Only `docker-compose.yml` exists**: Uses `docker-compose up -d --build` (no Dockerfile required)
   - **Only `Dockerfile` exists**: Builds image and runs container directly
   - **Neither file exists**: Returns error (at least one is required)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Deployment completed successfully",
  "action": "deploy",
  "link": "https://github.com/username/repository.git",
  "deployment": {
    "success": true,
    "method": "docker-compose",
    "containerName": "zeph-deploy-1234567890",
    "path": "/path/to/cloned/repo"
  }
}
```

### Error Response
```json
{
  "error": "Deployment failed",
  "details": "Error message here",
  "action": "deploy",
  "link": "https://github.com/username/repository.git",
  "requestId": "req-1703123456789-abc123def"
}
```

### Common Error Messages

- **Git not available**: `"Git is not installed or not available in the container. Please ensure Git is installed and accessible."`
- **Docker not available**: `"Docker is not installed or not available. Please ensure Docker is installed on the host machine."`
- **Docker Compose not available**: `"Docker Compose is not installed or not available. Please ensure Docker Compose is installed on the host machine."`
- **Repository not found**: `"Repository not found or does not exist: [URL]"`
- **Permission denied**: `"Permission denied or authentication failed for repository: [URL]"`
- **No Docker files**: `"Neither Dockerfile nor docker-compose.yml found in repository. At least one is required for deployment."`

## Installation

Install the required dependencies:

```bash
npm install
```

## Building and Running with Docker

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the service
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Option 2: Using Docker directly

Build the Docker image:

```bash
docker build -t zeph-infra-api .
```

Run the container with Docker socket mounting (to access host Docker):

```bash
# For Linux/macOS
docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock zeph-infra-api

# For Windows (PowerShell)
docker run -p 3000:3000 -v \\.\pipe\docker_engine:\\.\pipe\docker_engine zeph-infra-api
```

**Important**: The container must have access to the host's Docker daemon to deploy containers. This is achieved by mounting the Docker socket.

### Troubleshooting Docker Socket Issues

If you see errors like `docker: not found`, `Docker daemon is not accessible`, or `permission denied`, try these solutions:

#### 1. **Permission Denied Errors**

If you see `permission denied while trying to connect to the Docker daemon socket`:

```bash
# Check Docker socket permissions on host
ls -la /var/run/docker.sock

# Fix socket permissions (if needed)
sudo chmod 666 /var/run/docker.sock

# Or add your user to docker group
sudo usermod -aG docker $USER
# Then logout and login again
```

#### 2. **Verify Docker socket mounting**:
   ```bash
   # Check if socket is mounted
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock alpine ls -la /var/run/docker.sock
   ```

#### 3. **Check Docker daemon status**:
   ```bash
   # On host machine
   docker info
   ```

#### 4. **Alternative socket paths** (if default doesn't work):
   ```bash
   # Some systems use different socket paths
   docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock:ro zeph-infra-api
   ```

#### 5. **Windows users**: Make sure Docker Desktop is running and use:
   ```bash
   docker run -p 3000:3000 -v \\.\pipe\docker_engine:\\.\pipe\docker_engine zeph-infra-api
   ```

#### 6. **Docker Compose Permission Issues**:

If using docker-compose and getting permission errors:

```bash
# Rebuild with no cache to ensure latest changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container logs
docker-compose logs -f zeph-infra-api
```

#### 7. **Check Container User and Groups**:

```bash
# Check if container user has docker group access
docker-compose exec zeph-infra-api id
docker-compose exec zeph-infra-api groups
```

## Running Locally (Development)

```bash
npm start
```

The server will be available at `http://localhost:3000`

**Note**: When running locally, ensure Git is installed on your system.

## Example Usage

```bash
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deploy",
    "link": "https://github.com/username/my-app.git"
  }'
```
