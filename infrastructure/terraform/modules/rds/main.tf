resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [var.ec2_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-rds-sg"
    Environment = var.environment
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

# Reference existing RDS database (read-only)
data "aws_db_instance" "existing" {
  db_instance_identifier = var.existing_db_identifier
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