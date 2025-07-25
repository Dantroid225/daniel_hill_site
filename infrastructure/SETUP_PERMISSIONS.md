# Setting Up IAM Permissions for User 'franiel'

## Overview

The user `franiel` needs specific IAM permissions to deploy the Terraform infrastructure. This document provides step-by-step instructions to grant the necessary permissions.

## Option 1: Automated Setup (Recommended)

Run the PowerShell script to automatically create and attach the required policy:

```powershell
.\scripts\grant-permissions-to-franiel.ps1
```

## Option 2: Manual Setup via AWS Console

If you prefer to set up permissions manually through the AWS Console:

### Step 1: Create the IAM Policy

1. Go to the AWS IAM Console: https://console.aws.amazon.com/iam/
2. Navigate to "Policies" in the left sidebar
3. Click "Create policy"
4. Choose the "JSON" tab
5. Copy and paste the contents of `scripts/iam-policy-for-franiel.json`
6. Click "Next: Tags" (optional)
7. Click "Next: Review"
8. Name the policy: `dh-portfolio-terraform-permissions`
9. Add description: "Permissions for Terraform deployment of dh-portfolio"
10. Click "Create policy"

### Step 2: Attach Policy to User

1. In the IAM Console, navigate to "Users" in the left sidebar
2. Find and click on the user `franiel`
3. Click the "Add permissions" button
4. Choose "Attach existing policies directly"
5. Search for and select the policy `dh-portfolio-terraform-permissions`
6. Click "Next: Review"
7. Click "Add permissions"

## Option 3: Using AWS CLI

If you have an account with IAM permissions, you can use the AWS CLI:

```bash
# Create the policy
aws iam create-policy \
  --policy-name dh-portfolio-terraform-permissions \
  --policy-document file://scripts/iam-policy-for-franiel.json \
  --description "Permissions for Terraform deployment of dh-portfolio"

# Attach the policy to the user
aws iam attach-user-policy \
  --user-name franiel \
  --policy-arn arn:aws:iam::722504363494:policy/dh-portfolio-terraform-permissions
```

## Required Permissions Summary

The policy grants the following permissions:

### IAM Permissions

- Create, delete, and manage IAM roles
- Create, delete, and manage IAM instance profiles
- Attach/detach policies to roles
- Pass roles to services

### AWS Service Permissions

- **EC2**: Full access for creating instances, security groups, load balancers
- **RDS**: Full access for database management
- **S3**: Full access for bucket management
- **CloudFront**: Full access for CDN configuration
- **Route53**: Full access for DNS management
- **Elastic Load Balancing**: Full access for ALB/NLB management
- **Auto Scaling**: Full access for scaling groups
- **ECR**: Full access for container registry
- **CloudWatch**: Full access for monitoring
- **ACM**: Full access for SSL certificates
- **Lambda**: Full access for serverless functions
- **API Gateway**: Full access for API management
- **Secrets Manager**: Full access for secret management
- **SSM**: Full access for systems manager
- **KMS**: Full access for key management

## Verification

After granting permissions, verify they are working:

```bash
# Test IAM role creation
aws iam create-role --role-name test-role --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

# Clean up test role
aws iam delete-role --role-name test-role
```

## Troubleshooting

### Permission Denied Errors

If you still get permission errors after setting up the policy:

1. **Wait for propagation**: IAM changes can take up to 5 minutes to propagate
2. **Check policy attachment**: Verify the policy is attached to the user
3. **Check policy content**: Ensure the policy JSON is valid
4. **Check account ID**: Verify the account ID in the policy matches your AWS account

### Common Issues

- **Account ID mismatch**: Update the account ID in the policy JSON if different
- **Policy name conflicts**: Use a different policy name if it already exists
- **User doesn't exist**: Ensure the user `franiel` exists in your AWS account

## Security Notes

- The policy grants broad permissions for Terraform deployment
- Consider restricting permissions further for production environments
- Regularly review and audit the permissions
- Use least privilege principle where possible

## Next Steps

After setting up permissions:

1. Contact AWS Support to verify your account for CloudFront
2. Run `terraform plan` to verify the configuration
3. Run `terraform apply` to deploy the infrastructure
