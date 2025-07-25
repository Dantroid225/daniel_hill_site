#!/bin/bash

# Script to find existing RDS databases in your AWS account

echo "🔍 Finding existing RDS databases..."
echo "=================================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# List all RDS instances
echo "📋 Available RDS databases:"
echo ""

aws rds describe-db-instances \
    --query 'DBInstances[*].[DBInstanceIdentifier,Engine,DBInstanceStatus,Endpoint.Address,Endpoint.Port]' \
    --output table

echo ""
echo "💡 To use an existing database:"
echo "1. Copy the DBInstanceIdentifier from the table above"
echo "2. Update terraform.tfvars with: existing_db_identifier = \"YOUR_DB_IDENTIFIER\""
echo ""
echo "🔧 To get more details about a specific database:"
echo "aws rds describe-db-instances --db-instance-identifier YOUR_DB_IDENTIFIER" 