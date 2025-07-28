#!/bin/bash

# Script to fix RDS connection issues
set -e

echo "🔍 Diagnosing RDS connection issue..."

# Get EC2 instance metadata
EC2_INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
EC2_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
EC2_SECURITY_GROUP=$(curl -s http://169.254.169.254/latest/meta-data/security-groups | head -1)

echo "📋 EC2 Instance Info:"
echo "  Instance ID: $EC2_INSTANCE_ID"
echo "  Region: $EC2_REGION"
echo "  Security Group: $EC2_SECURITY_GROUP"

# Get RDS instance info
RDS_ENDPOINT="dhsite.cmfum4mqgoci.us-east-1.rds.amazonaws.com"
RDS_INSTANCE_ID="dhsite"

echo "📋 RDS Instance Info:"
echo "  Endpoint: $RDS_ENDPOINT"
echo "  Instance ID: $RDS_INSTANCE_ID"

# Get EC2 security group ID
echo "🔍 Getting EC2 security group ID..."
EC2_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*$EC2_SECURITY_GROUP*" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region $EC2_REGION)

echo "  EC2 Security Group ID: $EC2_SG_ID"

# Get RDS security group ID
echo "🔍 Getting RDS security group ID..."
RDS_SG_ID=$(aws rds describe-db-instances \
  --db-instance-identifier $RDS_INSTANCE_ID \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text \
  --region $EC2_REGION)

echo "  RDS Security Group ID: $RDS_SG_ID"

# Check if ingress rule exists
echo "🔍 Checking existing ingress rules..."
EXISTING_RULE=$(aws ec2 describe-security-groups \
  --group-ids $RDS_SG_ID \
  --query "SecurityGroups[0].IpPermissions[?FromPort==\`3306\` && contains(ReferencedGroupIds, \`$EC2_SG_ID\`)]" \
  --output text \
  --region $EC2_REGION)

if [ -z "$EXISTING_RULE" ]; then
    echo "❌ No ingress rule found for EC2 security group in RDS security group"
    echo "🔧 Adding ingress rule..."
    
    aws ec2 authorize-security-group-ingress \
      --group-id $RDS_SG_ID \
      --protocol tcp \
      --port 3306 \
      --source-group $EC2_SG_ID \
      --region $EC2_REGION
    
    echo "✅ Ingress rule added successfully"
else
    echo "✅ Ingress rule already exists"
fi

# Test the connection
echo "🧪 Testing database connection..."
if mysql -h $RDS_ENDPOINT -u admin -p -P 3306 dhsite -e "SELECT 1 as test;" 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection still failing"
    echo "💡 Additional troubleshooting steps:"
    echo "  1. Check if the 'admin' user exists in the database"
    echo "  2. Verify the password is correct"
    echo "  3. Check if the user has proper permissions"
    echo "  4. Verify the database name 'dhsite' exists"
fi

echo "🎉 RDS connection fix script completed!" 