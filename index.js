'use strict';

// Dependencies
const promise = require('bluebird')
const config = process.env.config? JSON.parse(process.env.config): require('config');
const logger = require('./logger').create(config);
const auth = require('./auth').create(config, logger);
const constants = require('./constants');
const utils = require('./utils');
const router = require('aws-lambda-http-router')

const respond = (statusCode, err, path, apiKey, callback) => {
  const response = {
    statusCode: statusCode,
    body: {
      error: (err.message && err.message.error)? err.message.error: (err || 'Unknown error'),
      path: path,
      apiKey: apiKey
    }
  };
  logger.error(response);
  callback(null, response);
  return promise.resolve(response);
};

const getApiKey = (event) => {
  const apiKey = event.headers[config.acl.authCHeader];
  return apiKey;
};

// Strips off the Lambda function name
const getPath = (event, context) => {
  if (!context.functionName) {
    return event.path;
  }
  if (event.path.includes(context.functionName)) {
    const len = `/${context.functionName}`.length;
    const result = event
      .path
      .substring(len);
    return result
  }
  return event.path
};

// Returns the configured filebox provider, unless the mock header is present
const getFilebox = (event, forceMock) => {
  const useMock = utils.getKeyValue(event.headers, constants.MOCK_HEADER_NAME) == 'true';
  const provider = (forceMock || useMock)? 'mock': config.filebox.provider;
  const fileboxPath = `./filebox-${provider}`;
  const filebox = require(fileboxPath).create(config, logger);
  return filebox;
};

const authWrapper = (path, requestHandler, event, context, callback) => {
  const apiKey = getApiKey(event);
  return auth
    .authCZ(apiKey, path)
    .then(forceMock => {
      const filebox = getFilebox(event, forceMock);
      return requestHandler(filebox, event, context, callback);
    })
    .catch(auth.NotAuthenticated, err => {
      return respond(401, err, path, apiKey, callback);
    })
    .catch(auth.NotAuthorized, err => {
      return respond(403, err, path, apiKey, callback);
    })
    .catch(err => {
      return respond(500, err, path, apiKey, callback);
    });
};

// Handlers
const echoHandler = (event, context, callback) => {
  const rawPath = getPath(event, context);
  const relPath = utils.removeCommandSegment(rawPath);
  const pjson = require('./package.json');
  const response = {
    statusCode: 200,
    body: {
      "version": pjson.version,
      "node": process.version
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return new promise((resolve, reject) => {
    callback(null, response);
    resolve(response);
  });
};

const docsHandler = (event, context, callback) => {
  const fs = require('fs');
  const rawPath = getPath(event, context);
  const relPath = utils.removeCommandSegment(rawPath);

  // Enforce base path to '/$docs' to avoid pathing problems in HTML content
  if (relPath == '/' || relPath == '/index.html') {
    const redirect = {
      statusCode: 301,
      headers: {
        'Location': rawPath.replace(/\$docs.*/, '$docs')
      }
    };
    callback(null, redirect);
    return promise.resolve(redirect);
  }

  const localPath = './docs/swagger-ui' + (relPath || '/index.html');
  
  if (!fs.existsSync(localPath)) {
    const response = {
      statusCode: 404,
      statusMessage: 'Not Found'
    };
    callback(null, response);
    return promise.resolve(response);
  }

  return new promise((resolve, reject) => {
    fs.readFile(localPath, 'utf-8', (err, data) => {
      if (err) {
        return reject(err);
      }

      const contentTypes = {
        css: 'text/css',
        html: 'text/html',
        js: 'text/javascript',
        json: 'application/json',
        png: 'image/png'
      };
      const ext = localPath.match(/\.(\w+)$/)[1];

      const response = {
        statusCode: 200,
        body: data,
        headers: {
          'Content-Type': contentTypes[ext] || 'application/octet-stream'
        }
      };
      callback(null, response);
      resolve(response);
    });
  });
};

const searchHandler = (event, context, callback) => {
  const qs = event.queryStringParameters || {};
  const query = utils.parseQuery(qs.q);
  if (!query || query.type !== 'prefix') {
    return promise.resolve({statusCode: 400});
  }
  return authWrapper(query.data, (filebox, event, context, callback) => {
    return filebox.search(query, Number(qs.from), Number(qs.size), qs.token).then(data => {
      const response = {
        statusCode: 200,
        body: data
      };
      callback(null, response);
      return response;
    });
  }, event, context, callback);
};

const getFileHandler = (event, context, callback) => {
  const path = getPath(event, context);
  return authWrapper(path, (filebox, event, context, callback) => {
    return filebox
      .fetch(path)
      .then(data => {
        const response = {
          statusCode: 404,
          statusMessage: 'Path not found'
        };
        if (data) {
          response.statusCode = 200;
          response.body = data.content;
          response.isBase64Encoded = true;
          response.headers = utils.addMetadataHeaders({
            'Content-Type': data.contentType
          }, data.metadata);
        } else {
          logger.error(JSON.stringify(response));
        }
        callback(null, response);
        return response;
      });
  }, event, context, callback);
};

const postFileHandler = (event, context, callback) => {
  const path = getPath(event, context);
  const contentType = event.headers['Content-Type'] || 'application/octet-stream';
  const metadata = utils.parseMetadataHeaders(event.headers);
  return authWrapper(path, (filebox, event, context, callback) => {
    return filebox
      .store(path, event.body, contentType, metadata)
      .then(data => {
        const response = {
          statusCode: 201
        };
        if (data.metadata) {
          response.headers = utils.addMetadataHeaders({}, data.metadata);
        }
        callback(null, response);
        return response;
      });
  }, event, context, callback);
};

const deleteFileHandler = (event, context, callback) => {
  const path = getPath(event, context);
  return authWrapper(path, (filebox, event, context, callback) => {
    return filebox
      .delete(path)
      .then(data => {
        const response = {
          statusCode: 204
        };
        callback(null, response);
        return response;
      });
  }, event, context, callback);
};

// Routes
const routes = [
  {
    method: 'GET',
    path: '/$echo',
    handler: echoHandler
  }, {
    method: 'GET',
    path: '/$docs*',
    handler: docsHandler
  }, {
    method: 'GET',
    path: '/$search',
    handler: searchHandler
  }, {
    method: 'GET',
    path: '/*', //new RegExp('\/[^$]+'),
    handler: getFileHandler
  }, {
    method: 'POST',
    path: '/*',
    handler: postFileHandler
  }, {
    method: 'DELETE',
    path: '/*',
    handler: deleteFileHandler
  }
];

const httpRouter = router.create(routes);

exports.handler = httpRouter.handler;
