variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "dh-portfolio"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "daniel-hill.com"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "rds_instance_type" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.micro"
}

variable "s3_bucket_name" {
  description = "S3 bucket name"
  type        = string
  default     = "dh-portfolio-assets"
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "public_key" {
  description = "Public key for EC2"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
} 