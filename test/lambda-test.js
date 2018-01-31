const config = require('../config/local-testing.json');
process.env.config = JSON.stringify(config);

const assert = require('assert');
const lambda = require('../lambda');
const constants = require('../constants');
const utils = require('../utils');

const apiHeaderName = config.acl.authCHeader;
const fullAccessKey = 'fca92103-e03e-4e87-b30b-999822783335';
const helloWorldBase64 = 'SGVsbG8gV29ybGQh';

const context = {
  succeed: data => console.log(data),
  fail: err => console.error(err)
};

const callback = (err, result) => {
  if (!err) {
    return;
  }
  console.log('Lambda Callback(err, result):');
  console.log('result:', result);
  console.error('err:', err);
};

describe('lambda', () => {

  describe('file', () => {

    it('Should return metadata when file is stored', (done) => {
      const event = {
        httpMethod: 'POST',
        path: '/test/hello-world',
        headers: {
          [apiHeaderName]: fullAccessKey,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'CloudFront-Forwarded-Proto': 'https',
          'CloudFront-Is-Desktop-Viewer': 'true',
          'CloudFront-Is-Mobile-Viewer': 'false',
          'CloudFront-Is-SmartTV-Viewer': 'false',
          'CloudFront-Is-Tablet-Viewer': 'false',
          'CloudFront-Viewer-Country': 'US',
          'Content-Type': 'text/plain',
          'Host': 'nic9r7i7z6.execute-api.us-west-2.amazonaws.com',
          'Origin': 'chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop',
          'Postman-Token': '975a999e-f695-148e-e9e5-ff63fd6f174d',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
          'Via': '1.1 bdf69c9338fccde2f01f587a28200671.cloudfront.net (CloudFront)',
          'X-Amz-Cf-Id': 'X7RnfKlG1F0Lqhtq-fuzaaGXuEKTPvoOgGUrAGfykVzyz9qxz0ZL6Q==',
          'X-Amzn-Trace-Id': 'Root=1-5a666cad-5dff7baf1d3061260a6cac7b',
          'X-Forwarded-For': '73.35.243.134, 52.46.16.78',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https',            
          'x-metadata-key1': 'value1',
          'x-metadata-key2': 'value2'
        },
        body: helloWorldBase64
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 201, 'Status code should be equal 201');
          const metadata = utils.parseMetadataHeaders(response.headers);
          assert.equal(Object.keys(metadata).length, 2, 'Metadata have same number of keys');
          assert.equal(metadata.key1, event.headers['x-metadata-key1'], 'Metadata must be correct');
          assert.equal(metadata.key2, event.headers['x-metadata-key2'], 'Metadata must be correct');
        })
        .done(done);
    });

    it('Should return a list of files', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/$search',
        queryStringParameters: {
          q: 'prefix:/sample',
          from: 0,
          size: 10
        },
        headers: {
          [apiHeaderName]: fullAccessKey
        }
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should be equal 200');
          const result = JSON.parse(response.body);
          assert(result.results.length > 0, 'Should return at least one file');
        })
        .done(done);
    });

    it('Should return file and metadata when fetched', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/test/hello-world',
        headers: {
          [apiHeaderName]: fullAccessKey
        }
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should be equal 200');
          assert.equal(response.body, helloWorldBase64, 'Content must be correct');
          assert.equal(response.headers['x-metadata-key1'], 'value1', 'Metadata must be correct');
          assert.equal(response.headers['x-metadata-key2'], 'value2', 'Metadata must be correct');
        })
        .done(done);
    });

    it('Should return 204 when file is deleted', (done) => {
      const event = {
        httpMethod: 'DELETE',
        path: '/test/hello-world',
        headers: {
          [apiHeaderName]: fullAccessKey
        }
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 204, 'Status code should be equal 200');
          assert(response.body == null, 'Body must be null');
        })
        .done(done);
    });

    it('Should return 404 for missing file', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/test/hello-world',
        headers: {
          [apiHeaderName]: fullAccessKey
        }
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 404, 'Status code should equal 404');
        })
        .done(done);
    });

    it('Should return docs HTML', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/$docs'
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should equal 200');
          assert.equal(response.headers['Content-Type'], 'text/html', 'Content type must be correct');
          assert(response.body.toLowerCase().indexOf('<!doctype html>') != -1, 'Body must include HTML doctype');
        })
        .done(done);
    });

    it('Should return docs JavaScript', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/$docs/swagger-ui.js'
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should equal 200');
          assert.equal(response.headers['Content-Type'], 'text/javascript', 'Content type must be correct');
          assert(response.body.indexOf('function') != -1, 'Body must include function');
        })
        .done(done);
    });

  });

});