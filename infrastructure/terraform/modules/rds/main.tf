

# Reference existing RDS database (read-only)
data "aws_db_instance" "existing" {
  db_instance_identifier = var.existing_db_identifier
}

# Add ingress rule to existing RDS security group only if EC2 security group is provided
resource "aws_security_group_rule" "rds_ec2_access" {
  count = var.ec2_security_group_id != null ? 1 : 0
  
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = var.ec2_security_group_id
  
  # Reference the existing RDS security group
  security_group_id = data.aws_db_instance.existing.vpc_security_groups[0]
  
  description = "Allow EC2 access to RDS"
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

output "db_endpoint" {
  value = data.aws_db_instance.existing.endpoint
}

output "db_name" {
  value = data.aws_db_instance.existing.db_name
}

output "db_username" {
  value = var.database_username
}

output "db_identifier" {
  value = data.aws_db_instance.existing.db_instance_identifier
}

output "db_port" {
  value = data.aws_db_instance.existing.port
} 