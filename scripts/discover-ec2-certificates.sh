#!/bin/bash

# Script to discover and identify certificate locations on EC2 instance
# This script will help identify which certificate files are available and working

echo "=== EC2 Certificate Discovery Script ==="
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo ""

# Function to check if a file exists and is readable
check_cert_file() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ] && [ -r "$file_path" ]; then
        local size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null)
        local cert_count=$(grep -c "BEGIN CERTIFICATE" "$file_path" 2>/dev/null || echo "0")
        echo "✓ $description"
        echo "  Path: $file_path"
        echo "  Size: ${size} bytes"
        echo "  Certificates: $cert_count"
        echo ""
        return 0
    else
        echo "✗ $description - Not found or not readable"
        echo ""
        return 1
    fi
}

# Function to test RDS connection with a specific certificate
test_rds_connection() {
    local cert_file="$1"
    local description="$2"
    
    if [ -f "$cert_file" ]; then
        echo "Testing RDS connection with $description..."
        
        # Try to connect to RDS using the certificate
        # Note: Replace with your actual RDS endpoint
        local rds_endpoint="${DB_HOST:-localhost}"
        local rds_port="${DB_PORT:-3306}"
        
        # Test SSL connection
        timeout 10 openssl s_client -connect "$rds_endpoint:$rds_port" \
            -starttls mysql \
            -CAfile "$cert_file" \
            -verify_return_error \
            -servername "$rds_endpoint" 2>&1 | grep -E "(verify return|depth|subject|issuer)" | head -5
        
        if [ $? -eq 0 ]; then
            echo "✓ SSL connection test successful with $description"
        else
            echo "✗ SSL connection test failed with $description"
        fi
        echo ""
    fi
}

echo "=== Checking Common Certificate Locations ==="

# Check Ubuntu/Debian certificate locations
check_cert_file "/etc/ssl/certs/ca-certificates.crt" "Ubuntu/Debian CA Certificates Bundle"
check_cert_file "/etc/ssl/certs/ca-bundle.crt" "Alternative CA Bundle"
check_cert_file "/usr/share/ca-certificates/ca-certificates.crt" "System CA Certificates"

# Check Amazon Linux/RHEL/CentOS certificate locations
check_cert_file "/etc/pki/tls/certs/ca-bundle.crt" "Amazon Linux/RHEL CA Bundle"
check_cert_file "/etc/pki/tls/certs/ca-bundle.trust.crt" "Amazon Linux/RHEL Trust Bundle"
check_cert_file "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem" "CA Trust Extracted PEM"

# Check individual certificate directories
echo "=== Checking Certificate Directories ==="

for cert_dir in "/etc/ssl/certs" "/etc/pki/tls/certs" "/etc/pki/ca-trust/extracted/pem"; do
    if [ -d "$cert_dir" ]; then
        echo "Directory: $cert_dir"
        echo "Files: $(ls -1 "$cert_dir" | wc -l | tr -d ' ')"
        echo "Sample files:"
        ls -1 "$cert_dir" | head -5 | sed 's/^/  /'
        echo ""
    fi
done

# Check for AWS RDS specific certificates
echo "=== Checking for AWS RDS Certificates ==="
check_cert_file "/etc/ssl/certs/rds-ca-2019-root.pem" "AWS RDS CA 2019 Root"
check_cert_file "/etc/ssl/certs/rds-ca-2015-root.pem" "AWS RDS CA 2015 Root"
check_cert_file "/etc/ssl/certs/global-bundle.pem" "AWS RDS Global Bundle"

# Check if MySQL client can connect
echo "=== Testing MySQL Connection ==="
if command -v mysql &> /dev/null; then
    echo "MySQL client found"
    
    # Test connection without SSL first
    echo "Testing connection without SSL..."
    timeout 10 mysql -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" \
        -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
        -e "SELECT 1 as test;" 2>&1 | head -3
    
    # Test connection with SSL
    echo "Testing connection with SSL..."
    timeout 10 mysql -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" \
        -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
        --ssl-ca=/etc/ssl/certs/ca-certificates.crt \
        --ssl-mode=VERIFY_CA \
        -e "SELECT 1 as test;" 2>&1 | head -3
else
    echo "MySQL client not found"
fi

echo ""
echo "=== Certificate Discovery Complete ==="
echo "Recommended certificate file to copy:"
echo "  Primary: /etc/ssl/certs/ca-certificates.crt (Ubuntu/Debian)"
echo "  Alternative: /etc/pki/tls/certs/ca-bundle.crt (Amazon Linux/RHEL)"
echo ""
echo "To copy the recommended certificate:"
echo "  cp /etc/ssl/certs/ca-certificates.crt ./certs/"
echo "  OR"
echo "  cp /etc/pki/tls/certs/ca-bundle.crt ./certs/ca-certificates.crt" 