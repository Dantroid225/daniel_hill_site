#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Create application directory
mkdir -p /opt/${project_name}
chown ec2-user:ec2-user /opt/${project_name}

# Start Docker service
systemctl enable docker
systemctl start docker

echo "EC2 setup completed!" 