packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# ----------------------
# VARIABLES
# ----------------------
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

# ----------------------
# SOURCE: Amazon Linux 2023
# ----------------------
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

  communicator   = "ssh"
  ssh_username   = "ec2-user"
  ssh_interface  = "session_manager"
  ssh_timeout    = "10m"
  temporary_key_pair_type = "ed25519"

  tags = {
    Name      = "${var.project_name}-golden-ami"
    Project   = var.project_name
    ManagedBy = "Packer"
    BuildDate = "{{timestamp}}"
  }
}

# ----------------------
# BUILD
# ----------------------
build {
  sources = ["source.amazon-ebs.golden_ami"]

  # ----------------------
  # Base OS tools
  # ----------------------
  provisioner "shell" {
    inline = [
      "set -euxo pipefail",
      "echo Installing base tools...",
      "dnf clean all",
      "dnf makecache",
      "dnf install -y git wget curl unzip jq amazon-ssm-agent"
    ]
  }

  # ----------------------
  # Docker
  # ----------------------
  provisioner "shell" {
    inline = [
      "echo Installing Docker...",
      "dnf install -y docker",
      "systemctl enable docker",
      "systemctl start docker",
      "docker --version"
    ]
  }

  # ----------------------
  # CodeDeploy agent
  # ----------------------
  provisioner "shell" {
    inline = [
      "echo Installing CodeDeploy agent...",
      "cd /tmp",
      "curl -O https://aws-codedeploy-${var.aws_region}.s3.${var.aws_region}.amazonaws.com/latest/install",
      "chmod +x ./install",
      "./install auto",
      "systemctl enable codedeploy-agent",
      "systemctl start codedeploy-agent",
      "systemctl status codedeploy-agent"
    ]
  }

  # ----------------------
  # Backend configuration (ECR pull + validation)
  # ----------------------
  provisioner "shell" {
    inline = [
      "set -euxo pipefail",
      "echo Configuring backend image...",
      "REGION=${var.aws_region}",
      "ACCOUNT_ID=${var.aws_account_id}",
      "REPO=${var.ecr_repo}",
      "IMAGE_TAG=${var.docker_image_tag}",
      "IMAGE_URI=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${IMAGE_TAG}",
      "aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com",
      "docker pull ${IMAGE_URI}",
      "docker images | grep ${REPO}",
      "echo Running backend container for validation...",
      "docker run -d --name backend-validate -p 8000:8000 ${IMAGE_URI}",
      "sleep 10",
      "curl -f http://localhost:8000",
      "docker rm -f backend-validate",
      "echo Backend validated successfully"
    ]
  }

  # ----------------------
  # POST-PROCESSOR: Manifest
  # ----------------------
  post-processor "manifest" {
    output     = "packer-manifest.json"
    strip_path = true
  }
}
