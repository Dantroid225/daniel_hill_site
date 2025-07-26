variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name or ALB domain name"
  type        = string
}

variable "is_cloudfront" {
  description = "Whether the domain name points to CloudFront (true) or ALB (false)"
  type        = bool
  default     = false
} 