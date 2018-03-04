
./aws/create-lambda-role.sh $LAMBDA_ROLE_NAME && \
./aws/create-lambda.sh $LAMBDA_FUNCTION_NAME $LAMBDA_ROLE_NAME $S3_BUCKET_NAME && \
sudo python3.6 -m pip install boto3  $$ \
python3.6 ./aws/api-gateway/create-api.py $LAMBDA_FUNCTION_NAME && \
./aws/create-bucket $S3_BUCKET_NAME