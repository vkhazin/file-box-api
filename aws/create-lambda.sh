#/bin/bash
sudo apt install -y zip 

zip deployment.zip -r * -x *.git*
function=smith-poc-file-box-api
lambda_execution_role_arn=$(aws iam get-role --role-name lambda-role-execution --query 'Role.Arn' --output text)
aws lambda create-function \
    --function-name $function \
    --zip-file fileb://deployment.zip \
    --role "$lambda_execution_role_arn" \
    --handler index.handler \
    --runtime nodejs6.10 \
    --environment Variables="{config='{\"log\":{\"level\":2},\"filebox\":{\"provider\":\"mock\"},\"s3\":{\"bucket\":\"file-box-poc\"},\"routePrefix\":\"/smith-poc-file-box-api\",\"acl\":{\"authCHeader\":\"x-api-key\",\"apiKeys\":[{\"apiKey\":\"e6ffd1e1-f423-4c2d-b82b-2473f673c2ba\",\"forceMock\":true,\"roles\":[\"full-access\"]},{\"apiKey\":\"fca92103-e03e-4e87-b30b-999822783335\",\"roles\":[\"full-access\"]},{\"apiKey\":\"c75ca992-4cba-4167-9703-c09a12c6684c\",\"roles\":[\"test\"]}],\"roles\":[{\"role\":\"full-access\",\"paths\":[\".*\"]},{\"role\":\"test\",\"paths\":[\"^/test/.*\"]}]}}'
    }"

    
rm deployment.zip