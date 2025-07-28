#!/bin/bash

# Setup script for Docker-based frontend builds on EC2
# This script installs Docker and prepares the environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Setting up Docker for frontend builds...${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Running as root. This is fine for setup.${NC}"
fi

# Update package list
echo -e "${YELLOW}📦 Updating package list...${NC}"
apt-get update

# Install required packages
echo -e "${YELLOW}📦 Installing Docker and dependencies...${NC}"
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# Add Docker's official GPG key
echo -e "${YELLOW}🔑 Adding Docker GPG key...${NC}"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo -e "${YELLOW}📋 Adding Docker repository...${NC}"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
apt-get update

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker service
echo -e "${YELLOW}🚀 Starting Docker service...${NC}"
systemctl start docker
systemctl enable docker

# Create docker group and add user
echo -e "${YELLOW}👥 Setting up Docker group...${NC}"
groupadd -f docker

# Get the actual username (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
if [ "$ACTUAL_USER" != "root" ]; then
    usermod -aG docker $ACTUAL_USER
    echo -e "${GREEN}✅ Added user '$ACTUAL_USER' to docker group${NC}"
else
    echo -e "${YELLOW}⚠️  Running as root, skipping user group setup${NC}"
fi

# Verify installation
echo -e "${YELLOW}🔍 Verifying Docker installation...${NC}"
if docker --version; then
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${RED}❌ Docker installation failed${NC}"
    exit 1
fi

# Test Docker
echo -e "${YELLOW}🧪 Testing Docker...${NC}"
if docker run --rm hello-world; then
    echo -e "${GREEN}✅ Docker test successful${NC}"
else
    echo -e "${RED}❌ Docker test failed${NC}"
    exit 1
fi

# Set up project directory permissions
echo -e "${YELLOW}📁 Setting up project directory permissions...${NC}"
PROJECT_DIR="/opt/dh-portfolio/daniel_hill_site"
if [ -d "$PROJECT_DIR" ]; then
    chown -R $ACTUAL_USER:$ACTUAL_USER $PROJECT_DIR
    echo -e "${GREEN}✅ Project directory permissions updated${NC}"
else
    echo -e "${YELLOW}⚠️  Project directory not found at $PROJECT_DIR${NC}"
fi

# Make build script executable
FRONTEND_DIR="$PROJECT_DIR/frontend"
if [ -d "$FRONTEND_DIR" ]; then
    chmod +x "$FRONTEND_DIR/build-with-docker.sh"
    echo -e "${GREEN}✅ Build script made executable${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend directory not found at $FRONTEND_DIR${NC}"
fi

echo -e "${GREEN}🎉 Docker setup completed successfully!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "   1. Log out and log back in (or run: newgrp docker)"
echo -e "   2. Navigate to your project: cd $PROJECT_DIR/frontend"
echo -e "   3. Run the build: ./build-with-docker.sh"
echo -e ""
echo -e "${YELLOW}💡 Note: You may need to log out and back in for group changes to take effect.${NC}" 