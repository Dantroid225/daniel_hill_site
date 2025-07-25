# PowerShell script to set up IAM permissions using AWS CLI
# This script creates the necessary IAM role and policies manually

$ErrorActionPreference = "Continue"

$PROJECT_NAME = "dh-portfolio"
$REGION = "us-east-1"

Write-Host "Setting up IAM permissions for $PROJECT_NAME using AWS CLI..." -ForegroundColor Green

# Create IAM role for EC2
Write-Host "Creating IAM role: ${PROJECT_NAME}-ec2-role" -ForegroundColor Yellow
try {
    $assumeRolePolicy = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = @{
                    Service = "ec2.amazonaws.com"
                }
            }
        )
    } | ConvertTo-Json -Depth 10

    aws iam create-role --role-name "${PROJECT_NAME}-ec2-role" --assume-role-policy-document $assumeRolePolicy
    Write-Host "IAM role created successfully" -ForegroundColor Green
} catch {
    Write-Host "Role already exists or permission denied: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Create IAM instance profile
Write-Host "Creating IAM instance profile: ${PROJECT_NAME}-ec2-profile" -ForegroundColor Yellow
try {
    aws iam create-instance-profile --instance-profile-name "${PROJECT_NAME}-ec2-profile"
    Write-Host "Instance profile created successfully" -ForegroundColor Green
} catch {
    Write-Host "Instance profile already exists or permission denied: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Attach role to instance profile
Write-Host "Attaching role to instance profile..." -ForegroundColor Yellow
try {
    aws iam add-role-to-instance-profile --instance-profile-name "${PROJECT_NAME}-ec2-profile" --role-name "${PROJECT_NAME}-ec2-role"
    Write-Host "Role attached successfully" -ForegroundColor Green
} catch {
    Write-Host "Role already attached or permission denied: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Create IAM policy for EC2
Write-Host "Creating IAM policy: ${PROJECT_NAME}-ec2-policy" -ForegroundColor Yellow
try {
    $policyDocument = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Effect = "Allow"
                Action = @(
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage"
                )
                Resource = "*"
            }
        )
    } | ConvertTo-Json -Depth 10

    aws iam put-role-policy --role-name "${PROJECT_NAME}-ec2-role" --policy-name "${PROJECT_NAME}-ec2-policy" --policy-document $policyDocument
    Write-Host "IAM policy created successfully" -ForegroundColor Green
} catch {
    Write-Host "Policy already exists or permission denied: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "IAM setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Contact AWS Support to verify your account for CloudFront" -ForegroundColor White
Write-Host "2. Run: terraform plan" -ForegroundColor White
Write-Host "3. Run: terraform apply" -ForegroundColor White
Write-Host ""
Write-Host "Note: If you still get permission errors, you may need to:" -ForegroundColor Yellow
Write-Host "- Ask your AWS administrator to grant you IAM permissions" -ForegroundColor White
Write-Host "- Or run this script with an account that has IAM permissions" -ForegroundColor White 