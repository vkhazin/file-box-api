import boto3
import os
import json

def _uri(region="us-west-2", lambda_arn=None):
     return ('arn:aws:apigateway:{region}:lambda:path/2015-03-31'
                '/functions/{lambda_arn}/invocations').format(
                    region=region, lambda_arn=lambda_arn)
script_dir = os.path.dirname(__file__)
abs_file_path = os.path.join(script_dir, "swagger.json")
region_name = "us-west-2"

try:
    with open(abs_file_path, 'r') as data:
        swagger = json.load(data)
        client = boto3.client("lambda", region_name=region_name)
        response = client.get_function_configuration(
            FunctionName="smith-poc-file-box-api")
        client = boto3.client("apigateway", region_name=region_name)
        swagger['paths']['/{proxy+}']['x-amazon-apigateway-any-method']['x-amazon-apigateway-integration']['uri'] = _uri(region=region_name, lambda_arn=response['FunctionArn'])
        response = client.import_rest_api(
            body=json.dumps(swagger, indent=2)
        )
        api_id = response["id"]
        response = client.create_deployment(
            restApiId=api_id,
            stageName="test"
        )
    print(response)
except Exception as err:
    print("Error: {}".format(err))
