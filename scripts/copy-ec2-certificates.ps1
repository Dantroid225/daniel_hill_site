# PowerShell script to copy certificates from EC2 instance to local certs directory
# This script will automatically detect and copy the appropriate certificate bundle

param(
    [string]$CertDir = "./certs"
)

Write-Host "=== EC2 Certificate Copy Script (PowerShell) ===" -ForegroundColor Green
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Create certs directory if it doesn't exist
if (-not (Test-Path $CertDir)) {
    New-Item -ItemType Directory -Path $CertDir -Force | Out-Null
    Write-Host "Created certs directory: $CertDir" -ForegroundColor Yellow
} else {
    Write-Host "Using existing certs directory: $CertDir" -ForegroundColor Yellow
}
Write-Host ""

# Function to copy certificate with validation
function Copy-Certificate {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )
    
    if (Test-Path $Source -PathType Leaf) {
        try {
            Write-Host "Copying $Description..." -ForegroundColor Cyan
            Write-Host "  From: $Source" -ForegroundColor Gray
            Write-Host "  To: $Destination" -ForegroundColor Gray
            
            # Copy the certificate
            Copy-Item -Path $Source -Destination $Destination -Force
            
            # Set proper permissions (read-only for all users)
            $acl = Get-Acl $Destination
            $acl.SetAccessRuleProtection($false, $true)
            $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "Read", "Allow")
            $acl.AddAccessRule($rule)
            Set-Acl -Path $Destination -AclObject $acl
            
            # Validate the copied certificate
            if (Test-Path $Destination -PathType Leaf) {
                $fileInfo = Get-Item $Destination
                $certCount = (Select-String -Path $Destination -Pattern "BEGIN CERTIFICATE" -AllMatches).Matches.Count
                
                Write-Host "  ✓ Successfully copied" -ForegroundColor Green
                Write-Host "  Size: $($fileInfo.Length) bytes" -ForegroundColor Gray
                Write-Host "  Certificates: $certCount" -ForegroundColor Gray
                Write-Host ""
                return $true
            } else {
                Write-Host "  ✗ Failed to copy certificate" -ForegroundColor Red
                Write-Host ""
                return $false
            }
        } catch {
            Write-Host "  ✗ Error copying certificate: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            return $false
        }
    } else {
        Write-Host "  ✗ Source certificate not found: $Source" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Try to copy certificates in order of preference
$certCopied = $false

# Try Ubuntu/Debian certificate bundle first
if (Copy-Certificate -Source "/etc/ssl/certs/ca-certificates.crt" -Destination "$CertDir/ca-certificates.crt" -Description "Ubuntu/Debian CA Certificates Bundle") {
    $certCopied = $true
    Write-Host "✓ Successfully copied Ubuntu/Debian certificate bundle" -ForegroundColor Green
    Write-Host ""

# Try Amazon Linux/RHEL certificate bundle
} elseif (Copy-Certificate -Source "/etc/pki/tls/certs/ca-bundle.crt" -Destination "$CertDir/ca-certificates.crt" -Description "Amazon Linux/RHEL CA Bundle") {
    $certCopied = $true
    Write-Host "✓ Successfully copied Amazon Linux/RHEL certificate bundle" -ForegroundColor Green
    Write-Host ""

# Try alternative locations
} elseif (Copy-Certificate -Source "/etc/ssl/certs/ca-bundle.crt" -Destination "$CertDir/ca-certificates.crt" -Description "Alternative CA Bundle") {
    $certCopied = $true
    Write-Host "✓ Successfully copied alternative certificate bundle" -ForegroundColor Green
    Write-Host ""

} elseif (Copy-Certificate -Source "/etc/pki/tls/certs/ca-bundle.trust.crt" -Destination "$CertDir/ca-certificates.crt" -Description "Trusted CA Bundle") {
    $certCopied = $true
    Write-Host "✓ Successfully copied trusted certificate bundle" -ForegroundColor Green
    Write-Host ""

} elseif (Copy-Certificate -Source "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem" -Destination "$CertDir/ca-certificates.crt" -Description "CA Trust Extracted PEM") {
    $certCopied = $true
    Write-Host "✓ Successfully copied CA trust extracted PEM" -ForegroundColor Green
    Write-Host ""

} else {
    Write-Host "✗ No suitable certificate bundle found on the system" -ForegroundColor Red
    Write-Host ""
    Write-Host "Available certificate files:" -ForegroundColor Yellow
    
    # List available certificate files
    $certPaths = @(
        "/etc/ssl/certs/ca-certificates.crt",
        "/etc/pki/tls/certs/ca-bundle.crt", 
        "/etc/ssl/certs/ca-bundle.crt",
        "/etc/pki/tls/certs/ca-bundle.trust.crt",
        "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem"
    )
    
    foreach ($certPath in $certPaths) {
        if (Test-Path $certPath -PathType Leaf) {
            $fileInfo = Get-Item $certPath
            Write-Host "  - $certPath ($($fileInfo.Length) bytes)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Please manually copy one of the available certificate files to $CertDir/ca-certificates.crt" -ForegroundColor Yellow
    exit 1
}

# Verify the copied certificate
Write-Host "=== Verifying Copied Certificate ===" -ForegroundColor Green
$certFile = "$CertDir/ca-certificates.crt"
if (Test-Path $certFile -PathType Leaf) {
    $fileInfo = Get-Item $certFile
    $certCount = (Select-String -Path $certFile -Pattern "BEGIN CERTIFICATE" -AllMatches).Matches.Count
    
    Write-Host "Certificate file: $certFile" -ForegroundColor Cyan
    Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Gray
    Write-Host "Permissions: $((Get-Acl $certFile).AccessToString)" -ForegroundColor Gray
    Write-Host "Number of certificates: $certCount" -ForegroundColor Gray
    
    # Show first few lines to verify it's a valid certificate
    Write-Host "First few lines:" -ForegroundColor Gray
    Get-Content $certFile -Head 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    
    Write-Host "✓ Certificate copy and verification complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The certificate is now ready to be used by your Docker container." -ForegroundColor Yellow
    Write-Host "Your docker-compose.yml is already configured to mount this certificate." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To use this certificate:" -ForegroundColor Cyan
    Write-Host "1. The certificate is mounted at: /etc/ssl/certs/ca-certificates.crt in the container" -ForegroundColor Gray
    Write-Host "2. Environment variable DB_SSL_CA is set to: /etc/ssl/certs/ca-certificates.crt" -ForegroundColor Gray
    Write-Host "3. Environment variable DB_SSL_MODE is set to: VERIFY_CA" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update your database.js to enable SSL with the certificate" -ForegroundColor Gray
    Write-Host "2. Rebuild and restart your Docker containers" -ForegroundColor Gray
    Write-Host "3. Test the database connection" -ForegroundColor Gray
    
} else {
    Write-Host "✗ Certificate verification failed - file not found" -ForegroundColor Red
    exit 1
} 