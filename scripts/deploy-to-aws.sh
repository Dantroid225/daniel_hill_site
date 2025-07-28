#!/bin/bash

# AWS Production Deployment Script
# This script automates the deployment of the Daniel Hill Portfolio to AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/daniel_hill_site"
BACKUP_DIR="/home/ubuntu/backups"
DOMAIN=""
DB_HOST=""
DB_USER=""
DB_PASSWORD=""
DB_NAME="dh_portfolio"

echo -e "${BLUE}🚀 AWS Production Deployment Script${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Function to get user input
get_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\${input:-$default}"
    else
        read -p "$prompt: " input
        eval "$var_name=\$input"
    fi
}

# Get deployment configuration
echo -e "\n${BLUE}📋 Deployment Configuration${NC}"
echo -e "${BLUE}============================${NC}"

get_input "Enter your domain name (e.g., yourdomain.com)" "" DOMAIN
get_input "Enter database host (RDS endpoint or localhost)" "localhost" DB_HOST
get_input "Enter database username" "dbuser" DB_USER
get_input "Enter database password" "" DB_PASSWORD
get_input "Enter database name" "dh_portfolio" DB_NAME

# Validate inputs
if [ -z "$DOMAIN" ]; then
    print_warning "No domain specified. SSL certificate will not be configured."
fi

if [ -z "$DB_PASSWORD" ]; then
    print_error "Database password is required"
    exit 1
fi

print_status "Configuration captured"

# Function to install Docker
install_docker() {
    print_info "Installing Docker..."
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        print_status "Docker installed"
    else
        print_status "Docker already installed"
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_status "Docker Compose installed"
    else
        print_status "Docker Compose already installed"
    fi
}

# Function to setup application
setup_application() {
    print_info "Setting up application..."
    
    # Create application directory
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Clone repository if not exists
    if [ ! -d ".git" ]; then
        print_info "Cloning repository..."
        git clone https://github.com/yourusername/daniel_hill_site.git .
    else
        print_info "Repository already exists, pulling latest changes..."
        git pull origin main
    fi
    
    # Create environment file
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_status "Environment file created"
    fi
    
    # Generate secure secrets
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || echo "dev-jwt-secret-key-for-development-only")
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || echo "dev-session-secret-key-for-development-only")
    
    # Update environment file
    cat > backend/.env << EOF
# Application
NODE_ENV=production
PORT=5000

# Database
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=3306

# Security
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# CORS
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# Email (configure these later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=contact@$DOMAIN
EOF
    
    print_status "Environment configured"
}

# Function to setup Nginx
setup_nginx() {
    print_info "Setting up Nginx..."
    
    # Install Nginx
    sudo apt install nginx -y
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/dh-portfolio > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/dh-portfolio /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_status "Nginx configured"
}

# Function to setup SSL
setup_ssl() {
    if [ -n "$DOMAIN" ]; then
        print_info "Setting up SSL certificate..."
        
        # Install Certbot
        sudo apt install certbot python3-certbot-nginx -y
        
        # Get SSL certificate
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Test auto-renewal
        sudo certbot renew --dry-run
        
        print_status "SSL certificate configured"
    else
        print_warning "Skipping SSL setup (no domain specified)"
    fi
}

# Function to create utility scripts
create_scripts() {
    print_info "Creating utility scripts..."
    
    cd $APP_DIR
    
    # Update script
    cat > update-app.sh << 'EOF'
#!/bin/bash

# Navigate to application directory
cd /home/ubuntu/daniel_hill_site

# Pull latest changes
git pull origin main

# Stop services
docker-compose down

# Rebuild and start services
docker-compose up -d --build

# Clean up old images
docker image prune -f

echo "Application updated successfully!"
EOF
    
    # Monitoring script
    cat > monitor.sh << 'EOF'
#!/bin/bash

echo "=== System Resources ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== Docker Status ==="
docker-compose ps
echo ""

echo "=== Recent Logs ==="
docker-compose logs --tail=20
EOF
    
    # Backup script
    cat > backup.sh << 'EOF'
#!/bin/bash

# Create backup directory
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup date
DATE=$(date +%Y%m%d_%H%M%S)

# Backup environment file
cp backend/.env $BACKUP_DIR/env_backup_$DATE

# Backup uploads (if any)
if [ -d "backend/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz backend/uploads/
fi

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    # Make scripts executable
    chmod +x update-app.sh monitor.sh backup.sh
    
    print_status "Utility scripts created"
}

# Function to deploy application
deploy_application() {
    print_info "Deploying application..."
    
    cd $APP_DIR
    
    # Build and start services
    docker-compose up -d --build
    
    # Wait for services to start
    sleep 10
    
    # Check service status
    if docker-compose ps | grep -q "Up"; then
        print_status "Application deployed successfully"
    else
        print_error "Application deployment failed"
        docker-compose logs
        exit 1
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_info "Setting up monitoring..."
    
    # Install monitoring tools
    sudo apt install htop iotop -y
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    # Schedule daily backup
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -
    
    print_status "Monitoring configured"
}

# Function to display final information
display_final_info() {
    echo -e "\n${GREEN}🎉 Deployment Completed Successfully!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo -e ""
    echo -e "${BLUE}📋 Application Information:${NC}"
    echo -e "   Application Directory: $APP_DIR"
    echo -e "   Backup Directory: $BACKUP_DIR"
    echo -e ""
    
    if [ -n "$DOMAIN" ]; then
        echo -e "${BLUE}🌐 Access URLs:${NC}"
        echo -e "   Frontend: https://$DOMAIN"
        echo -e "   Backend API: https://$DOMAIN/api"
    else
        echo -e "${BLUE}🌐 Access URLs:${NC}"
        echo -e "   Frontend: http://$(curl -s ifconfig.me):80"
        echo -e "   Backend API: http://$(curl -s ifconfig.me):5000/api"
    fi
    
    echo -e ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo -e "   Check status: cd $APP_DIR && ./monitor.sh"
    echo -e "   View logs: cd $APP_DIR && docker-compose logs -f"
    echo -e "   Update app: cd $APP_DIR && ./update-app.sh"
    echo -e "   Manual backup: cd $APP_DIR && ./backup.sh"
    echo -e ""
    echo -e "${BLUE}🔒 Security Notes:${NC}"
    echo -e "   - Update email configuration in backend/.env"
    echo -e "   - Configure AWS Security Groups for ports 80, 443, 22"
    echo -e "   - Set up CloudWatch monitoring"
    echo -e "   - Configure automated backups to S3"
    echo -e ""
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo -e "   1. Test the application"
    echo -e "   2. Configure email settings"
    echo -e "   3. Set up monitoring alerts"
    echo -e "   4. Configure CI/CD pipeline"
    echo -e ""
}

# Main deployment process
main() {
    print_info "Starting AWS deployment..."
    
    # Install Docker
    install_docker
    
    # Setup application
    setup_application
    
    # Setup Nginx
    setup_nginx
    
    # Deploy application
    deploy_application
    
    # Setup SSL (if domain provided)
    setup_ssl
    
    # Create utility scripts
    create_scripts
    
    # Setup monitoring
    setup_monitoring
    
    # Display final information
    display_final_info
    
    print_status "Deployment completed!"
}

# Run main function
main "$@" 