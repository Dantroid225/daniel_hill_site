# Create a new hosted zone for the domain
resource "aws_route53_zone" "main" {
  name = var.domain_name
  
  tags = {
    Name        = "${var.project_name}-${var.environment}-zone"
    Project     = var.project_name
    Environment = var.environment
  }
}

# A record for the root domain pointing to ALB or CloudFront
resource "aws_route53_record" "main" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.is_cloudfront ? "Z2FDTNDATAQYW2" : "Z35SXDOTRQ7X7K" # CloudFront or ALB zone ID
    evaluate_target_health = false
  }
}

# A record for www subdomain pointing to ALB or CloudFront
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.is_cloudfront ? "Z2FDTNDATAQYW2" : "Z35SXDOTRQ7X7K" # CloudFront or ALB zone ID
    evaluate_target_health = false
  }
}

# A record for api subdomain pointing to ALB
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.is_cloudfront ? "Z2FDTNDATAQYW2" : "Z35SXDOTRQ7X7K" # CloudFront or ALB zone ID
    evaluate_target_health = false
  }
}

# Outputs
output "zone_id" {
  value = aws_route53_zone.main.zone_id
}

output "name_servers" {
  value = aws_route53_zone.main.name_servers
  description = "Nameservers to configure at your domain registrar"
} 