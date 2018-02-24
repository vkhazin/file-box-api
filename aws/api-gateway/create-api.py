import boto3
import os
import json
import uuid


def _uri(region="us-west-2", lambda_arn=None):
    return ('arn:aws:apigateway:{region}:lambda:path/2015-03-31'
            '/functions/{lambda_arn}/invocations').format(
        region=region, lambda_arn=lambda_arn)


def _build_source_arn_str(region_name, account_id, rest_api_id):
    source_arn = (
        'arn:aws:execute-api:'
        '{region_name}:{account_id}:{rest_api_id}/*').format(
            region_name=region_name,
            # Assuming same account id for lambda function and API gateway.
            account_id=account_id,
            rest_api_id=rest_api_id)
    return source_arn


def _random_id():
    # type: () -> str
    return str(uuid.uuid4())


def add_permission_for_apigateway(function_name, region_name,
                                  account_id, rest_api_id, random_id=None):
    """Authorize API gateway to invoke a lambda function."""
    client = boto3.client('lambda', region_name=region_name)
    source_arn = _build_source_arn_str(region_name, account_id,
                                       rest_api_id)
    if random_id is None:
        random_id = _random_id()
    client.add_permission(
        Action='lambda:InvokeFunction',
        FunctionName=function_name,
        StatementId=random_id,
        Principal='apigateway.amazonaws.com',
        SourceArn=source_arn
    )


def get_account_id(region_name):
    client = boto3.client("sts", region_name=region_name)
    account_id = client.get_caller_identity()["Account"]
    return account_id


script_dir = os.path.dirname(__file__)
abs_file_path = os.path.join(script_dir, "swagger.json")
region_name = "us-west-2"
func_name = "smith-poc-file-box-api"

try:
    with open(abs_file_path, 'r') as data:
        swagger = json.load(data)
        client = boto3.client("lambda", region_name=region_name)
        response = client.get_function_configuration(
            FunctionName=func_name)
        client = boto3.client("apigateway", region_name=region_name)
        swagger['paths']['/{proxy+}']['x-amazon-apigateway-any-method']['x-amazon-apigateway-integration']['uri'] = _uri(
            region=region_name, lambda_arn=response['FunctionArn'])
        response = client.import_rest_api(
            body=json.dumps(swagger, indent=2)
        )
        api_id = response["id"]
        response = client.create_deployment(
            restApiId=api_id,
            stageName="test"
        )
        account_id = get_account_id(region_name=region_name)
        add_permission_for_apigateway(
            function_name=func_name,
            region_name=region_name, account_id=account_id,
            rest_api_id=api_id)
        print("Successfully!")
except Exception as err:
    print("Error: {}".format(err))
