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

# ACM Certificate for HTTPS
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-certificate"
    Environment = var.environment
  }
}

# Certificate validation
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Route53 records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Data source for existing Route53 zone
data "aws_route53_zone" "main" {
  name = var.domain_name
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
  certificate_arn = aws_acm_certificate_validation.main.certificate_arn
}

# S3 Configuration
module "s3" {
  source = "./modules/s3"
  
  project_name     = var.project_name
  environment      = var.environment
  bucket_name      = var.s3_bucket_name
}

# CloudFront Configuration (temporarily disabled - requires AWS account verification)
# module "cloudfront" {
#   source = "./modules/cloudfront"
#   
#   project_name    = var.project_name
#   environment     = var.environment
#   domain_name     = var.domain_name
#   s3_bucket_id    = module.s3.bucket_id
#   s3_bucket_arn   = module.s3.bucket_arn
#   alb_domain_name = module.ec2.alb_domain_name
#   certificate_arn = var.certificate_arn
# }

# Route53 Configuration (temporarily pointing to ALB instead of CloudFront)
module "route53" {
  source = "./modules/route53"
  
  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.domain_name
  cloudfront_domain_name = module.ec2.alb_domain_name
  is_cloudfront   = false
} 