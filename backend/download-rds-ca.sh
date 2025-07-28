#!/bin/bash

# Download AWS RDS CA certificate
echo "Downloading AWS RDS CA certificate..."
curl -o rds-ca-2019-root.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

if [ $? -eq 0 ]; then
    echo "Successfully downloaded RDS CA certificate"
    ls -la rds-ca-2019-root.pem
else
    echo "Failed to download RDS CA certificate"
    exit 1
fi 