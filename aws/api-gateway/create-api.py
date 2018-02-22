import boto3
import os
script_dir = os.path.dirname(__file__)
abs_file_path = os.path.join(script_dir, "swagger.json")
region_name = "us-west-2"
client = boto3.client("apigateway", region_name=region_name)
try:
    with open(abs_file_path, 'rb') as data:
        response = client.import_rest_api(
            body=data
        )
        api_id = response["id"]
        #response = client.create_deployment(
         #   restApiId=api_id,
          #  stageName="test"
        #)
    print(response)
except Exception as err:
    print("Error: {}".format(err))
