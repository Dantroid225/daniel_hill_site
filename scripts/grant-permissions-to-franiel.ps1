# PowerShell script to grant necessary permissions to the franiel user
# This script creates and attaches an IAM policy to the franiel user

$ErrorActionPreference = "Continue"

$POLICY_NAME = "dh-portfolio-terraform-permissions"
$USER_NAME = "franiel"

Write-Host "Granting permissions to user: $USER_NAME" -ForegroundColor Green

# Check if the policy already exists
Write-Host "Checking if policy already exists..." -ForegroundColor Yellow
try {
    $existingPolicy = aws iam get-policy --policy-arn "arn:aws:iam::722504363494:policy/$POLICY_NAME" 2>$null
    if ($existingPolicy) {
        Write-Host "Policy already exists. Updating..." -ForegroundColor Yellow
        $policyVersion = aws iam create-policy-version --policy-arn "arn:aws:iam::722504363494:policy/$POLICY_NAME" --policy-document file://scripts/iam-policy-for-franiel.json --set-as-default
        Write-Host "Policy updated successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "Policy does not exist. Creating new policy..." -ForegroundColor Yellow
    
    # Create the policy
    try {
        aws iam create-policy --policy-name $POLICY_NAME --policy-document file://scripts/iam-policy-for-franiel.json --description "Permissions for Terraform deployment of dh-portfolio"
        Write-Host "Policy created successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create policy: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Attach the policy to the user
Write-Host "Attaching policy to user: $USER_NAME" -ForegroundColor Yellow
try {
    aws iam attach-user-policy --user-name $USER_NAME --policy-arn "arn:aws:iam::722504363494:policy/$POLICY_NAME"
    Write-Host "Policy attached successfully to user: $USER_NAME" -ForegroundColor Green
} catch {
    Write-Host "Failed to attach policy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to run this script with an account that has IAM permissions" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Permissions granted successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Contact AWS Support to verify your account for CloudFront" -ForegroundColor White
Write-Host "2. Run: terraform plan" -ForegroundColor White
Write-Host "3. Run: terraform apply" -ForegroundColor White
Write-Host ""
Write-Host "Note: You may need to wait a few minutes for the permissions to propagate" -ForegroundColor Yellow 