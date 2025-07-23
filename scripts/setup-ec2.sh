#!/bin/bash

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Create application directory
sudo mkdir -p /opt/dh-portfolio
sudo chown ec2-user:ec2-user /opt/dh-portfolio

# Configure environment variables
cat > /opt/dh-portfolio/.env << EOF
DB_HOST=${RDS_ENDPOINT}
DB_USER=admin
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=dh_portfolio_db
JWT_SECRET=${JWT_SECRET}
EOF

echo "EC2 setup completed!" 