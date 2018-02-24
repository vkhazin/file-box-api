import boto3
import os

region_name = "us-west-2"


def get_rest_api_id(name, region):
    rest_apis = boto3.client('apigateway', region_name=region).get_rest_apis()[
        'items']
    for api in rest_apis:
        if api['name'] == name:
            return api['id']
    return None


rest_api = get_rest_api_id("FileBox", region=region_name)
if rest_api not None:
    response = boto3.client(
        'apigateway', region_name=region_name).delete_rest_api(restApiId=rest_api)
    print(response)
