'use strict';

const aws = require('aws-sdk')

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
        var buffer = new Buffer(content,'base64');		
        const s3 = new aws.S3();       
        const obj = s3Object(path, {
          Body:buffer,       
          Metadata: metadata,      
          ContentType:contentType
        });
	       		
       return s3.putObject(obj).promise().then(data => {
         return {
            metadata: metadata,
           path: path
         };
       });   
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
              content: data.Body.toString('base64'),
              contentType: data.ContentType,
	      isBase64Encoded: true
            };
          });
      },

      search: (query, from, size, token) => {
        const s3 = new aws.S3();
        const obj = s3Object(null, {
          ContinuationToken: token || null,
          MaxKeys: size || null,
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
