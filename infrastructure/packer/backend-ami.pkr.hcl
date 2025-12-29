packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_account_id" {
  type = string
}

variable "project_name" {
  type    = string
  default = "backend-docker-build"
}

variable "ecr_repo" {
  type = string
}

variable "docker_image_tag" {
  type    = string
  default = "latest"
}

variable "instance_profile_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

source "amazon-ebs" "golden_ami" {
  ami_name        = "${var.project_name}-golden-ami-{{timestamp}}"
  ami_description = "Golden AMI for ${var.project_name}"
  
  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  
  instance_type               = "t3.medium"
  region                      = var.aws_region
  vpc_id                      = var.vpc_id
  subnet_id                   = var.subnet_id
  associate_public_ip_address = true
  iam_instance_profile        = var.instance_profile_name
  
  # Use SSM instead of SSH
  communicator                = "ssh"
  ssh_username                = "ec2-user"
  ssh_interface               = "session_manager"
  
  # Increase timeout
  ssh_timeout = "10m"
  
  tags = {
    Name        = "${var.project_name}-golden-ami"
    Project     = var.project_name
    ManagedBy   = "Packer"
    BuildDate   = "{{timestamp}}"
  }
  
  # Don't require a keypair
  temporary_key_pair_type = "ed25519"
}

build {
  sources = ["source.amazon-ebs.golden_ami"]
  
  provisioner "shell" {
    script = "${path.root}/scripts/install-base.sh"
  }
  
  provisioner "shell" {
    script = "${path.root}/scripts/install-docker.sh"
  }
  
  provisioner "shell" {
    script          = "${path.root}/scripts/install-codedeploy.sh"
    environment_vars = ["AWS_REGION=${var.aws_region}"]
  }
  
  provisioner "shell" {
    script = "${path.root}/scripts/configure-backend.sh"
    environment_vars = [
      "AWS_REGION=${var.aws_region}",
      "AWS_ACCOUNT_ID=${var.aws_account_id}",
      "ECR_REPO=${var.ecr_repo}",
      "DOCKER_IMAGE_TAG=${var.docker_image_tag}"
    ]
  }
  
  post-processor "manifest" {
    output     = "packer-manifest.json"
    strip_path = true
  }
}
