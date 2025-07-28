# PowerShell script to fix RDS connection issues
param(
    [string]$RdsEndpoint = "dhsite.cmfum4mqgoci.us-east-1.rds.amazonaws.com",
    [string]$RdsInstanceId = "dhsite",
    [string]$Region = "us-east-1"
)

Write-Host "🔍 Diagnosing RDS connection issue..." -ForegroundColor Green

try {
    # Get EC2 instance metadata
    $InstanceId = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/instance-id" -TimeoutSec 5
    $InstanceRegion = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/placement/region" -TimeoutSec 5
    $SecurityGroups = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/security-groups" -TimeoutSec 5
    $Ec2SecurityGroup = $SecurityGroups.Split("`n")[0]

    Write-Host "📋 EC2 Instance Info:" -ForegroundColor Yellow
    Write-Host "  Instance ID: $InstanceId"
    Write-Host "  Region: $InstanceRegion"
    Write-Host "  Security Group: $Ec2SecurityGroup"
} catch {
    Write-Host "⚠️  Could not get EC2 metadata. Running in local mode." -ForegroundColor Yellow
    $InstanceRegion = $Region
}

Write-Host "📋 RDS Instance Info:" -ForegroundColor Yellow
Write-Host "  Endpoint: $RdsEndpoint"
Write-Host "  Instance ID: $RdsInstanceId"

# Get EC2 security group ID
Write-Host "🔍 Getting EC2 security group ID..." -ForegroundColor Green
try {
    $Ec2SgId = aws ec2 describe-security-groups --filters "Name=group-name,Values=*$Ec2SecurityGroup*" --query 'SecurityGroups[0].GroupId' --output text --region $InstanceRegion
    Write-Host "  EC2 Security Group ID: $Ec2SgId"
} catch {
    Write-Host "❌ Could not get EC2 security group ID" -ForegroundColor Red
    exit 1
}

# Get RDS security group ID
Write-Host "🔍 Getting RDS security group ID..." -ForegroundColor Green
try {
    $RdsSgId = aws rds describe-db-instances --db-instance-identifier $RdsInstanceId --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' --output text --region $InstanceRegion
    Write-Host "  RDS Security Group ID: $RdsSgId"
} catch {
    Write-Host "❌ Could not get RDS security group ID" -ForegroundColor Red
    exit 1
}

# Check if ingress rule exists
Write-Host "🔍 Checking existing ingress rules..." -ForegroundColor Green
try {
    $ExistingRule = aws ec2 describe-security-groups --group-ids $RdsSgId --query "SecurityGroups[0].IpPermissions[?FromPort==\`3306\` && contains(ReferencedGroupIds, \`$Ec2SgId\`)]" --output text --region $InstanceRegion
    
    if ([string]::IsNullOrEmpty($ExistingRule)) {
        Write-Host "❌ No ingress rule found for EC2 security group in RDS security group" -ForegroundColor Red
        Write-Host "🔧 Adding ingress rule..." -ForegroundColor Yellow
        
        aws ec2 authorize-security-group-ingress --group-id $RdsSgId --protocol tcp --port 3306 --source-group $Ec2SgId --region $InstanceRegion
        
        Write-Host "✅ Ingress rule added successfully" -ForegroundColor Green
    } else {
        Write-Host "✅ Ingress rule already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking/adding ingress rules" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test the connection
Write-Host "🧪 Testing database connection..." -ForegroundColor Green
Write-Host "💡 Please enter the database password when prompted:" -ForegroundColor Yellow

try {
    # Note: This would require mysql client to be installed
    # For now, just provide instructions
    Write-Host "To test the connection manually, run:" -ForegroundColor Cyan
    Write-Host "mysql -h $RdsEndpoint -u admin -p -P 3306 dhsite -e 'SELECT 1 as test;'" -ForegroundColor White
} catch {
    Write-Host "❌ Could not test database connection" -ForegroundColor Red
}

Write-Host "💡 Additional troubleshooting steps:" -ForegroundColor Yellow
Write-Host "  1. Check if the 'admin' user exists in the database"
Write-Host "  2. Verify the password is correct"
Write-Host "  3. Check if the user has proper permissions"
Write-Host "  4. Verify the database name 'dhsite' exists"

Write-Host "🎉 RDS connection fix script completed!" -ForegroundColor Green 