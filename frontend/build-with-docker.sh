#!/bin/bash

# Docker-based frontend build script
# This script builds the frontend using Docker with Node.js 20

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="dh-portfolio-frontend-builder"
CONTAINER_NAME="temp-builder-$(date +%s)"
BUILD_DIR="./dist"

echo -e "${GREEN}🚀 Starting Docker-based frontend build...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker image...${NC}"

# Build the Docker image
if docker build -f Dockerfile.build -t $IMAGE_NAME .; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Creating temporary container...${NC}"

# Create a temporary container
if docker create --name $CONTAINER_NAME $IMAGE_NAME; then
    echo -e "${GREEN}✅ Temporary container created${NC}"
else
    echo -e "${RED}❌ Failed to create temporary container${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Extracting built files...${NC}"

# Remove existing dist directory if it exists
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo -e "${YELLOW}🗑️  Removed existing dist directory${NC}"
fi

# Copy built files from container
if docker cp $CONTAINER_NAME:/usr/share/nginx/html ./dist; then
    echo -e "${GREEN}✅ Built files extracted successfully${NC}"
else
    echo -e "${RED}❌ Failed to extract built files${NC}"
    # Clean up container even if extraction failed
    docker rm $CONTAINER_NAME
    exit 1
fi

echo -e "${YELLOW}🧹 Cleaning up...${NC}"

# Remove temporary container
if docker rm $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Temporary container removed${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Failed to remove temporary container${NC}"
fi

# Remove Docker image to save space (optional)
read -p "Do you want to remove the Docker image to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if docker rmi $IMAGE_NAME; then
        echo -e "${GREEN}✅ Docker image removed${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Failed to remove Docker image${NC}"
    fi
fi

# Show build results
echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo -e "${YELLOW}📊 Build results:${NC}"
echo -e "   📁 Built files: $BUILD_DIR"
echo -e "   📏 Directory size: $(du -sh $BUILD_DIR | cut -f1)"

# List the built files
echo -e "${YELLOW}📋 Built files:${NC}"
ls -la $BUILD_DIR

echo -e "${GREEN}✅ Docker-based build completed!${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "   1. Test the built files: serve $BUILD_DIR"
echo -e "   2. Deploy to your web server"
echo -e "   3. Update your reverse proxy configuration if needed" 