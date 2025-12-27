packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1.3"
    }
  }
}

source "amazon-ebs" "golden" {
  region                  = var.region
  instance_type           = var.instance_type
  ssh_username            = "ec2-user"
  ami_name                = "${var.ami_name}-{{timestamp}}"
  iam_instance_profile    = "GoldenAMIBuilderRole"

  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      virtualization-type = "hvm"
      root-device-type    = "ebs"
    }
    owners      = ["amazon"]
    most_recent = true
  }
}

build {
  sources = ["source.amazon-ebs.golden"]

  provisioner "shell" {
    scripts = [
      "scripts/install-base.sh",
      "scripts/install-docker.sh",
      "scripts/install-codedeploy.sh",
      "scripts/install-monitoring.sh",
      "scripts/validate.sh"
    ]
  }
}
