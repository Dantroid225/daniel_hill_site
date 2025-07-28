#!/bin/bash

# Script to build Docker containers with proper certificate handling
# This script ensures certificates are available before building

set -e  # Exit on any error

echo "=== Docker Build with Certificates Script ==="
echo "Date: $(date)"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "✗ Error: docker-compose.yml not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if certificates exist
CERT_FILE="./certs/ca-certificates.crt"
if [ ! -f "$CERT_FILE" ]; then
    echo "⚠️  Warning: Certificate file not found at $CERT_FILE"
    echo ""
    echo "You have two options:"
    echo "1. Run the certificate copy script first:"
    echo "   ./scripts/copy-ec2-certificates.sh"
    echo ""
    echo "2. Continue without certificates (SSL will be disabled):"
    echo "   Press Enter to continue, or Ctrl+C to abort"
    read -r
else
    echo "✓ Certificate file found: $CERT_FILE"
    echo "  Size: $(stat -c%s "$CERT_FILE" 2>/dev/null || stat -f%z "$CERT_FILE" 2>/dev/null) bytes"
    echo "  Certificates: $(grep -c "BEGIN CERTIFICATE" "$CERT_FILE" 2>/dev/null || echo "0")"
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Please ensure your environment variables are set:"
    echo "  - DB_HOST"
    echo "  - DB_USER" 
    echo "  - DB_PASSWORD"
    echo "  - DB_NAME"
    echo "  - DB_PORT"
    echo "  - JWT_SECRET"
    echo "  - SESSION_SECRET"
    echo "  - ALLOWED_ORIGINS"
    echo ""
    echo "Press Enter to continue, or Ctrl+C to abort"
    read -r
else
    echo "✓ .env file found"
    echo ""
fi

# Function to build and test containers
build_containers() {
    echo "=== Building Docker Containers ==="
    
    # Stop existing containers
    echo "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Build containers
    echo "Building containers..."
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        echo "✓ Containers built successfully"
    else
        echo "✗ Container build failed"
        exit 1
    fi
    echo ""
}

# Function to start and test containers
start_containers() {
    echo "=== Starting Docker Containers ==="
    
    # Start containers
    echo "Starting containers..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✓ Containers started successfully"
    else
        echo "✗ Container startup failed"
        exit 1
    fi
    echo ""
    
    # Wait for containers to be ready
    echo "Waiting for containers to be ready..."
    sleep 10
    
    # Check container status
    echo "Container status:"
    docker-compose ps
    echo ""
    
    # Check backend logs for database connection
    echo "Checking backend logs for database connection..."
    docker-compose logs backend | grep -E "(Database|SSL|certificate|connected|failed)" | tail -10
    echo ""
}

# Function to test database connection
test_database_connection() {
    echo "=== Testing Database Connection ==="
    
    # Test backend health endpoint
    echo "Testing backend health endpoint..."
    if curl -f http://localhost:5000/health >/dev/null 2>&1; then
        echo "✓ Backend health check passed"
    else
        echo "✗ Backend health check failed"
        echo "Backend logs:"
        docker-compose logs backend | tail -20
        return 1
    fi
    
    # Test frontend health endpoint
    echo "Testing frontend health endpoint..."
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✓ Frontend health check passed"
    else
        echo "✗ Frontend health check failed"
        echo "Frontend logs:"
        docker-compose logs frontend | tail -20
        return 1
    fi
    
    echo ""
    echo "✓ All health checks passed!"
    echo ""
    echo "Your application is now running:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend:  http://localhost:5000"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop containers:"
    echo "  docker-compose down"
    
    return 0
}

# Main execution
echo "Starting build process..."
echo ""

# Build containers
build_containers

# Start containers
start_containers

# Test connections
if test_database_connection; then
    echo "=== Build and Deployment Complete ==="
    echo "✓ All systems operational!"
else
    echo "=== Build Complete with Issues ==="
    echo "⚠️  Some tests failed. Check the logs above for details."
    echo ""
    echo "To troubleshoot:"
    echo "1. Check container logs: docker-compose logs"
    echo "2. Verify database credentials in .env file"
    echo "3. Ensure RDS instance is accessible"
    echo "4. Check if certificates are properly mounted"
    exit 1
fi 