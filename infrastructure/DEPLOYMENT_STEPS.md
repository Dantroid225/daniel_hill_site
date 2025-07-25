# Quick Deployment Steps

## 1. Prerequisites

- AWS CLI configured
- Terraform installed
- SSH key pair generated
- Existing RDS database (optional - if you want to use an existing one)

## 2. Setup Steps

### 2.1 Create SSL Certificate

1. Go to AWS Certificate Manager (us-east-1 region)
2. Request certificate for `daniel-hill.com` and `*.daniel-hill.com`
3. Use DNS validation
4. Copy the certificate ARN

### 2.2 Generate SSH Key

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/dh-portfolio-key
```

### 2.3 Update terraform.tfvars

Edit `infrastructure/terraform/terraform.tfvars`:

- Replace `CHANGE_THIS_TO_A_SECURE_PASSWORD` with a secure database password
- Replace `CHANGE_THIS_TO_YOUR_PUBLIC_KEY` with your SSH public key content
- Replace `CHANGE_THIS_TO_YOUR_CERTIFICATE_ARN` with your ACM certificate ARN
- Replace `CHANGE_THIS_TO_YOUR_EXISTING_DB_IDENTIFIER` with your existing RDS database identifier

**Note**: If you don't have an existing RDS database, you can:

1. Remove the `existing_db_identifier` line from terraform.tfvars
2. Modify the RDS module to create a new database instead of referencing an existing one

### 2.4 Deploy Infrastructure

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### 2.5 Get Nameservers

```bash
terraform output -json
```

Look for the `name_servers` output.

### 2.6 Update Namecheap Nameservers

1. Log into Namecheap
2. Go to Domain List → Manage → Domain tab → Nameservers
3. Select "Custom DNS"
4. Replace with AWS nameservers from step 2.5
5. Save

## 3. Deploy Application

```bash
# Build frontend
cd frontend
npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://dh-portfolio-assets --delete
```

## 4. Verify

- Check DNS propagation: `nslookup daniel-hill.com`
- Visit your domain after DNS propagates (can take 24-48 hours)

## 5. Database Configuration

### Using Existing Database

If you're using an existing RDS database:

- Make sure your EC2 instance can reach the database (security groups, VPC, etc.)
- Update your application configuration to use the database endpoint from Terraform outputs
- The database endpoint will be available as: `terraform output -json | jq -r '.module.rds.value.db_endpoint'`

### Creating New Database

If you want to create a new database instead:

1. Remove the `existing_db_identifier` variable from terraform.tfvars
2. Modify the RDS module to create a new database instance
3. Update the database credentials in your application configuration
