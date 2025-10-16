const express = require('express');
const cors = require('cors');
const simpleGit = require('simple-git');
const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Docker
const docker = new Docker();

// Directory to store cloned repositories
const REPOS_DIR = path.join(__dirname, 'repos');

// Ensure repos directory exists
console.log(`[INIT] Ensuring repos directory exists: ${REPOS_DIR}`);
fs.ensureDirSync(REPOS_DIR);
console.log(`[INIT] Repos directory ready: ${REPOS_DIR}`);

// Check Git availability
async function checkGitAvailability() {
  try {
    console.log(`[INIT] Checking Git availability...`);
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const { stdout } = await execAsync('git --version');
    console.log(`[INIT] Git is available: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.error(`[INIT] Git is not available:`, error.message);
    console.error(`[INIT] Please ensure Git is installed in the container`);
    return false;
  }
}

// Check Docker availability
async function checkDockerAvailability() {
  try {
    console.log(`[INIT] Checking Docker availability...`);
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const { stdout } = await execAsync('docker --version');
    console.log(`[INIT] Docker CLI is available: ${stdout.trim()}`);
    
    // Test Docker daemon connection
    console.log(`[INIT] Testing Docker daemon connection...`);
    try {
      const { stdout: info } = await execAsync('docker info --format "{{.ServerVersion}}"');
      console.log(`[INIT] Docker daemon is accessible: Server version ${info.trim()}`);
      return true;
    } catch (daemonError) {
      console.error(`[INIT] Docker daemon is not accessible:`, daemonError.message);
      console.error(`[INIT] Please ensure Docker socket is properly mounted`);
      console.error(`[INIT] Run with: -v /var/run/docker.sock:/var/run/docker.sock`);
      return false;
    }
  } catch (error) {
    console.error(`[INIT] Docker CLI is not available:`, error.message);
    console.error(`[INIT] Please ensure Docker CLI is installed in the container`);
    return false;
  }
}

// Check Docker Compose availability
async function checkDockerComposeAvailability() {
  try {
    console.log(`[INIT] Checking Docker Compose availability...`);
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Try docker-compose first (standalone)
    try {
      const { stdout } = await execAsync('docker-compose --version');
      console.log(`[INIT] Docker Compose (standalone) is available: ${stdout.trim()}`);
      return 'docker-compose';
    } catch (error) {
      // Try docker compose (plugin)
      try {
        const { stdout } = await execAsync('docker compose version');
        console.log(`[INIT] Docker Compose (plugin) is available: ${stdout.trim()}`);
        return 'docker compose';
      } catch (error2) {
        console.error(`[INIT] Docker Compose is not available:`, error2.message);
        return null;
      }
    }
  } catch (error) {
    console.error(`[INIT] Error checking Docker Compose:`, error.message);
    return null;
  }
}

// Check availability on startup
let gitAvailable = false;
let dockerAvailable = false;
let dockerComposeCommand = null;

checkGitAvailability().then(available => {
  gitAvailable = available;
  if (!available) {
    console.warn(`[INIT] ⚠️  Git is not available - deploy functionality will be limited`);
  }
});

checkDockerAvailability().then(available => {
  dockerAvailable = available;
  if (!available) {
    console.warn(`[INIT] ⚠️  Docker is not available - deploy functionality will be limited`);
  }
});

checkDockerComposeAvailability().then(command => {
  dockerComposeCommand = command;
  if (!command) {
    console.warn(`[INIT] ⚠️  Docker Compose is not available - docker-compose deployments will fail`);
  }
});

// Function to clone repository
async function cloneRepository(repoUrl, repoName) {
  try {
    console.log(`[CLONE] Starting repository clone operation`);
    console.log(`[CLONE] Repository URL: ${repoUrl}`);
    console.log(`[CLONE] Repository name: ${repoName}`);
    
    // Check if Git is available
    if (!gitAvailable) {
      console.error(`[CLONE] Git is not available - cannot clone repository`);
      throw new Error('Git is not installed or not available in the container. Please ensure Git is installed.');
    }
    
    const repoPath = path.join(REPOS_DIR, repoName);
    console.log(`[CLONE] Target path: ${repoPath}`);
    
    // Remove existing directory if it exists
    if (await fs.pathExists(repoPath)) {
      console.log(`[CLONE] Existing directory found, removing: ${repoPath}`);
      await fs.remove(repoPath);
      console.log(`[CLONE] Existing directory removed successfully`);
    }
    
    console.log(`[CLONE] Initializing Git client`);
    const git = simpleGit();
    
    console.log(`[CLONE] Starting clone operation...`);
    const startTime = Date.now();
    await git.clone(repoUrl, repoPath);
    const endTime = Date.now();
    
    console.log(`[CLONE] Repository cloned successfully in ${endTime - startTime}ms`);
    console.log(`[CLONE] Final repository path: ${repoPath}`);
    
    // Verify the clone was successful
    const files = await fs.readdir(repoPath);
    console.log(`[CLONE] Repository contains ${files.length} files/directories`);
    console.log(`[CLONE] Repository contents:`, files);
    
    return repoPath;
  } catch (error) {
    console.error(`[CLONE] Error cloning repository:`, error);
    console.error(`[CLONE] Error details:`, {
      message: error.message,
      stack: error.stack,
      repoUrl: repoUrl,
      repoName: repoName,
      gitAvailable: gitAvailable
    });
    
    // Provide more specific error messages
    if (error.message.includes('spawn git ENOENT')) {
      throw new Error('Git is not installed or not available in the container. Please ensure Git is installed and accessible.');
    } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
      throw new Error(`Repository not found or does not exist: ${repoUrl}`);
    } else if (error.message.includes('permission denied') || error.message.includes('authentication')) {
      throw new Error(`Permission denied or authentication failed for repository: ${repoUrl}`);
    } else {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }
}

// Function to build and run Docker container
async function deployWithDocker(repoPath) {
  try {
    console.log(`[DOCKER] Starting Docker deployment process`);
    console.log(`[DOCKER] Repository path: ${repoPath}`);
    
    const dockerfilePath = path.join(repoPath, 'Dockerfile');
    const dockerComposePath = path.join(repoPath, 'docker-compose.yml');
    
    console.log(`[DOCKER] Checking for Dockerfile at: ${dockerfilePath}`);
    console.log(`[DOCKER] Checking for docker-compose.yml at: ${dockerComposePath}`);
    
    // Check if Dockerfile and docker-compose.yml exist
    const dockerfileExists = await fs.pathExists(dockerfilePath);
    const dockerComposeExists = await fs.pathExists(dockerComposePath);
    
    console.log(`[DOCKER] Dockerfile exists: ${dockerfileExists}`);
    console.log(`[DOCKER] docker-compose.yml exists: ${dockerComposeExists}`);
    
    // If neither Dockerfile nor docker-compose.yml exists, throw error
    if (!dockerfileExists && !dockerComposeExists) {
      console.error(`[DOCKER] Neither Dockerfile nor docker-compose.yml found in repository`);
      throw new Error('Neither Dockerfile nor docker-compose.yml found in repository. At least one is required for deployment.');
    }
    
    // If only Dockerfile exists (no docker-compose.yml), proceed with Dockerfile deployment
    if (dockerfileExists && !dockerComposeExists) {
      console.log(`[DOCKER] Only Dockerfile found, proceeding with Dockerfile deployment`);
    }
    
    // If only docker-compose.yml exists (no Dockerfile), proceed with docker-compose deployment
    if (!dockerfileExists && dockerComposeExists) {
      console.log(`[DOCKER] Only docker-compose.yml found, proceeding with docker-compose deployment (no Dockerfile required)`);
    }
    
    // If both exist, prefer docker-compose
    if (dockerfileExists && dockerComposeExists) {
      console.log(`[DOCKER] Both Dockerfile and docker-compose.yml found, using docker-compose (preferred method)`);
    }
    
    // Generate a unique container name
    const containerName = `zeph-deploy-${Date.now()}`;
    console.log(`[DOCKER] Generated container name: ${containerName}`);
    
    // If docker-compose.yml exists, use docker-compose
    if (dockerComposeExists) {
      console.log(`[DOCKER] Found docker-compose.yml, using docker-compose to deploy`);
      
      // Check if Docker Compose is available
      if (!dockerComposeCommand) {
        console.error(`[DOCKER] Docker Compose is not available - cannot deploy with docker-compose`);
        throw new Error('Docker Compose is not installed or not available. Please ensure Docker Compose is installed on the host machine.');
      }
      
      // Build and run with docker-compose
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const composeCommand = `${dockerComposeCommand} up -d --build`;
      console.log(`[DOCKER] Setting COMPOSE_PROJECT_NAME to: ${containerName}`);
      console.log(`[DOCKER] Changing working directory to: ${repoPath}`);
      console.log(`[DOCKER] Executing: ${composeCommand}`);
      
      const startTime = Date.now();
      const result = await execAsync(composeCommand, { 
        cwd: repoPath,
        env: { ...process.env, COMPOSE_PROJECT_NAME: containerName }
      });
      const endTime = Date.now();
      
      console.log(`[DOCKER] Docker Compose command completed in ${endTime - startTime}ms`);
      console.log(`[DOCKER] Command stdout:`, result.stdout);
      if (result.stderr) {
        console.log(`[DOCKER] Command stderr:`, result.stderr);
      }
      
      console.log(`[DOCKER] Docker Compose deployment completed for: ${containerName}`);
      return { 
        success: true, 
        method: 'docker-compose',
        containerName: containerName,
        path: repoPath,
        buildTime: endTime - startTime,
        composeCommand: dockerComposeCommand
      };
    } else {
      console.log(`[DOCKER] No docker-compose.yml found, using Dockerfile directly`);
      
      // Check if Docker is available
      if (!dockerAvailable) {
        console.error(`[DOCKER] Docker is not available - cannot deploy with Dockerfile`);
        throw new Error('Docker is not installed or not available. Please ensure Docker is installed on the host machine.');
      }
      
      // Build image from Dockerfile
      const imageName = `zeph-image-${Date.now()}`;
      console.log(`[DOCKER] Generated image name: ${imageName}`);
      
      console.log(`[DOCKER] Starting Docker image build...`);
      const buildStartTime = Date.now();
      
      const stream = await docker.buildImage({
        context: repoPath,
        src: ['Dockerfile']
      }, { t: imageName });
      
      console.log(`[DOCKER] Docker build stream created, waiting for completion...`);
      
      // Wait for build to complete
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => {
          if (err) {
            console.error(`[DOCKER] Build failed:`, err);
            reject(err);
          } else {
            const buildEndTime = Date.now();
            console.log(`[DOCKER] Image build completed in ${buildEndTime - buildStartTime}ms`);
            console.log(`[DOCKER] Build result:`, res);
            resolve(res);
          }
        });
      });
      
      console.log(`[DOCKER] Creating container with image: ${imageName}`);
      const container = await docker.createContainer({
        Image: imageName,
        name: containerName,
        AttachStdout: true,
        AttachStderr: true
      });
      
      console.log(`[DOCKER] Container created with ID: ${container.id}`);
      console.log(`[DOCKER] Starting container...`);
      
      await container.start();
      
      console.log(`[DOCKER] Container started successfully: ${containerName}`);
      console.log(`[DOCKER] Container ID: ${container.id}`);
      
      return { 
        success: true, 
        method: 'dockerfile',
        containerName: containerName,
        imageName: imageName,
        path: repoPath,
        containerId: container.id
      };
    }
  } catch (error) {
    console.error(`[DOCKER] Error deploying with Docker:`, error);
    console.error(`[DOCKER] Error details:`, {
      message: error.message,
      stack: error.stack,
      repoPath: repoPath
    });
    throw new Error(`Docker deployment failed: ${error.message}`);
  }
}

// Middleware
console.log(`[INIT] Setting up middleware...`);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[MIDDLEWARE] ${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip || req.connection.remoteAddress}`);
  next();
});

