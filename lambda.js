'use strict';

// Dependencies

const promise = require('bluebird')
const config = process.env.config
  ? JSON.parse(process.env.config)
  : require('config');
const logger = require('./logger').create(config);
const constants = require('./constants');
const utils = require('./utils');

const resolveError = (promise, callback) => {
  return (err) => {
    const response = {
      statusCode: 500,
      body: err
    };
    callback(null, response);
    return promise.resolve(response);
  };
}

// Strips off the Lambda function name
const getPath = (event, context) => {
  if (!context.functionName) {
    return event.path;
  }
  const len = `/${context.functionName}`.length;
  return event.path.substring(len);
}

// Returns the configured filebox provider, unless the mock header is present
const getFilebox = (event) => {
  const provider = (event.headers && event.headers[constants.MOCK_HEADER_NAME] == 'true') ? 'mock' : config.filebox.provider;
  const fileboxPath = `./filebox-${provider}`;
  const filebox = require(fileboxPath).create(config, logger);
  return filebox;
}

// Handlers

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
    const response = { statusCode: 404 };
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
        png: 'image/png',
      };
      const ext = localPath.match(/\.(\w+)$/)[1];
    
      const response = {
        statusCode: 200,
        body: data,
        headers: {
          'Content-Type': contentTypes[ext] ||  'application/octet-stream'
        }
      };
      callback(null, response);
      resolve(response);    
    });
  });
}

const searchHandler = (event, context, callback) => {
  const qs = event.queryStringParameters || {};
  const query = utils.parseQuery(qs.q);
  if (!query || query.type !== 'prefix') {
    return promise.resolve({ statusCode: 400 });
  }
  return getFilebox(event).search(query, Number(qs.from), Number(qs.size), qs.token).then(data => {
    const response = {
      statusCode: 200,
      body: data
    };
    callback(null, response);
    return promise.resolve(response);
  }).catch(resolveError(promise, callback));
}

const getHandler = (event, context, callback) => {
  const path = getPath(event, context);
  return getFilebox(event)
    .fetch(path)
    .then(data => {
      const response = data
        ? {
          statusCode: 200,
          body: data.content,
          headers: {
            'Content-Type': data.contentType,
            [constants.METADATA_HEADER_NAME]: JSON.stringify(data.metadata),
          },
          isBase64Encoded: true
        }
        : {
          statusCode: 404
        };
      callback(null, response);
      return promise.resolve(response);
    })
    .catch(resolveError(promise, callback));
}

const postHandler = (event, context, callback) => {
  const path = getPath(event, context);
  const metadata = JSON.parse(event.headers[constants.METADATA_HEADER_NAME] || null);
  const contentType = event.headers['Content-Type'] || 'application/octet-stream';
  return getFilebox(event)
    .store(path, event.body, contentType, metadata)
    .then(data => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(data)
      };
      callback(null, response);
      return promise.resolve(response);
    })
    .catch(resolveError(promise, callback));
}

const deleteHandler = (event, context, callback) => {
  const path = getPath(event, context);
  return getFilebox(event)
    .delete(path)
    .then(data => {
      const response = {
        statusCode: 204
      };
      callback(null, response);
      return promise.resolve(response);
    })
    .catch(resolveError(promise, callback));
}

// Routes

const createRoutePath = (relativePath) => {
  return (config.routePrefix || '') + relativePath;
}

const routes = [
  {
    method: 'GET',
    path: createRoutePath('/$docs*'),
    handler: docsHandler
  }, {
    method: 'GET',
    path: createRoutePath('/$search'),
    handler: searchHandler
  }, {
    method: 'GET',
    path: new RegExp(`^${createRoutePath('\/[^$]+')}`),
    handler: getHandler
  }, {
    method: 'POST',
    path: createRoutePath('/*'),
    handler: postHandler
  }, {
    method: 'DELETE',
    path: createRoutePath('/*'),
    handler: deleteHandler
  }
];

const httpRouter = require('aws-lambda-http-router').create(routes);

exports.handler = httpRouter.handler;
