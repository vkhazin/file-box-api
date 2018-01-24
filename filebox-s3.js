'use strict';

const aws = require('aws-sdk');

const stripLeadingSlash = (path) => {
  return path.startsWith('/') ? path.substring(1) : path;
};

exports.create = function (config, logger) {

  const s3Object = (path, properties) => {
    const obj = Object.assign({ Bucket: config.s3.bucket }, properties);
    if (path) {
      obj.Key = stripLeadingSlash(path);
    }
    return obj;
  };

  return (function () {
    return {

      store: (path, content, contentType, metadata) => {
        const s3 = new aws.S3();
        const obj = s3Object(path, {
          Body: content,
          ContentType: contentType,
          Metadata: metadata
        });
        return s3.putObject(obj).promise();
      },

      fetch: (path) => {
        const s3 = new aws.S3();
        const obj = s3Object(path);
        return s3
          .getObject(obj)
          .promise()
          .then(data => {
            return {
              metadata: data.Metadata,
              content: data.Body.toString(),
              contentType: data.ContentType
            };
          });
      },

      // todo: S3 only supports paging based on keys, not object index position
      list: (path, from, size) => {
        const s3 = new aws.S3();
        const obj = s3Object(null, {
          MaxKeys: size,
          Prefix: stripLeadingSlash(path)
        });
        return s3
          .listObjectsV2(obj)
          .promise()
          .then(data => data.Contents.map(x => '/' + x.Key));
      },

      delete: (path) => {
        const s3 = new aws.S3();
        const obj = s3Object(path);
        return s3
          .deleteObject(obj)
          .promise();
      }

    };
  }());
};
