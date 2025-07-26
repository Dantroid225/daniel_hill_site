#!/bin/bash

# Script to fix EC2 IAM role permissions for RDS diagnostics
# This script adds the missing permissions to the EC2 role

set -e

echo "🔧 Fixing EC2 IAM role permissions..."

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

# Get EC2 instance ID
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
print_status "EC2 Instance ID: $INSTANCE_ID"

# Get the role name from the instance profile
ROLE_NAME=$(aws sts get-caller-identity --query 'Arn' --output text | cut -d'/' -f2)
print_status "Current Role: $ROLE_NAME"

echo ""
echo "📋 Step 1: Create policy document for missing permissions"
echo "=========================================================="

# Create a policy document for the missing permissions
cat > /tmp/ec2-diagnostics-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:DescribeSecurityGroups",
                "rds:DescribeDBInstances",
                "rds:DescribeDBClusters"
            ],
            "Resource": "*"
        }
    ]
}
EOF

print_status "Policy document created"

echo ""
echo "📋 Step 2: Attach policy to EC2 role"
echo "===================================="

# Attach the policy to the EC2 role
POLICY_NAME="EC2DiagnosticsPolicy"

# Check if policy already exists
if aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query 'Account' --output text):policy/$POLICY_NAME" 2>/dev/null; then
    print_warning "Policy $POLICY_NAME already exists"
else
    # Create the policy
    aws iam create-policy \
        --policy-name $POLICY_NAME \
        --policy-document file:///tmp/ec2-diagnostics-policy.json \
        --description "Policy for EC2 instance diagnostics"
    print_status "Policy $POLICY_NAME created"
fi

# Attach policy to role
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query 'Account' --output text):policy/$POLICY_NAME"

print_status "Policy attached to role $ROLE_NAME"

echo ""
echo "📋 Step 3: Wait for permissions to propagate"
echo "============================================"

print_warning "Waiting 10 seconds for permissions to propagate..."
sleep 10

echo ""
echo "📋 Step 4: Test the permissions"
echo "==============================="

# Test if we can now describe instances
if aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null; then
    print_status "✅ EC2 DescribeInstances permission working"
else
    print_error "❌ EC2 DescribeInstances permission still not working"
    print_warning "You may need to wait a few more minutes for permissions to propagate"
fi

# Test if we can describe RDS instances
if aws rds describe-db-instances --query 'DBInstances[0].DBInstanceIdentifier' --output text 2>/dev/null; then
    print_status "✅ RDS DescribeDBInstances permission working"
else
    print_error "❌ RDS DescribeDBInstances permission not working"
fi

echo ""
echo "📋 Step 5: Clean up temporary files"
echo "==================================="

rm -f /tmp/ec2-diagnostics-policy.json
print_status "Temporary files cleaned up"

echo ""
print_status "Permission fix completed!"
echo ""
echo "Now you can run the RDS diagnostic script:"
echo "  ./scripts/fix-rds-connection.sh" 