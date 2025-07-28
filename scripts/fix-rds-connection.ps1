# PowerShell script to fix RDS connection issues on EC2
# This script helps troubleshoot and fix database connection problems

Write-Host "🔍 Checking RDS connection issues..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
    Write-Status "AWS CLI is installed"
} catch {
    Write-Error "AWS CLI is not installed. Please install it first."
    exit 1
}

Write-Host ""
Write-Host "📋 Step 1: Get current EC2 instance information" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Get EC2 instance ID
try {
    $InstanceId = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/instance-id" -TimeoutSec 5
    Write-Status "EC2 Instance ID: $InstanceId"
} catch {
    Write-Warning "Could not get EC2 instance ID. This script is designed to run on EC2."
    $InstanceId = "unknown"
}

# Get EC2 security group
try {
    $EC2SG = aws ec2 describe-instances --instance-ids $InstanceId --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text 2>$null
    Write-Status "EC2 Security Group: $EC2SG"
} catch {
    Write-Warning "Could not get EC2 security group"
    $EC2SG = "unknown"
}

# Get VPC ID
try {
    $VPCId = aws ec2 describe-instances --instance-ids $InstanceId --query 'Reservations[0].Instances[0].VpcId' --output text 2>$null
    Write-Status "VPC ID: $VPCId"
} catch {
    Write-Warning "Could not get VPC ID"
    $VPCId = "unknown"
}

Write-Host ""
Write-Host "📋 Step 2: Get RDS database information" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Get RDS instance details
$RDSIdentifier = "dhsite"
try {
    $RDSEndpoint = aws rds describe-db-instances --db-instance-identifier $RDSIdentifier --query 'DBInstances[0].Endpoint.Address' --output text 2>$null
    if (-not $RDSEndpoint) {
        $RDSEndpoint = "dhsite.cmfum4mqgoci.us-east-1.rds.amazonaws.com"
    }
    Write-Status "RDS Endpoint: $RDSEndpoint"
} catch {
    Write-Warning "Could not get RDS endpoint, using default"
    $RDSEndpoint = "dhsite.cmfum4mqgoci.us-east-1.rds.amazonaws.com"
}

# Get RDS security group
try {
    $RDSSG = aws rds describe-db-instances --db-instance-identifier $RDSIdentifier --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' --output text 2>$null
    Write-Status "RDS Security Group: $RDSSG"
} catch {
    Write-Warning "Could not get RDS security group"
    $RDSSG = "unknown"
}

Write-Host ""
Write-Host "📋 Step 3: Check security group rules" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check EC2 security group egress rules
Write-Host "EC2 Security Group Egress Rules:" -ForegroundColor Yellow
try {
    aws ec2 describe-security-groups --group-ids $EC2SG --query 'SecurityGroups[0].IpPermissionsEgress' --output table
} catch {
    Write-Warning "Could not retrieve EC2 security group rules"
}

Write-Host ""
Write-Host "RDS Security Group Ingress Rules:" -ForegroundColor Yellow
try {
    aws ec2 describe-security-groups --group-ids $RDSSG --query 'SecurityGroups[0].IpPermissions' --output table
} catch {
    Write-Warning "Could not retrieve RDS security group rules"
}

Write-Host ""
Write-Host "📋 Step 4: Test database connectivity" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test if we can reach the database port
Write-Host "Testing connection to $RDSEndpoint`:3306..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ConnectAsync($RDSEndpoint, 3306).Wait(5000) | Out-Null
    if ($tcpClient.Connected) {
        Write-Status "Port 3306 is reachable"
        $tcpClient.Close()
    } else {
        Write-Error "Cannot reach port 3306"
    }
} catch {
    Write-Error "Cannot reach port 3306: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "📋 Step 5: Manual fix commands" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

Write-Host "If the RDS security group doesn't allow traffic from EC2, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Add EC2 security group to RDS security group ingress rules" -ForegroundColor Gray
Write-Host "aws ec2 authorize-security-group-ingress \`" -ForegroundColor Gray
Write-Host "  --group-id $RDSSG \`" -ForegroundColor Gray
Write-Host "  --protocol tcp \`" -ForegroundColor Gray
Write-Host "  --port 3306 \`" -ForegroundColor Gray
Write-Host "  --source-group $EC2SG" -ForegroundColor Gray
Write-Host ""
Write-Host "# Verify the rule was added" -ForegroundColor Gray
Write-Host "aws ec2 describe-security-groups --group-ids $RDSSG --query 'SecurityGroups[0].IpPermissions' --output table" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Step 6: Environment variables check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if .env file exists and has database configuration
$EnvPath = "/opt/dh-portfolio/daniel_hill_site/backend/.env"
if (Test-Path $EnvPath) {
    Write-Status ".env file found"
    Write-Host "Database configuration in .env:" -ForegroundColor Yellow
    try {
        Get-Content $EnvPath | Select-String -Pattern "DB_HOST|DB_USER|DB_PASSWORD|DB_NAME|DB_PORT"
    } catch {
        Write-Warning "Could not read .env file"
    }
} else {
    Write-Error ".env file not found at $EnvPath"
}

Write-Host ""
Write-Host "📋 Step 7: Application logs check" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$DockerComposePath = "/opt/dh-portfolio/docker-compose.yml"
if (Test-Path $DockerComposePath) {
    Write-Status "Docker Compose found"
    Write-Host "Recent application logs:" -ForegroundColor Yellow
    try {
        Set-Location "/opt/dh-portfolio"
        docker-compose logs --tail=20 backend 2>$null
    } catch {
        Write-Warning "Could not retrieve logs"
    }
} else {
    Write-Warning "Docker Compose not found at $DockerComposePath"
}

Write-Host ""
Write-Status "Script completed. Check the output above for issues and apply the suggested fixes." 