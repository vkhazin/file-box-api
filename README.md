# File Box Api #

## Requirements:

1. Build Node.js Restful end-point to upload/download files
2. The end-point should support dual deployment model: using aws-api-gateway + lambda and a deployment on ec2 instances using suitable run-time host (forever-service, pm2 or other suggestions are welcome)
3. The end-point will be reading/writing files from/to s3, aws efs, or mocked storage depending on the configuration
4. Deployment of the end-point to aws-api-gateway/lambda and to ec2 instance is to be automated using terraform and bash scripts
5. Code to be committed to the repository
6. Unit tests and integration test will be required
7. Logging at error/warning/info levels to be redirected to AWS CloudWatch for both deployment models
8. Configuration must use lambda environment variables for lambda deployment and ec2 launch script for ec2 deployment to populate environment variables
9. Documentation with sample request/response will use a Markdown format and/or a RAML/Swagger

## Use Cases to cover
1. Store mulitple versions of the same document with an option to limit old version to N
2. Support ttl for automatic files expiry and purging

## [API Design](./docs/API.md)

## [Authentication and Authrozation](./docs/AuthC&AuthZ.md)