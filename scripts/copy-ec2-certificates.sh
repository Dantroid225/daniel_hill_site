#!/bin/bash

# Script to copy certificates from EC2 instance to local certs directory
# This script will automatically detect and copy the appropriate certificate bundle

set -e  # Exit on any error

echo "=== EC2 Certificate Copy Script ==="
echo "Date: $(date)"
echo ""

# Create certs directory if it doesn't exist
CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

echo "Created/verified certs directory: $CERT_DIR"
echo ""

# Function to copy certificate with validation
copy_certificate() {
    local source="$1"
    local destination="$2"
    local description="$3"
    
    if [ -f "$source" ] && [ -r "$source" ]; then
        echo "Copying $description..."
        echo "  From: $source"
        echo "  To: $destination"
        
        # Copy the certificate
        cp "$source" "$destination"
        
        # Set proper permissions
        chmod 644 "$destination"
        
        # Validate the copied certificate
        if [ -f "$destination" ]; then
            local size=$(stat -c%s "$destination" 2>/dev/null || stat -f%z "$destination" 2>/dev/null)
            local cert_count=$(grep -c "BEGIN CERTIFICATE" "$destination" 2>/dev/null || echo "0")
            
            echo "  ✓ Successfully copied"
            echo "  Size: ${size} bytes"
            echo "  Certificates: $cert_count"
            echo ""
            return 0
        else
            echo "  ✗ Failed to copy certificate"
            echo ""
            return 1
        fi
    else
        echo "  ✗ Source certificate not found or not readable: $source"
        echo ""
        return 1
    fi
}

# Try to copy certificates in order of preference
CERT_COPIED=false

# Try Ubuntu/Debian certificate bundle first
if copy_certificate "/etc/ssl/certs/ca-certificates.crt" "$CERT_DIR/ca-certificates.crt" "Ubuntu/Debian CA Certificates Bundle"; then
    CERT_COPIED=true
    echo "✓ Successfully copied Ubuntu/Debian certificate bundle"
    echo ""

# Try Amazon Linux/RHEL certificate bundle
elif copy_certificate "/etc/pki/tls/certs/ca-bundle.crt" "$CERT_DIR/ca-certificates.crt" "Amazon Linux/RHEL CA Bundle"; then
    CERT_COPIED=true
    echo "✓ Successfully copied Amazon Linux/RHEL certificate bundle"
    echo ""

# Try alternative locations
elif copy_certificate "/etc/ssl/certs/ca-bundle.crt" "$CERT_DIR/ca-certificates.crt" "Alternative CA Bundle"; then
    CERT_COPIED=true
    echo "✓ Successfully copied alternative certificate bundle"
    echo ""

elif copy_certificate "/etc/pki/tls/certs/ca-bundle.trust.crt" "$CERT_DIR/ca-certificates.crt" "Trusted CA Bundle"; then
    CERT_COPIED=true
    echo "✓ Successfully copied trusted certificate bundle"
    echo ""

elif copy_certificate "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem" "$CERT_DIR/ca-certificates.crt" "CA Trust Extracted PEM"; then
    CERT_COPIED=true
    echo "✓ Successfully copied CA trust extracted PEM"
    echo ""

else
    echo "✗ No suitable certificate bundle found on the system"
    echo ""
    echo "Available certificate files:"
    
    # List available certificate files
    for cert_path in "/etc/ssl/certs/ca-certificates.crt" "/etc/pki/tls/certs/ca-bundle.crt" "/etc/ssl/certs/ca-bundle.crt" "/etc/pki/tls/certs/ca-bundle.trust.crt" "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem"; do
        if [ -f "$cert_path" ]; then
            echo "  - $cert_path ($(stat -c%s "$cert_path" 2>/dev/null || stat -f%z "$cert_path" 2>/dev/null) bytes)"
        fi
    done
    
    echo ""
    echo "Please manually copy one of the available certificate files to $CERT_DIR/ca-certificates.crt"
    exit 1
fi

# Verify the copied certificate
echo "=== Verifying Copied Certificate ==="
if [ -f "$CERT_DIR/ca-certificates.crt" ]; then
    echo "Certificate file: $CERT_DIR/ca-certificates.crt"
    echo "File size: $(stat -c%s "$CERT_DIR/ca-certificates.crt" 2>/dev/null || stat -f%z "$CERT_DIR/ca-certificates.crt" 2>/dev/null) bytes"
    echo "Permissions: $(ls -la "$CERT_DIR/ca-certificates.crt")"
    
    # Count certificates in the bundle
    local cert_count=$(grep -c "BEGIN CERTIFICATE" "$CERT_DIR/ca-certificates.crt" 2>/dev/null || echo "0")
    echo "Number of certificates: $cert_count"
    
    # Show first few lines to verify it's a valid certificate
    echo "First few lines:"
    head -5 "$CERT_DIR/ca-certificates.crt" | sed 's/^/  /'
    echo ""
    
    echo "✓ Certificate copy and verification complete!"
    echo ""
    echo "The certificate is now ready to be used by your Docker container."
    echo "Your docker-compose.yml is already configured to mount this certificate."
    echo ""
    echo "To use this certificate:"
    echo "1. The certificate is mounted at: /etc/ssl/certs/ca-certificates.crt in the container"
    echo "2. Environment variable DB_SSL_CA is set to: /etc/ssl/certs/ca-certificates.crt"
    echo "3. Environment variable DB_SSL_MODE is set to: VERIFY_CA"
    echo ""
    echo "Next steps:"
    echo "1. Update your database.js to enable SSL with the certificate"
    echo "2. Rebuild and restart your Docker containers"
    echo "3. Test the database connection"
    
else
    echo "✗ Certificate verification failed - file not found"
    exit 1
fi 