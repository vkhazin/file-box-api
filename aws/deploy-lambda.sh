#/bin/bash
clear
sudo apt install -y zip

zip deployment.zip -r ./ -x *.git*

aws lambda update-function-code \
    --function-name smith-poc-file-box-api \
    --zip-file fileb://deployment.zip \
    --publish \
    
rm deployment.zip