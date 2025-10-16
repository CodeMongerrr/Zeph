# Use official Node.js runtime as base image
FROM node:18-alpine

# Install Git, Docker CLI, and other necessary tools
# Note: Docker CLI will connect to host's Docker daemon via socket
RUN apk add --no-cache git openssh-client docker-cli docker-compose su-exec shadow

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
# Use npm install if package-lock.json doesn't exist, otherwise use npm ci
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy application source code
COPY . .

# Create docker group first (will be updated at runtime to match host)
# Using a placeholder GID that will be updated by the startup script
RUN addgroup -g 998 -S docker

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Add nodejs user to docker group (will be updated at runtime)
RUN adduser nodejs docker

# Make startup script executable
RUN chmod +x start.sh

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Don't switch to nodejs user here - let startup script handle it
# This allows the startup script to run as root to set up Docker permissions
# The startup script will dynamically adjust docker group GID and switch to nodejs user

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application using the startup script
CMD ["./start.sh"]
