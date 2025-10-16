@echo off
REM Windows batch script to run Zeph Infra API with Docker-Out-of-Docker support
REM This script handles Windows-specific Docker Desktop configuration

echo ========================================
echo Zeph Infra API - Windows Docker Setup
echo ========================================
echo.

REM Check if Docker Desktop is running
echo [SETUP] Checking Docker Desktop status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running or not accessible
    echo [ERROR] Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo [SETUP] ✅ Docker Desktop is running

REM Check if docker-compose is available
echo [SETUP] Checking docker-compose availability...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] docker-compose is not available
    echo [ERROR] Please ensure Docker Desktop includes docker-compose
    pause
    exit /b 1
)
echo [SETUP] ✅ docker-compose is available

REM Create repos directory if it doesn't exist
if not exist "repos" (
    echo [SETUP] Creating repos directory...
    mkdir repos
    echo [SETUP] ✅ repos directory created
) else (
    echo [SETUP] ✅ repos directory exists
)

REM Stop any existing containers
echo [SETUP] Stopping any existing containers...
docker-compose down >nul 2>&1

REM Build and start the application
echo [SETUP] Building and starting Zeph Infra API...
echo [SETUP] This may take a few minutes on first run...
echo.

docker-compose up --build

REM If the command fails, show error information
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start Zeph Infra API
    echo [ERROR] Check the logs above for details
    echo.
    echo [DEBUG] Common troubleshooting steps:
    echo 1. Ensure Docker Desktop is running
    echo 2. Check if port 3000 is available
    echo 3. Verify Docker Desktop has sufficient resources
    echo 4. Try running: docker-compose down && docker-compose up --build
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Zeph Infra API has been stopped
echo [INFO] To start again, run: docker-compose up
echo [INFO] To start in background: docker-compose up -d
echo [INFO] To view logs: docker-compose logs -f
echo.
pause
