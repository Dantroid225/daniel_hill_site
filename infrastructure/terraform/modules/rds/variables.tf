variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for RDS"
  type        = list(string)
}

variable "instance_type" {
  description = "RDS instance type (not used when using existing database)"
  type        = string
  default     = null
}

variable "database_name" {
  description = "Database name (not used when using existing database)"
  type        = string
  default     = null
}

variable "database_username" {
  description = "Database username for the existing database"
  type        = string
}

variable "database_password" {
  description = "Database password (not used when using existing database)"
  type        = string
  default     = null
  sensitive   = true
}

variable "ec2_security_group_id" {
  description = "EC2 security group ID"
  type        = string
}

variable "existing_db_identifier" {
  description = "Identifier of the existing RDS database to use"
  type        = string
} 