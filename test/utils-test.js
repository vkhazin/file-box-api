const utils = require('../utils');
const assert = require('assert');

describe('utils', function () {

  describe('getKeyValue', function () {

    it('Should find case-insensitive key', function (done) {
      const obj = { 'X-Test-Header': 1 };
      const tests = [ 'X-Test-Header', 'x-test-header', 'X-TEST-HEADER'];
      tests.map(t => {
        const value = utils.getKeyValue(obj, t);
        assert.equal(value, 1, 'Failed to match key');  
      });
      done();
    });

    it('Should not find similar keys', function (done) {
      const obj = { 'X-Test-Header': 1 };
      const tests = [ 'X-Test-Header2', 'x-test', 'Test-Header'];
      tests.map(t => {
        const value = utils.getKeyValue(obj, t);
        assert.equal(value, null, 'Should not have matched key');  
      });
      done();
    });

  });

  describe('parseMetadataHeaders', function () {

    it('Should handle multiple keys', function (done) {
      const headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "cache-control": "no-cache",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "US",
        "Content-Type": "image/gif",
        "Host": "nic9r7i7z6.execute-api.us-west-2.amazonaws.com",
        "Postman-Token": "f95381a7-69a5-4dda-aedf-68e251d3fc92",
        "User-Agent": "PostmanRuntime/7.1.1",
        "Via": "1.1 4ffd1199c1038a2d2062d6a465270ae2.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id": "FmTUxuRcZoAzLn2Y4EJcyvbmB-X8bupYB5LhHrfmXOf8DzM6iW-CEA==",
        "X-Amzn-Trace-Id": "Root=1-5a6a670e-084510f158a42bf12d254e65",
        "X-Forwarded-For": "73.35.243.134, 52.46.17.17",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https",
        "X-Metadata-Color": "Blue",
        "X-Metadata-OtherValue": "Foo",
        "X-Metadata-Size": "Large"
      };
      const result = utils.parseMetadataHeaders(headers);
      assert.equal(Object.keys(result).length, 3, 'Parsed header length is not correct');
      assert.equal(result.Color, 'Blue', 'Metadata value is not correct');
      assert.equal(result['OtherValue'], 'Foo', 'Metadata value is not correct');
      assert.equal(result.Size, 'Large', 'Metadata value is not correct');
      done();
    });

  });

  describe('splitPath', function () {

    it('Should handle a path with nested folders and filename', function (done) {
      const path = '/path/to/the-file';
      const result = utils.splitPath(path);
      assert.equal(result.folder, '/path/to', 'Folder is not correct');
      assert.equal(result.file, 'the-file', 'File is not correct');
      done();
    });

    it('Should handle a path with no folders', function (done) {
      const path = 'the-file';
      const result = utils.splitPath(path);
      assert.equal(result.folder, '', 'Folder is not correct');
      assert.equal(result.file, 'the-file', 'File is not correct');
      done();
    });

    it('Should handle a path with no filename', function (done) {
      const path = '/path/to/';
      const result = utils.splitPath(path);
      assert.equal(result.folder, '/path/to', 'Folder is not correct');
      assert.equal(result.file, '', 'File is not correct');
      done();
    });

  });

  describe('removeCommandSegment', function () {

    it('Should not change a path without a command', function (done) {
      const path = '/path/to/the-file';
      const result = utils.removeCommandSegment(path);
      assert.equal(result, path, 'Path is not correct');
      done();
    });

    it('Should remove command segment from path with file path', function (done) {
      const path = '/$search/path/to/the-file';
      const result = utils.removeCommandSegment(path);
      assert.equal(result, '/path/to/the-file', 'Path is not correct');
      done();
    });

    it('Should remove command segment from path without file path', function (done) {
      const path = '/$search';
      const result = utils.removeCommandSegment(path);
      assert.equal(result, '', 'Path is not correct');
      done();
    });

  });

});