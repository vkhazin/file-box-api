echo "Creating Lambda Role: $LAMBDA_ROLE_NAME "

./aws/create-lambda-role.sh $LAMBDA_ROLE_NAME

sleep 5

echo "Creating Lambda: $LAMBDA_FUNCTION_NAME - Assigned Role: $LAMBDA_ROLE_NAME - Bucket: $S3_BUCKET_NAME"

./aws/create-lambda.sh $LAMBDA_FUNCTION_NAME $LAMBDA_ROLE_NAME $S3_BUCKET_NAME 

sleep 10

echo "Installing boto3..."

sudo python3.6 -m pip install boto3 

echo "Creating API Gateway for Lambda: $LAMBDA_FUNCTION_NAME"

python3.6 ./aws/api-gateway/create-api.py $LAMBDA_FUNCTION_NAME

echo "Creating Bucket: $S3_BUCKET_NAME"

./aws/create-bucket.sh $S3_BUCKET_NAME
