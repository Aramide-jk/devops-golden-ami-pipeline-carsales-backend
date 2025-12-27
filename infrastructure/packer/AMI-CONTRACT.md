# Golden Backend AMI Contract

This AMI guarantees the following at boot time:

- Docker installed and running
- CodeDeploy agent running
- CloudWatch agent installed
- SSM access enabled
- No application code baked in
- No environment-specific configuration
- Suitable for ASG + ALB health checks

Any change to this contract requires a new AMI build.
