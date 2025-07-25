terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "dh-portfolio-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = "10.0.0.0/16"
}

# RDS Configuration
module "rds" {
  source = "./modules/rds"
  
  project_name      = var.project_name
  environment       = var.environment
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnet_ids
  instance_type    = var.rds_instance_type
  database_username = var.database_username
  database_password = var.database_password
  ec2_security_group_id = module.ec2.security_group_id
  existing_db_identifier = var.existing_db_identifier
}

# EC2 Configuration
module "ec2" {
  source = "./modules/ec2"
  
  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.public_subnet_ids
  instance_type   = var.ec2_instance_type
  key_name        = "${var.project_name}-key"
  public_key      = var.public_key
}

# S3 Configuration
module "s3" {
  source = "./modules/s3"
  
  project_name     = var.project_name
  environment      = var.environment
  bucket_name      = var.s3_bucket_name
}

# CloudFront Configuration
module "cloudfront" {
  source = "./modules/cloudfront"
  
  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.domain_name
  s3_bucket_id    = module.s3.bucket_id
  s3_bucket_arn   = module.s3.bucket_arn
  alb_domain_name = module.ec2.alb_domain_name
  certificate_arn = var.certificate_arn
}

# Route53 Configuration
module "route53" {
  source = "./modules/route53"
  
  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.domain_name
  cloudfront_domain_name = module.cloudfront.distribution_domain_name
} 