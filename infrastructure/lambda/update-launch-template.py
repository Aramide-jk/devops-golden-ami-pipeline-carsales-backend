import json
import boto3
import os
from datetime import datetime

ec2 = boto3.client('ec2')
autoscaling = boto3.client('autoscaling')
codepipeline = boto3.client('codepipeline')

LAUNCH_TEMPLATE_ID = os.environ.get('LAUNCH_TEMPLATE_ID')
ASG_NAME = os.environ.get('ASG_NAME')
MIN_HEALTHY_PERCENTAGE = int(os.environ.get('MIN_HEALTHY_PERCENTAGE', '90'))

def lambda_handler(event, context):
    """
    Main Lambda handler
    """
    print(f"Event received: {json.dumps(event)}")
    
    # Get job ID for CodePipeline
    job_id = event['CodePipeline.job']['id']
    
    try:
        # Get AMI metadata from CodePipeline artifact
        ami_metadata = get_ami_metadata(event)
        ami_id = ami_metadata['amiId']
        image_tag = ami_metadata.get('imageTag', 'unknown')
        commit_hash = ami_metadata.get('commitHash', 'unknown')
        
        print(f"AMI ID: {ami_id}")
        print(f"Image Tag: {image_tag}")
        print(f"Commit Hash: {commit_hash}")
        
        # Update Launch Template
        new_version = update_launch_template(ami_id, image_tag, commit_hash)
        print(f"Created Launch Template version: {new_version}")
        
        # Trigger ASG Instance Refresh
        refresh_id = trigger_instance_refresh()
        print(f"Started instance refresh: {refresh_id}")
        
        # Report success to CodePipeline
        codepipeline.put_job_success_result(
            jobId=job_id,
            outputVariables={
                'amiId': ami_id,
                'launchTemplateVersion': str(new_version),
                'instanceRefreshId': refresh_id
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Launch Template updated successfully',
                'amiId': ami_id,
                'launchTemplateVersion': new_version,
                'instanceRefreshId': refresh_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        
        # Report failure to CodePipeline
        codepipeline.put_job_failure_result(
            jobId=job_id,
            failureDetails={
                'type': 'JobFailed',
                'message': str(e)
            }
        )
        
        raise

def get_ami_metadata(event):
    """
    Extract AMI metadata from CodePipeline artifact
    """
    # Get artifact location from event
    job_data = event['CodePipeline.job']['data']
    input_artifacts = job_data['inputArtifacts']
    
    if not input_artifacts:
        raise ValueError("No input artifacts found")
    
    # Get artifact from S3
    location = input_artifacts[0]['location']['s3Location']
    bucket = location['bucketName']
    key = location['objectKey']
    
    print(f"Downloading artifact from s3://{bucket}/{key}")
    
    s3 = boto3.client('s3')
    
    # Download and extract artifact
    import zipfile
    import tempfile
    
    with tempfile.NamedTemporaryFile() as tmp_file:
        s3.download_fileobj(bucket, key, tmp_file)
        tmp_file.flush()
        
        with zipfile.ZipFile(tmp_file.name, 'r') as zip_ref:
            # Read ami-metadata.json from zip
            with zip_ref.open('ami-metadata.json') as metadata_file:
                metadata = json.load(metadata_file)
                return metadata

def update_launch_template(ami_id, image_tag, commit_hash):
    """
    Create new Launch Template version with new AMI
    """
    # Get current launch template
    response = ec2.describe_launch_templates(
        LaunchTemplateIds=[LAUNCH_TEMPLATE_ID]
    )
    
    template = response['LaunchTemplates'][0]
    template_name = template['LaunchTemplateName']
    
    print(f"Updating Launch Template: {template_name}")
    
    # Get latest version details
    version_response = ec2.describe_launch_template_versions(
        LaunchTemplateId=LAUNCH_TEMPLATE_ID,
        Versions=['$Latest']
    )
    
    latest_version_data = version_response['LaunchTemplateVersions'][0]['LaunchTemplateData']
    
    # Create new version with updated AMI
    new_version_response = ec2.create_launch_template_version(
        LaunchTemplateId=LAUNCH_TEMPLATE_ID,
        SourceVersion='$Latest',
        VersionDescription=f'AMI update - Tag: {image_tag}, Commit: {commit_hash}',
        LaunchTemplateData={
            'ImageId': ami_id,
            # Preserve all other settings from latest version
            **{k: v for k, v in latest_version_data.items() if k != 'ImageId'}
        }
    )
    
    new_version = new_version_response['LaunchTemplateVersion']['VersionNumber']
    
    # Set new version as default
    ec2.modify_launch_template(
        LaunchTemplateId=LAUNCH_TEMPLATE_ID,
        DefaultVersion=str(new_version)
    )
    
    print(f"Set version {new_version} as default")
    
    return new_version

def trigger_instance_refresh():
    """
    Trigger ASG instance refresh to roll out new AMI
    """
    print(f"Triggering instance refresh for ASG: {ASG_NAME}")
    
    response = autoscaling.start_instance_refresh(
        AutoScalingGroupName=ASG_NAME,
        Strategy='Rolling',
        Preferences={
            'MinHealthyPercentage': MIN_HEALTHY_PERCENTAGE,
            'InstanceWarmup': 120,
            'CheckpointPercentages': [],
            'CheckpointDelay': 0,
            'SkipMatching': False  # Force refresh even if AMI is same
        }
    )
    
    refresh_id = response['InstanceRefreshId']
    print(f"Instance refresh started: {refresh_id}")
    
    return refresh_id
