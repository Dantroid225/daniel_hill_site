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

variable "subnet_id" {
  description = "Subnet ID for EC2"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "public_key" {
  description = "Public key for EC2"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for EC2"
  type        = string
  default     = "ami-0c02fb55956c7d316" # Amazon Linux 2023
} 