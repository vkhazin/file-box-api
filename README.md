# File Box Api

## Requirements

1. Build Node.js Restful end-point to upload/download files
1. The end-point should support dual deployment model: using aws-api-gateway + lambda and a deployment on ec2 instances using suitable run-time host (forever-service, pm2 or other suggestions are welcome)
1. The end-point will be reading/writing files from/to s3, aws efs, or mocked storage depending on the configuration
1. Deployment of the end-point to aws-api-gateway/lambda and to ec2 instance is to be automated using terraform and bash scripts
1. Code to be committed to the repository
1. Unit tests and integration test will be required
1. Logging at error/warning/info levels to be redirected to AWS CloudWatch for both deployment models
1. Configuration must use lambda environment variables for lambda deployment and ec2 launch script for ec2 deployment to populate environment variables
1. Documentation with sample request/response will use a Markdown format and/or a RAML/Swagger

## Use Cases

1. Store mulitple versions of the same document with an option to limit old version to N
1. Support ttl for automatic files expiry and purging

## [API Design](./docs/API.md)

## [Authentication and Authorization](./docs/AuthC&AuthZ.md)

## [Storage Design](./docs/StorageDesign.md)

## Install

1.Set AWS Credentials

```bash
aws configure
```

Set Default output format: json

2.Create Lambda Function

```bash
./aws/create-lambda.sh
```

3.Create Api GateWay

```bash
python3.6 ./aws/api-gateway/create-api.py
```