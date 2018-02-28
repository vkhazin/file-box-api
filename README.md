# File Box Api

## Overview

* Create a simple to use API to upload/download files to abstract consumers from incorporating aws sdk
* The end-point will use a lightway Node.js as a mostly pass-through requests to S3 bucket
* Restful design patern will be used to streamline adoption of the API
* Aws API-Gateway + Lambda will be used insead of ec2 self-hosting to reduce TCO and to increase elasticity
* S3 Buckets will be used to store the files for out-of-the-box high availability support and to reduce TCO for storage space
* Authentication and Authorization will not use aws tokens to isolate consumers from aws sdk, instead it will rely on configuration json file stored in lambda environment variable

## Requirements

1. Build Node.js Restful end-point to upload/download files
2. The end-point should support aws-api-gateway + lambda
3. The end-point will be reading/writing files from/to s3 or mocked storage depending on the configuration
4. Deployment of the end-point to aws-api-gateway/lambda and to ec2 instance is to be automated using terraform and bash scripts
5. Code to be committed to the repository
6. Unit tests and integration test will be required
7. Logging at error/warning/info levels to be redirected to AWS CloudWatch for both deployment models
8. Configuration must use lambda environment variables for lambda deployment and ec2 launch script for ec2 deployment to populate environment variables
9. Documentation with sample request/response will use a Markdown format and Swagger

## Use Cases

1. Store mulitple versions of the same document with an option to limit old version to N
2. Support ttl for automatic files expiry and purging

## [API Design](./docs/API.md)

## [Authentication and Authorization](./docs/AuthC&AuthZ.md)

## [Storage Design](./docs/StorageDesign.md)

## Deployment

1. Change mode:
  ```bash
  chmod +x ./aws/*.sh
  ```

2. Set AWS Credentials and Region 
  ```bash
  export AWS_ACCESS_KEY_ID=YOUR-ACCESS-KEY-ID
  export AWS_SECRET_ACCESS_KEY=YOUR-SECRET-ACCESS-KEY
  export AWS_DEFAULT_REGION=YOUR-DEFAULT-REGION-ID
  export LAMBDA_FUNCTION_NAME=YOUR-FUNCTION-NAME
  export S3_BUCKET_NAME=YOUR-BUCKET-NAME
  export LAMBDA_ROLE_NAME=YOUR-ROLE-NAME
  ```

3. Create Lambda Role
  ```bash
  ./aws/create-lambda-role.sh $LAMBDA_ROLE_NAME
  ```

4. Create Lambda Function
  ```bash
  ./aws/create-lambda.sh $LAMBDA_FUNCTION_NAME $LAMBDA_ROLE_NAME $S3_BUCKET_NAME
  ```

5. Create Api GateWay
  ```bash
  sudo python3.6 -m pip install boto3
  python3.6 ./aws/api-gateway/create-api.py $LAMBDA_FUNCTION_NAME
  ```

6. Create Bucket:
  ```bash
  ./aws/create-bucket $S3_BUCKET_NAME
  ```
  
## Development

1. Update lambda:
  ```bash
  ./aws/create-lambda.sh $LAMBDA_FUNCTION_NAME
  ```