app.use(cors());
console.log(`[INIT] CORS middleware enabled`);

app.use(express.json());
console.log(`[INIT] JSON parsing middleware enabled`);

console.log(`[INIT] Middleware setup completed`);

// Health check endpoint
app.get('/', (req, res) => {
  console.log(`[API] Health check endpoint accessed`);
  console.log(`[API] Request from IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`[API] User-Agent: ${req.get('User-Agent')}`);
  
  const response = { 
    message: 'Zeph Infra API is running!',
    endpoints: {
      'POST /api/action': 'Send JSON with action field. For deploy action, include "link" field with repository URL'
    },
    deploy: {
      description: 'Deploy action clones a repository and creates Docker container',
      required_fields: ['action: "deploy"', 'link: "repository_url"'],
      supported_files: ['Dockerfile', 'docker-compose.yml']
    }
  };
  
  console.log(`[API] Health check response sent`);
  res.json(response);
});

// Main endpoint to receive JSON and print action field
app.post('/api/action', async (req, res) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[API] POST /api/action request received - ID: ${requestId}`);
    console.log(`[API] Request from IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`[API] User-Agent: ${req.get('User-Agent')}`);
    console.log(`[API] Content-Type: ${req.get('Content-Type')}`);
    console.log(`[API] Request body:`, JSON.stringify(req.body, null, 2));
    
    const { action, link } = req.body;
    
    if (!action) {
      console.log(`[API] Request ${requestId} - Missing action field`);
      return res.status(400).json({ 
        error: 'Missing "action" field in request body',
        requestId: requestId
      });
    }
    
    console.log(`[API] Request ${requestId} - Action received: ${action}`);
    
    // Handle deploy action
    if (action === 'deploy') {
      console.log(`[API] Request ${requestId} - Processing deploy action`);
      
      if (!link) {
        console.log(`[API] Request ${requestId} - Missing link field for deploy action`);
        return res.status(400).json({ 
          error: 'Missing "link" field for deploy action',
          requestId: requestId
        });
      }
      
      try {
        console.log(`[API] Request ${requestId} - Starting deployment process`);
        console.log(`[API] Request ${requestId} - Repository link: ${link}`);
        
        const deployStartTime = Date.now();
        
        // Extract repository name from URL
        const repoName = path.basename(link, '.git') || `repo-${Date.now()}`;
        console.log(`[API] Request ${requestId} - Extracted repository name: ${repoName}`);
        
        // Clone the repository
        console.log(`[API] Request ${requestId} - Starting repository clone`);
        const repoPath = await cloneRepository(link, repoName);
        console.log(`[API] Request ${requestId} - Repository cloned successfully to: ${repoPath}`);
        
        // Deploy with Docker
        console.log(`[API] Request ${requestId} - Starting Docker deployment`);
        const deployResult = await deployWithDocker(repoPath);
        console.log(`[API] Request ${requestId} - Docker deployment completed`);
        
        const deployEndTime = Date.now();
        const totalDeployTime = deployEndTime - deployStartTime;
        
        console.log(`[API] Request ${requestId} - Total deployment time: ${totalDeployTime}ms`);
        console.log(`[API] Request ${requestId} - Deployment completed successfully`);
        
        const response = { 
          success: true, 
          message: 'Deployment completed successfully',
          action: action,
          link: link,
          deployment: {
            ...deployResult,
            totalTime: totalDeployTime
          },
          requestId: requestId
        };
        
        console.log(`[API] Request ${requestId} - Sending success response`);
        return res.json(response);
        
      } catch (deployError) {
        console.error(`[API] Request ${requestId} - Deployment failed:`, deployError);
        console.error(`[API] Request ${requestId} - Deployment error details:`, {
          message: deployError.message,
          stack: deployError.stack,
          action: action,
          link: link
        });
        
        const errorResponse = { 
          error: 'Deployment failed',
          details: deployError.message,
          action: action,
          link: link,
          requestId: requestId
        };
        
        console.log(`[API] Request ${requestId} - Sending error response`);
        return res.status(500).json(errorResponse);
      }
    }
    
    // Return success response for other actions
    console.log(`[API] Request ${requestId} - Processing non-deploy action: ${action}`);
    const response = { 
      success: true, 
      message: 'Action received and printed successfully',
      action: action,
      requestId: requestId
    };
    
    console.log(`[API] Request ${requestId} - Sending success response for action: ${action}`);
    res.json(response);
    
  } catch (error) {
    console.error(`[API] Request ${requestId} - Error processing request:`, error);
    console.error(`[API] Request ${requestId} - Error details:`, {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    
    const errorResponse = { 
      error: 'Internal server error',
      requestId: requestId
    };
    
    console.log(`[API] Request ${requestId} - Sending internal error response`);
    res.status(500).json(errorResponse);
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`[API] 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`[API] Request from IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`[API] User-Agent: ${req.get('User-Agent')}`);
  
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl
  });
});

// Start server
console.log(`[INIT] Starting Zeph Infra API server...`);
console.log(`[INIT] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[INIT] Node.js version: ${process.version}`);
console.log(`[INIT] Platform: ${process.platform}`);
console.log(`[INIT] Architecture: ${process.arch}`);

app.listen(PORT, () => {
  console.log(`[INIT] 🚀 Zeph Infra API server running on port ${PORT}`);
  console.log(`[INIT] 📡 Health check: http://localhost:${PORT}`);
  console.log(`[INIT] 📤 Action endpoint: POST http://localhost:${PORT}/api/action`);
  console.log(`[INIT] 📁 Repos directory: ${REPOS_DIR}`);
  console.log(`[INIT] 🐳 Docker integration: ${docker ? 'Enabled' : 'Disabled'}`);
  console.log(`[INIT] ✅ Server initialization completed successfully`);
});

module.exports = app;
