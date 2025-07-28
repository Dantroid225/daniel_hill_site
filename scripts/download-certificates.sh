#!/bin/bash

# Script to download RDS CA certificate for Docker deployment
# Run this on the EC2 instance before running docker-compose

set -e

echo "Setting up SSL certificates for Docker deployment..."

# Create certs directory if it doesn't exist
mkdir -p certs

# Download AWS RDS CA certificate
echo "Downloading AWS RDS CA certificate..."
curl -o certs/ca-certificates.crt https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

if [ $? -eq 0 ]; then
    echo "Successfully downloaded RDS CA certificate to certs/ca-certificates.crt"
    ls -la certs/ca-certificates.crt
    echo "Certificate setup complete. You can now run docker-compose up"
else
    echo "Failed to download RDS CA certificate"
    exit 1
fi 