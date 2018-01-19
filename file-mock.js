'use strict';
const promise = require('bluebird');
const utils = require('./utils');

const repo = {};

exports.create = function (config, logger) {

  return (function () {
    return {

      store: function (path, data) {
        const file = {
          content: data.content,
          metadata: data.metadata,
          path: path
        };
        repo[path] = file;
        return promise.resolve({metadata: data.metadata, path: path});
      },

      fetch: function (path) {
        if (repo[path]) {
          return promise.resolve(repo[path]);
        }
        return promise.reject(`No file found at "${path}"`);
      },

      list: function (path, from, size) {
        if (path[path.length - 1] === '/') {
          path = path.substring(0, path.length - 1);
        }
        let to = from + size;
        let skip = 0;
        let files = [];
        const filesInFolder = Object
          .keys(repo)
          .filter(x => utils.splitPath(x).folder == path);
        const thisSetPaths = filesInFolder.slice(from, from + size);
        const thisSetFiles = [];
        for (var i = 0; i < thisSetPaths.length; i++) {
          thisSetFiles.push(repo[thisSetPaths[i]]);
        }
        return promise.resolve(thisSetFiles);
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
