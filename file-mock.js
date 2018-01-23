'use strict';
const promise = require('bluebird');
const utils = require('./utils');

const repo = {
  '/sample/file1.txt': {
    metadata: {
      name: 'file1',
      type: 'text'
    },
    content: 'SGVsbG8gV29ybGQh'
  },
  '/sample/file2.png': {
    metadata: {
      name: 'file2',
      type: 'image'
    },
    content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='
  }
};

exports.create = function (config, logger) {

  return (function () {
    return {

      store: function (path, base64Content, metadata) {
        const file = {
          content: base64Content,
          metadata: metadata
        };
        repo[path] = file;
        return promise.resolve({metadata: metadata, path: path});
      },

      fetch: function (path) {
        return promise.resolve(repo[path] || null);
      },

      list: function (path, from, size) {
        let to = from + size;
        let files = [];
        const matchingFiles = Object
          .keys(repo)
          .filter(x => x.startsWith(path));
        const paths = matchingFiles.slice(from, from + size);
        const result = [];
        for (var i = 0; i < paths.length; i++) {
          result.push({
            path: paths[i],
            metadata: repo[paths[i]].metadata
          });
        }
        return promise.resolve(result);
      },

      delete: function (path) {
        if (!repo[path]) {
          return promise.reject(`No file found at "${path}"`);
        }
        delete repo[path];
        return promise.resolve();
      }

    };
  }());
};
