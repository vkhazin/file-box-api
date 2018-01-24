process.env.config = JSON.stringify(require('../config/local-testing.json'));
const assert = require('assert');
const lambda = require('../lambda');
const constants = require('../constants');

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
      const metadata = [
        {
          key: 'value1'
        }, {
          key: 'value2'
        }
      ];

      const event = {
        httpMethod: 'POST',
        path: '/test/hello-world',
        headers: {
          [constants.METADATA_HEADER_NAME]: JSON.stringify(metadata),
          'Content-Type': 'text/plain'
        },
        body: helloWorldBase64
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should be equal 200');
          const result = JSON.parse(response.body);
          assert.equal(result.metadata.length, metadata.length, 'Metadata have same number of keys');
          assert.equal(result.metadata[0].key, metadata[0].key, 'Metadata 0 must be correct');
          assert.equal(result.metadata[1].key, metadata[1].key, 'Metadata 1 must be correct');
        })
        .done(done);
    });

    it('Should return a list of files', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/$search',
        queryStringParameters: {
          q: '/test',
          from: 0,
          size: 10
        }
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should be equal 200');
          const result = JSON.parse(response.body);
          assert(result.length > 0, 'Should return at least one file');
        })
        .done(done);
    });

    it('Should return file when fetched', (done) => {
      const event = {
        httpMethod: 'GET',
        path: '/test/hello-world'
      };

      lambda
        .handler(event, context, callback)
        .then((response) => {
          assert.equal(response.statusCode, 200, 'Status code should be equal 200');
          assert.equal(response.body, helloWorldBase64, 'Content must be correct');
        })
        .done(done);
    });

    it('Should return 204 when file is deleted', (done) => {
      const event = {
        httpMethod: 'DELETE',
        path: '/test/hello-world'
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
        path: '/test/hello-world'
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