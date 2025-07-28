# SSL Certificate Setup for AWS RDS

This project implements SSL certificate management for secure connections to AWS RDS MySQL instances using Docker containers.

## Overview

The SSL certificate management strategy uses a dedicated certificate download service that:

1. Downloads the AWS RDS global certificate bundle
2. Makes it available to the backend service via volume mounting
3. Ensures secure SSL connections with `VERIFY_IDENTITY` mode

## Architecture

### Certificate Download Service

- **Image**: `alpine`
- **Purpose**: Downloads AWS RDS certificate bundle on container startup
- **Certificate URL**: `https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem`
- **Output**: `/certs/global-bundle.pem` (mounted to host `./certs/`)

### Backend Service Integration

- **Volume Mount**: `./certs:/etc/ssl/certs:ro` (read-only)
- **Environment Variables**:
  - `DB_SSL_CA=/etc/ssl/certs/global-bundle.pem`
  - `DB_SSL_MODE=VERIFY_IDENTITY`
- **Dependency**: Depends on `cert-downloader` service

## Usage

### Production Environment

```bash
# Start all services including certificate download
docker-compose up -d

# The cert-downloader will automatically download certificates
# Backend service will wait for certificates before starting
```

### Development Environment

```bash
# Start development environment with SSL certificates
docker-compose -f docker-compose.dev.yml up -d

# Certificate download happens automatically
```

## Certificate Verification

The setup uses `VERIFY_IDENTITY` SSL mode which provides:

- **Certificate Chain Verification**: Validates the AWS RDS certificate chain
- **Hostname Verification**: Ensures the certificate matches the RDS endpoint
- **Man-in-the-Middle Protection**: Prevents unauthorized certificate substitution

## Environment Variables

The following SSL-related environment variables are automatically set:

| Variable      | Value                              | Description                        |
| ------------- | ---------------------------------- | ---------------------------------- |
| `DB_SSL_CA`   | `/etc/ssl/certs/global-bundle.pem` | Path to AWS RDS certificate bundle |
| `DB_SSL_MODE` | `VERIFY_IDENTITY`                  | SSL verification mode              |

## Troubleshooting

### Certificate Download Issues

```bash
# Check if certificates were downloaded
ls -la certs/

# Manually download certificates if needed
curl -o certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

### SSL Connection Issues

```bash
# Verify certificate integrity
openssl crl2pkcs7 -nocrl -certfile certs/global-bundle.pem | openssl pkcs7 -print_certs > /dev/null

# Check certificate contents
head -5 certs/global-bundle.pem
```

### Container Logs

```bash
# Check certificate downloader logs
docker-compose logs cert-downloader

# Check backend SSL connection logs
docker-compose logs backend
```

## Security Best Practices

1. **Certificate Updates**: AWS rotates certificates periodically. The download service ensures fresh certificates on each deployment.

2. **Read-Only Mounts**: Certificates are mounted as read-only (`:ro`) to prevent modification.

3. **VERIFY_IDENTITY Mode**: Uses the most secure SSL verification mode for production environments.

4. **Certificate Integrity**: The download service verifies certificate integrity before making it available.

## Manual Certificate Management

If you need to manually manage certificates:

```bash
# Create certificates directory
mkdir -p certs

# Download certificate bundle
curl -o certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Set proper permissions
chmod 644 certs/global-bundle.pem
```

## Notes

- The `certs/` directory is excluded from version control (see `.gitignore`)
- Certificates are automatically downloaded on each container startup
- The setup works for both development and production environments
- All existing environment variables and configuration remain unchanged
