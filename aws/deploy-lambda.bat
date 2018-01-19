cls

"C:\Program Files\7-Zip\7z" a -r -tzip .\deployment.zip * -xr!*.git* -xr!*.md -xr!test

aws lambda update-function-code^
 --function-name smith-poc-file-box-api^
 --zip-file fileb://./deployment.zip^
 --publish
    
del .\deployment.zip
