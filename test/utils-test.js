const utilsModule = require('../utils');
const assert = require('assert');

describe('utils', function () {

		describe('splitPath', function () {

				it('Should handle a path with nested folders and filename', function (done) {
						const path = '/path/to/the-file';
						const result = utilsModule.splitPath(path);
						assert.equal(result.folder, '/path/to', 'Folder is not correct');
						assert.equal(result.file, 'the-file', 'File is not correct');
						done();
				});

				it('Should handle a path with no folders', function (done) {
						const path = 'the-file';
						const result = utilsModule.splitPath(path);
						assert.equal(result.folder, '', 'Folder is not correct');
						assert.equal(result.file, 'the-file', 'File is not correct');
						done();
				});

				it('Should handle a path with no filename', function (done) {
						const path = '/path/to/';
						const result = utilsModule.splitPath(path);
						assert.equal(result.folder, '/path/to', 'Folder is not correct');
						assert.equal(result.file, '', 'File is not correct');
						done();
				});

		});

		describe('removeCommandSegment', function () {

      it('Should not change a path without a command', function (done) {
          const path = '/path/to/the-file';
          const result = utilsModule.removeCommandSegment(path);
          assert.equal(result, path, 'Path is not correct');
          done();
      });

      it('Should remove command segment from path with file path', function (done) {
          const path = '/$search/path/to/the-file';
          const result = utilsModule.removeCommandSegment(path);
          assert.equal(result, '/path/to/the-file', 'Path is not correct');
          done();
      });

      it('Should remove command segment from path without file path', function (done) {
        const path = '/$search';
        const result = utilsModule.removeCommandSegment(path);
        assert.equal(result, '', 'Path is not correct');
        done();
    });

  });

});