# Infrastructure as Code

This directory contains the Terraform configuration for deploying the DH Portfolio website to AWS.

## Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                 # Main Terraform configuration
│   ├── variables.tf            # Variable definitions
│   ├── terraform.tfvars.example # Example variable values
│   └── modules/
│       ├── vpc/               # VPC and networking
│       ├── rds/               # Database configuration
│       ├── ec2/               # Application servers
│       ├── s3/                # Static asset storage
│       ├── cloudfront/        # Content delivery network
│       └── route53/           # DNS management
```

## Components

### VPC Module

- Custom VPC with public and private subnets
- Internet Gateway for public access
- NAT Gateways for private subnet internet access
- Route tables for traffic routing

### RDS Module

- MySQL database instance
- Multi-AZ deployment for high availability
- Automated backups and maintenance windows
- Security group for database access

### EC2 Module

- Auto Scaling Group for application servers
- Application Load Balancer for traffic distribution
- Launch template with user data for initialization
- IAM roles for AWS service access

### S3 Module

- Static asset storage bucket
- Versioning and lifecycle policies
- Server-side encryption
- CloudFront origin access

### CloudFront Module

- Global content delivery network
- SSL/TLS termination
- Caching policies for different content types
- Custom error handling for SPA routing

### Route53 Module

- DNS management for custom domain
- A records pointing to CloudFront distribution
- Health checks and failover configuration

## Usage

1. **Initialize Terraform**:

   ```bash
   cd infrastructure/terraform
   terraform init
   ```

2. **Configure Variables**:

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan Deployment**:

   ```bash
   terraform plan
   ```

4. **Apply Infrastructure**:

   ```bash
   terraform apply
   ```

5. **Destroy Infrastructure**:
   ```bash
   terraform destroy
   ```

## Variables

| Variable            | Description         | Default               |
| ------------------- | ------------------- | --------------------- |
| `aws_region`        | AWS region          | `us-east-1`           |
| `project_name`      | Project name        | `dh-portfolio`        |
| `environment`       | Environment name    | `production`          |
| `domain_name`       | Domain name         | `daniel-hill.com`     |
| `ec2_instance_type` | EC2 instance type   | `t3.micro`            |
| `rds_instance_type` | RDS instance type   | `db.t3.micro`         |
| `s3_bucket_name`    | S3 bucket name      | `dh-portfolio-assets` |
| `database_password` | Database password   | Required              |
| `public_key`        | SSH public key      | Required              |
| `certificate_arn`   | SSL certificate ARN | Required              |

## Outputs

After successful deployment, Terraform will output:

- `alb_domain_name`: Application Load Balancer domain
- `db_endpoint`: RDS database endpoint
- `cloudfront_domain`: CloudFront distribution domain
- `s3_bucket`: S3 bucket name

## Security

- All resources are deployed in a custom VPC
- Database is in private subnets
- Security groups restrict access
- SSL/TLS encryption enabled
- IAM roles with minimal permissions

## Cost Estimation

Monthly costs (us-east-1):

- EC2 t3.micro: ~$8.50
- RDS db.t3.micro: ~$15.00
- CloudFront: ~$1.00
- S3: ~$0.50
- Route53: ~$0.50
- **Total: ~$25.50/month**

## Maintenance

### Updates

1. Modify Terraform configuration
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes

### Monitoring

- CloudWatch metrics for all resources
- Application health checks
- Database performance monitoring
- Cost tracking and alerts

### Backups

- RDS automated backups (7 days)
- S3 versioning for static assets
- Terraform state in S3 with versioning

## Troubleshooting

### Common Issues

1. **Terraform State Lock**

   ```bash
   terraform force-unlock <lock-id>
   ```

2. **Module Dependencies**

   - Ensure VPC is created before other resources
   - Check security group references

3. **Certificate Validation**
   - Verify DNS records are created
   - Check certificate region matches CloudFront

### Logs and Debugging

```bash
# Terraform logs
export TF_LOG=DEBUG
terraform apply

# AWS CLI debugging
aws sts get-caller-identity
aws ec2 describe-instances --filters "Name=tag:Name,Values=dh-portfolio*"
```

## Best Practices

1. **State Management**

   - Use remote state storage (S3)
   - Enable state locking (DynamoDB)
   - Use workspaces for environments

2. **Security**

   - Use IAM roles instead of access keys
   - Enable CloudTrail logging
   - Regular security audits

3. **Cost Optimization**

   - Use spot instances for non-critical workloads
   - Implement auto-scaling policies
   - Monitor and optimize storage usage

4. **Monitoring**
   - Set up CloudWatch alarms
   - Configure log aggregation
   - Regular performance reviews
