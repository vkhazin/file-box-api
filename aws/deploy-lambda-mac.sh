#/bin/bash
clear
AWS_REGION='us-west-2'

zip deployment.zip -r * -x *.git*

aws lambda update-function-code \
    --function-name smith-poc-file-box-api \
    --zip-file fileb://deployment.zip \
    --publish \
    --region $AWS_REGION
    
#rm deployment.zip