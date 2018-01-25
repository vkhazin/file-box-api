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

      search: (query, from, size, token) => {
        const s3 = new aws.S3();
        const obj = s3Object(null, {
          ContinuationToken: token || null,
          MaxKeys: size,
          Prefix: stripLeadingSlash(query.data),
          StartAfter: from || null
        });
        return s3
          .listObjectsV2(obj)
          .promise()
          .then(data => {
            const result = {
              moreResults: data.IsTruncated,
              results: data.Contents.map(x => {
                return {
                  path: '/' + x.Key,
                  size: x.Size,
                  timestamp: x.LastModified.toISOString()
                };
              })
            };
            if (data.IsTruncated && data.NextContinuationToken) {
              result.nextToken = data.NextContinuationToken;
            }
            return result;
          });
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
