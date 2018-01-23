process.env.config = JSON.stringify(require('../config/local-testing.json'));
const config = (process.env.config)
  ? JSON.parse(process.env.config)
  : require('config');
const logger = require('../logger').create(config);
const fileModule = require('../file-mock').create(config, logger);
const assert = require('assert');

const helloWorldBase64 = 'SGVsbG8gV29ybGQh';

describe('file', function () {

  describe('store', function () {
    it('Should add the file and return the stored file metadata', function (done) {
      const path = '/test/file-1';
      const metadata = [
        {
          a: 1
        }, {
          b: 2
        }
      ];
      fileModule
        .store(path, helloWorldBase64, metadata)
        .then(response => {
          assert.equal(response.metadata.a, metadata.a, 'File meta data is not correct');
          assert.equal(response.metadata.b, metadata.b, 'File meta data is not correct');
          assert.equal(response.path, path, 'File path is not correct');
        })
        .done(done);
    });
  });

  describe('list', function () {
    it('Should return correct number of files', function (done) {
      const path = '/test/file-2';
      const metadata = [];

      fileModule
        .store(path, helloWorldBase64, metadata)
        .then(response => {
          assert.equal(response.path, path, 'File path is not correct');
        });

      fileModule
        .list('/test', 0, 10)
        .then(response => {
          assert(response.length > 0, 'File list length is not correct');
        })
        .done(done);
    });
  });

  describe('fetch', function () {
    it('Should return the stored file metadata', function (done) {
      fileModule
        .fetch('/test/file-1')
        .then(response => {
          assert.equal(response.content, helloWorldBase64, 'File content is not correct');
        })
        .done(done);
    });
  });

  describe('delete', function () {
    it('Should return an OK response', function (done) {
      fileModule
        .delete('/test/file-1')
        .then(response => {
          assert.equal(response, undefined, 'Response should be empty');
        })
        .done(done);
    });
  });

});
