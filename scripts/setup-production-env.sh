#!/bin/bash

# =============================================================================
# Production Environment Setup Script
# =============================================================================
# This script helps set up the production environment on your EC2 instance

set -e

echo "🚀 Setting up production environment for DH Portfolio..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Get RDS endpoint
echo "📡 Getting RDS endpoint..."
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier dhwebsite \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

if [ "$RDS_ENDPOINT" = "None" ] || [ -z "$RDS_ENDPOINT" ]; then
    echo "❌ Could not find RDS instance 'dhwebsite'. Please check:"
    echo "   1. AWS credentials are configured"
    echo "   2. RDS instance exists and is named 'dhwebsite'"
    echo "   3. You have the necessary permissions"
    exit 1
fi

echo "✅ Found RDS endpoint: $RDS_ENDPOINT"

# Generate secure secrets
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Create .env file
echo "📝 Creating .env file..."
cat > backend/.env << EOF
# =============================================================================
# Production Environment Configuration for DH Portfolio Backend
# =============================================================================

# Database Configuration (RDS)
# ----------------------------
DB_HOST=$RDS_ENDPOINT
DB_USER=admin
DB_PASSWORD=zealot3\$Speed
DB_NAME=dh_portfolio
DB_PORT=3306

# JWT Configuration
# -----------------
JWT_SECRET=$JWT_SECRET

# Session Configuration
# --------------------
SESSION_SECRET=$SESSION_SECRET

# CORS Configuration (Production)
# -------------------------------
ALLOWED_ORIGINS=https://daniel-hill.com,https://www.daniel-hill.com

# Application Configuration
# ------------------------
NODE_ENV=production
PORT=5000
EOF

echo "✅ Environment file created at backend/.env"

# Test database connection
echo "🔍 Testing database connection..."
cd backend
if npm run test-db 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "⚠️  Database connection test failed. This might be normal if the database doesn't exist yet."
    echo "   You can proceed with the setup and the database will be created automatically."
fi

echo ""
echo "🎉 Production environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the generated backend/.env file"
echo "2. Run: docker-compose up -d"
echo "3. Run: docker-compose exec backend npm run setup"
echo ""
echo "If you encounter any issues:"
echo "- Check that your EC2 security group allows outbound traffic to port 3306"
echo "- Verify that the RDS instance is running and accessible"
echo "- Ensure the database credentials are correct" 