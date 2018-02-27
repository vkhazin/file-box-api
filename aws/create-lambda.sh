#/bin/bash
clear
sudo apt install -y zip 
AWS_REGION='us-west-2'

zip deployment.zip -r * -x *.git*

function=smith-poc-file-box-api
lambda_execution_role_name=lambda-$function-execution
lambda_execution_access_policy_name=lambda-$function-execution-access
lambda_invocation_role_name=lambda-$function-invocation
lambda_invocation_access_policy_name=lambda-$function-invocation-access
lambda_execution_role_arn=$(aws iam create-role \
  --role-name "$lambda_execution_role_name" \
  --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Action":  [
           "sts:AssumeRole"
          ]
        }
      ]
    }' \
  --output text \
  --query 'Role.Arn'
)
echo lambda_execution_role_arn=$lambda_execution_role_arn
aws iam put-role-policy \
  --role-name "$lambda_execution_role_name" \
  --policy-name "$lambda_execution_access_policy_name" \
  --policy-document '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "lambda:InvokeFunction"
         ],
         "Resource": [
           "*"
         ]
       }
     ]
   }'
aws lambda create-function \
    --function-name $function \
    --zip-file fileb://deployment.zip \
    --role "$lambda_execution_role_arn" \
    --handler index.handler \
    --runtime nodejs6.10 \
    --region $AWS_REGION \
    --environment Variables="{config='{\"log\":{\"level\":2},\"filebox\":{\"provider\":\"mock\"},\"s3\":{\"bucket\":\"file-box-poc\"},\"routePrefix\":\"/smith-poc-file-box-api\",\"acl\":{\"authCHeader\":\"x-api-key\",\"apiKeys\":[{\"apiKey\":\"e6ffd1e1-f423-4c2d-b82b-2473f673c2ba\",\"forceMock\":true,\"roles\":[\"full-access\"]},{\"apiKey\":\"fca92103-e03e-4e87-b30b-999822783335\",\"roles\":[\"full-access\"]},{\"apiKey\":\"c75ca992-4cba-4167-9703-c09a12c6684c\",\"roles\":[\"test\"]}],\"roles\":[{\"role\":\"full-access\",\"paths\":[\".*\"]},{\"role\":\"test\",\"paths\":[\"^/test/.*\"]}]}}'
    }"

    
rm deployment.zip