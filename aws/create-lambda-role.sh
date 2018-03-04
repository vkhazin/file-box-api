#/bin/bash
lambda_execution_role_name=$1
lambda_execution_access_policy_name=$1-access
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
        },
        {
            "Action": [
                "logs:*"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Sid": "CloudWatchEventsFullAccess",
            "Effect": "Allow",
            "Action": "events:*",
            "Resource": "*"
        },
        {
            "Sid": "IAMPassRoleForCloudWatchEvents",
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "arn:aws:iam::*:role/AWS_Events_Invoke_Targets"
        }        
      ]
    }' \
  --output text \
  --query 'Role.Arn'
)
# aws iam put-role-policy \
#   --role-name "$lambda_execution_role_name" \
#   --policy-name "$lambda_execution_access_policy_name" \
#   --policy-document '{
#      "Version": "2012-10-17",
#      "Statement": [
#        {
#          "Effect": "Allow",
#          "Action": [
#            "lambda:InvokeFunction"
#          ],
#          "Resource": [
#            "*"
#          ]
#        }
#      ]
#    }'