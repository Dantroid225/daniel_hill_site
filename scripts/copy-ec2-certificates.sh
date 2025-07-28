#!/bin/bash

# Script to copy EC2's certificate store for Docker build
# This should be run on the EC2 instance before building Docker containers

set -e

echo "Copying EC2 certificate store for Docker build..."

# Remove existing certs directory if it exists
if [ -d "certs" ]; then
    echo "Removing existing certs directory..."
    # Try to remove with elevated permissions if needed
    if ! rm -rf certs 2>/dev/null; then
        echo "Permission denied, trying with sudo..."
        sudo rm -rf certs
    fi
fi

# Create fresh certs directory
mkdir -p certs

# Copy the entire certificate store from EC2
echo "Copying /etc/ssl/certs/ to ./certs/"
cp -r /etc/ssl/certs/* certs/

# Also copy the certificate bundle if it exists
if [ -f /etc/ssl/certs/ca-certificates.crt ]; then
    echo "Copying ca-certificates.crt bundle"
    cp /etc/ssl/certs/ca-certificates.crt certs/
fi

# List what we copied
echo "Certificates copied:"
ls -la certs/ | head -10
echo "Total certificates: $(ls certs/ | wc -l)"

echo "Certificate copy complete. You can now build Docker containers." 