packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Variables
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_account_id" {
  type = string
}

variable "project_name" {
  type    = string
  default = "backend"
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

# Source AMI Configuration
source "amazon-ebs" "golden_ami" {
  # AMI Configuration
  ami_name        = "${var.project_name}-golden-ami-{{timestamp}}"
  ami_description = "Golden AMI for ${var.project_name} with pre-baked application"
  
  # Use latest Amazon Linux 2023
  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  
  # Instance Configuration
  instance_type               = "t3.medium"
  region                      = var.aws_region
  vpc_id                      = var.vpc_id
  subnet_id                   = var.subnet_id
  associate_public_ip_address = true
  iam_instance_profile        = var.instance_profile_name
  
  # SSH Configuration
  ssh_username = "ec2-user"
  ssh_timeout  = "10m"
  
  # Tags
  tags = {
    Name        = "${var.project_name}-golden-ami"
    Environment = "production"
    BuildDate   = "{{timestamp}}"
    Project     = var.project_name
    ManagedBy   = "Packer"
  }
  
  # Snapshot tags
  snapshot_tags = {
    Name      = "${var.project_name}-golden-ami-snapshot"
    Project   = var.project_name
    ManagedBy = "Packer"
  }
  
  # Launch block device mappings
  launch_block_device_mappings {
    device_name = "/dev/xvda"
    volume_size = 30
    volume_type = "gp3"
    iops        = 3000
    throughput  = 125
    encrypted   = true
    delete_on_termination = true
  }
}

# Build Configuration
build {
  name = "golden-ami-build"
  sources = [
    "source.amazon-ebs.golden_ami"
  ]
  
  # Step 1: Update system packages
  provisioner "shell" {
    script = "${path.root}/scripts/install-base.sh"
  }
  
  # Step 2: Install Docker
  provisioner "shell" {
    script = "${path.root}/scripts/install-docker.sh"
  }
  
  # Step 3: Install CodeDeploy Agent
  provisioner "shell" {
    script          = "${path.root}/scripts/install-codedeploy.sh"
    environment_vars = [
      "AWS_REGION=${var.aws_region}"
    ]
  }
  
  # Step 4: Configure Backend Application
  provisioner "shell" {
    script = "${path.root}/scripts/configure-backend.sh"
    environment_vars = [
      "AWS_REGION=${var.aws_region}",
      "AWS_ACCOUNT_ID=${var.aws_account_id}",
      "ECR_REPO=${var.ecr_repo}",
      "DOCKER_IMAGE_TAG=${var.docker_image_tag}"
    ]
  }
  
  # Step 5: Cleanup
  provisioner "shell" {
    inline = [
      "echo 'Cleaning up...'",
      "sudo rm -rf /tmp/*",
      "sudo rm -rf /var/tmp/*",
      "history -c"
    ]
  }
  
  # Post-processor: Manifest (save AMI ID to file)
  post-processor "manifest" {
    output     = "packer-manifest.json"
    strip_path = true
  }
}