# Zeph Infra API

A simple Node.js application that receives JSON via API and prints the "action" field to the console.

## Features

- Express.js server
- CORS enabled
- JSON body parsing
- Action field extraction and console logging
- Error handling
- Health check endpoint

## Installation

### Option 1: Local Development

1. Navigate to the zeph-infra directory:
```bash
cd zeph-infra
```

2. Install dependencies:
```bash
npm install
```

### Option 2: Docker (Recommended)

1. Navigate to the zeph-infra directory:
```bash
cd zeph-infra
```

2. Build and run with Docker Compose:
```bash
docker-compose up --build
```

Or run in detached mode:
```bash
docker-compose up -d --build
```

## Usage

### Start the server

#### Local Development:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

#### Docker:
```bash
# Start with docker-compose
docker-compose up

# Or run individual container
docker build -t zeph-infra-api .
docker run -p 3000:3000 zeph-infra-api
```

The server will start on port 3000 by default (or the PORT environment variable if set).

### API Endpoints

#### Health Check
- **GET** `/`
- Returns server status and available endpoints

#### Action Endpoint
- **POST** `/api/action`
- Receives JSON with an "action" field and prints it to console

### Example Usage

#### Using curl:
```bash
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "create_domain", "data": "example.com"}'
```

#### Using JavaScript fetch:
```javascript
fetch('http://localhost:3000/api/action', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'update_token',
    tokenId: 123,
    metadata: { name: 'My Token' }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Example JSON payloads:
```json
{
  "action": "create_domain",
  "domain": "example.com",
  "owner": "0x123..."
}
```

```json
{
  "action": "transfer_token",
  "from": "0xabc...",
  "to": "0xdef...",
  "tokenId": 456
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Action received and printed successfully",
  "action": "create_domain"
}
```

**Error Response:**
```json
{
  "error": "Missing 'action' field in request body"
}
```

## Console Output

When a request is received, the action field will be printed to the console:
```
Action received: create_domain
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Docker Commands

### Basic Docker Commands:
```bash
# Build the image
docker build -t zeph-infra-api .

# Run the container
docker run -p 3000:3000 zeph-infra-api

# Run in detached mode
docker run -d -p 3000:3000 --name zeph-api zeph-infra-api

# View logs
docker logs zeph-api

# Stop the container
docker stop zeph-api

# Remove the container
docker rm zeph-api
```

### Docker Compose Commands:
```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs zeph-infra-api

# Restart services
docker-compose restart

# Remove everything (containers, networks, volumes)
docker-compose down -v
```

### Production with Nginx:
```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing middleware
- **nodemon**: Development dependency for auto-restart

## Docker Features

- **Multi-stage build**: Optimized for production
- **Non-root user**: Enhanced security
- **Health checks**: Built-in container health monitoring
- **Alpine Linux**: Lightweight base image
- **Nginx support**: Optional reverse proxy for production
- **Docker-Out-of-Docker (DooD)**: Can create and manage Docker containers from within the container

## Docker-Out-of-Docker (DooD) Setup

This application is configured to run Docker containers from within a Docker container, which is useful for deployment automation and container orchestration.

### Windows Setup

For Windows users, we provide convenient scripts:

#### Option 1: Batch Script
```cmd
run-windows.bat
```

#### Option 2: PowerShell Script
```powershell
.\run-windows.ps1
```

#### Option 3: Manual Setup
```bash
docker-compose up --build
```

### Features

- **Repository Cloning**: Automatically clones Git repositories
- **Docker Deployment**: Builds and runs Docker containers from cloned repositories
- **Permission Management**: Handles Docker socket permissions automatically
- **Windows Compatibility**: Optimized for Docker Desktop on Windows

### API Endpoints for DooD

#### Deploy Repository
- **POST** `/api/action`
- **Payload**: `{"action": "deploy", "link": "https://github.com/user/repo.git"}`

This endpoint will:
1. Clone the specified repository
2. Look for `Dockerfile` or `docker-compose.yml`
3. Build and run the Docker container
4. Return deployment status

### Documentation

For detailed Docker-Out-of-Docker configuration and troubleshooting, see:
- [DOCKER-OUT-OF-DOCKER.md](./DOCKER-OUT-OF-DOCKER.md) - Comprehensive setup guide
- [DEPLOY.md](./DEPLOY.md) - Deployment instructions
