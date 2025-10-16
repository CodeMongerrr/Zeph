# PowerShell script to run Zeph Infra API with Docker-Out-of-Docker support
# This script handles Windows-specific Docker Desktop configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zeph Infra API - Windows Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker Desktop is running
Write-Host "[SETUP] Checking Docker Desktop status..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SETUP] ✅ Docker Desktop is running" -ForegroundColor Green
    } else {
        throw "Docker not accessible"
    }
} catch {
    Write-Host "[ERROR] Docker Desktop is not running or not accessible" -ForegroundColor Red
    Write-Host "[ERROR] Please start Docker Desktop and try again" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if docker-compose is available
Write-Host "[SETUP] Checking docker-compose availability..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SETUP] ✅ docker-compose is available" -ForegroundColor Green
    } else {
        throw "docker-compose not available"
    }
} catch {
    Write-Host "[ERROR] docker-compose is not available" -ForegroundColor Red
    Write-Host "[ERROR] Please ensure Docker Desktop includes docker-compose" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create repos directory if it doesn't exist
if (-not (Test-Path "repos")) {
    Write-Host "[SETUP] Creating repos directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "repos" | Out-Null
    Write-Host "[SETUP] ✅ repos directory created" -ForegroundColor Green
} else {
    Write-Host "[SETUP] ✅ repos directory exists" -ForegroundColor Green
}

# Stop any existing containers
Write-Host "[SETUP] Stopping any existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null | Out-Null

# Build and start the application
Write-Host "[SETUP] Building and starting Zeph Infra API..." -ForegroundColor Yellow
Write-Host "[SETUP] This may take a few minutes on first run..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose up --build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker compose failed"
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to start Zeph Infra API" -ForegroundColor Red
    Write-Host "[ERROR] Check the logs above for details" -ForegroundColor Red
    Write-Host ""
    Write-Host "[DEBUG] Common troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure Docker Desktop is running" -ForegroundColor White
    Write-Host "2. Check if port 3000 is available" -ForegroundColor White
    Write-Host "3. Verify Docker Desktop has sufficient resources" -ForegroundColor White
    Write-Host "4. Try running: docker-compose down && docker-compose up --build" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Zeph Infra API has been stopped" -ForegroundColor Green
Write-Host "[INFO] To start again, run: docker-compose up" -ForegroundColor Cyan
Write-Host "[INFO] To start in background: docker-compose up -d" -ForegroundColor Cyan
Write-Host "[INFO] To view logs: docker-compose logs -f" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
