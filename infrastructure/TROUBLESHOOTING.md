# Terraform Deployment Troubleshooting Guide

## Current Issues and Solutions

### Issue 1: CloudFront Account Verification Required

**Error Message:**

```
Error: creating CloudFront Distribution: operation error CloudFront: CreateDistributionWithTags,
https response error StatusCode: 403, RequestID: 4d54ff2a-128c-47f5-ad95-e7d53e19db6d,
AccessDenied: Your account must be verified before you can add new CloudFront resources.
```

**Solution:**

1. **Contact AWS Support** to verify your account for CloudFront usage
2. **Temporary Workaround**: CloudFront and Route53 modules have been commented out in `main.tf`
3. **After verification**: Uncomment the modules and redeploy

### Issue 2: IAM Permissions Insufficient

**Error Message:**

```
Error: creating IAM Role (dh-portfolio-ec2-role): operation error IAM: CreateRole,
https response error StatusCode: 403, RequestID: 05852157-064f-4729-90bc-952fbc1b7c4b,
api error AccessDenied: User: arn:aws:iam::722504363494:user/franiel is not authorized to perform: iam:CreateRole
```

**Solutions:**

#### Option A: Use the Setup Script (Recommended)

Run the PowerShell script to create IAM resources manually:

```powershell
.\scripts\setup-iam-permissions.ps1
```

#### Option B: Request Admin Permissions

Ask your AWS administrator to grant the following permissions to your user:

- `iam:CreateRole`
- `iam:CreateInstanceProfile`
- `iam:AddRoleToInstanceProfile`
- `iam:PutRolePolicy`

#### Option C: Use an Admin Account

Use an AWS account with administrative privileges to run the Terraform deployment.

## Current Deployment Status

### What's Working:

- ✅ VPC Configuration
- ✅ RDS Database
- ✅ EC2 Instances (with manual IAM setup)
- ✅ S3 Bucket
- ✅ Application Load Balancer

### What's Temporarily Disabled:

- ❌ CloudFront Distribution (requires account verification)
- ❌ Route53 DNS Configuration (depends on CloudFront)

## Next Steps

1. **Run the IAM setup script:**

   ```powershell
   .\scripts\setup-iam-permissions.ps1
   ```

2. **Deploy the current infrastructure:**

   ```bash
   cd infrastructure/terraform
   terraform plan
   terraform apply
   ```

3. **Contact AWS Support for CloudFront verification:**

   - Go to AWS Support Console
   - Create a case requesting CloudFront account verification
   - Include the error message from the deployment

4. **After CloudFront verification:**
   - Uncomment the CloudFront and Route53 modules in `main.tf`
   - Run `terraform plan` and `terraform apply` again

## Alternative Deployment Strategy

If you want to deploy without CloudFront initially:

1. The application will be accessible via the ALB domain name
2. You can add CloudFront later once your account is verified
3. This approach allows you to test the application while waiting for verification

## Monitoring and Debugging

### Check IAM Resources:

```bash
aws iam list-roles --query 'Roles[?contains(RoleName, `dh-portfolio`)]'
aws iam list-instance-profiles --query 'InstanceProfiles[?contains(InstanceProfileName, `dh-portfolio`)]'
```

### Check CloudFormation Stack (if using):

```bash
aws cloudformation describe-stacks --stack-name dh-portfolio
```

### View Terraform State:

```bash
terraform show
terraform state list
```

## Support

If you continue to experience issues:

1. Check the AWS CloudTrail logs for detailed error information
2. Verify your AWS credentials and permissions
3. Ensure you're in the correct AWS region (us-east-1)
4. Contact your AWS administrator for additional permissions if needed
