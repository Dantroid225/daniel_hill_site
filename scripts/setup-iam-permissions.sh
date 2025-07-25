#!/bin/bash

# Script to set up IAM permissions for Terraform deployment
# This script creates the necessary IAM role and policies manually

set -e

PROJECT_NAME="dh-portfolio"
REGION="us-east-1"

echo "Setting up IAM permissions for $PROJECT_NAME..."

# Create IAM role for EC2
echo "Creating IAM role: ${PROJECT_NAME}-ec2-role"
aws iam create-role \
  --role-name "${PROJECT_NAME}-ec2-role" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        }
      }
    ]
  }' || echo "Role already exists or permission denied"

# Create IAM instance profile
echo "Creating IAM instance profile: ${PROJECT_NAME}-ec2-profile"
aws iam create-instance-profile \
  --instance-profile-name "${PROJECT_NAME}-ec2-profile" || echo "Instance profile already exists or permission denied"

# Attach role to instance profile
echo "Attaching role to instance profile..."
aws iam add-role-to-instance-profile \
  --instance-profile-name "${PROJECT_NAME}-ec2-profile" \
  --role-name "${PROJECT_NAME}-ec2-role" || echo "Role already attached or permission denied"

# Create IAM policy for EC2
echo "Creating IAM policy: ${PROJECT_NAME}-ec2-policy"
aws iam put-role-policy \
  --role-name "${PROJECT_NAME}-ec2-role" \
  --policy-name "${PROJECT_NAME}-ec2-policy" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        "Resource": "*"
      }
    ]
  }' || echo "Policy already exists or permission denied"

echo "IAM setup complete!"
echo ""
echo "Next steps:"
echo "1. Contact AWS Support to verify your account for CloudFront"
echo "2. Run: terraform plan"
echo "3. Run: terraform apply"
echo ""
echo "Note: If you still get permission errors, you may need to:"
echo "- Ask your AWS administrator to grant you IAM permissions"
echo "- Or run this script with an account that has IAM permissions" 