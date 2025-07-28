#!/bin/bash

# Script to fix RDS connection issues on EC2
# This script helps troubleshoot and fix database connection problems

set -e

echo "🔍 Checking RDS connection issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if we're on EC2
if [ -f /sys/hypervisor/uuid ] && [ "$(head -c 3 /sys/hypervisor/uuid)" = "ec2" ]; then
    print_status "Running on EC2 instance"
else
    print_warning "This script is designed to run on EC2. Some checks may not work locally."
fi

echo ""
echo "📋 Step 1: Get current EC2 instance information"
echo "================================================"

# Get EC2 instance ID
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
print_status "EC2 Instance ID: $INSTANCE_ID"

# Get EC2 security group
EC2_SG=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text)
print_status "EC2 Security Group: $EC2_SG"

# Get VPC ID
VPC_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].VpcId' --output text)
print_status "VPC ID: $VPC_ID"

echo ""
echo "📋 Step 2: Get RDS database information"
echo "======================================="

# Get RDS instance details
RDS_IDENTIFIER="dhsite"
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier $RDS_IDENTIFIER --query 'DBInstances[0].Endpoint.Address' --output text 2>/dev/null || echo "dhwebsite.cmfum4mqgoci.us-east-1.rds.amazonaws.com")
print_status "RDS Endpoint: $RDS_ENDPOINT"

# Get RDS security group
RDS_SG=$(aws rds describe-db-instances --db-instance-identifier $RDS_IDENTIFIER --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' --output text 2>/dev/null || echo "Unknown")
print_status "RDS Security Group: $RDS_SG"

echo ""
echo "📋 Step 3: Check security group rules"
echo "====================================="

# Check EC2 security group egress rules
echo "EC2 Security Group Egress Rules:"
aws ec2 describe-security-groups --group-ids $EC2_SG --query 'SecurityGroups[0].IpPermissionsEgress' --output table

echo ""
echo "RDS Security Group Ingress Rules:"
aws ec2 describe-security-groups --group-ids $RDS_SG --query 'SecurityGroups[0].IpPermissions' --output table

echo ""
echo "📋 Step 4: Test database connectivity"
echo "====================================="

# Test if we can reach the database port
if command -v telnet &> /dev/null; then
    echo "Testing connection to $RDS_ENDPOINT:3306..."
    timeout 5 telnet $RDS_ENDPOINT 3306 && print_status "Port 3306 is reachable" || print_error "Cannot reach port 3306"
else
    print_warning "telnet not available, skipping port test"
fi

echo ""
echo "📋 Step 5: Manual fix commands"
echo "=============================="

echo "If the RDS security group doesn't allow traffic from EC2, run these commands:"
echo ""
echo "# Add EC2 security group to RDS security group ingress rules"
echo "aws ec2 authorize-security-group-ingress \\"
echo "  --group-id $RDS_SG \\"
echo "  --protocol tcp \\"
echo "  --port 3306 \\"
echo "  --source-group $EC2_SG"
echo ""
echo "# Verify the rule was added"
echo "aws ec2 describe-security-groups --group-ids $RDS_SG --query 'SecurityGroups[0].IpPermissions' --output table"
echo ""

echo "📋 Step 6: Environment variables check"
echo "====================================="

# Check if .env file exists and has database configuration
if [ -f "/opt/dh-portfolio/daniel_hill_site/backend/.env" ]; then
    print_status ".env file found"
    echo "Database configuration in .env:"
    grep -E "DB_HOST|DB_USER|DB_PASSWORD|DB_NAME|DB_PORT" /opt/dh-portfolio/daniel_hill_site/backend/.env || print_warning "No database configuration found in .env"
else
    print_error ".env file not found at /opt/dh-portfolio/daniel_hill_site/backend/.env"
fi

echo ""
echo "📋 Step 7: Application logs check"
echo "================================="

if [ -f "/opt/dh-portfolio/docker-compose.yml" ]; then
    print_status "Docker Compose found"
    echo "Recent application logs:"
    cd /opt/dh-portfolio && docker-compose logs --tail=20 backend 2>/dev/null || print_warning "Could not retrieve logs"
else
    print_warning "Docker Compose not found at /opt/dh-portfolio/docker-compose.yml"
fi

echo ""
print_status "Script completed. Check the output above for issues and apply the suggested fixes." 