'use strict';

// Dependencies

const promise = require('bluebird')
const config = process.env.config
  ? JSON.parse(process.env.config)
  : require('config');
const logger = require('./logger').create(config);
const fileboxPath = `./filebox-${config.filebox.provider}`;
const filebox = require(fileboxPath).create(config, logger);
const constants = require('./constants');

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

const getPath = (event, context) => {
  if (!context.functionName) {
    return event.path;
  }
  const len = `/${context.functionName}`.length;
  return event
    .path
    .substring(len);
}

// Handlers

const searchHandler = (event, context, callback) => {
  const qs = event.queryStringParameters || {};
  // todo: validate parameters and parse query type (e.g.
  // "q=path:/folder/to/search")
  return filebox.list(qs.q, Number(qs.from), Number(qs.size)).then(data => {
    const response = {
      statusCode: 200,
      body: data
    };
    callback(null, response);
    return promise.resolve(response);
  }).catch(resolveError(promise, callback));;
}

const fetchHandler = (event, context, callback) => {
  const path = getPath(event, context);
  return filebox
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

const getHandler = (event, context, callback) => {
  const path = getPath(event, context);
  const isSearch = path.match(constants.SEARCH_ROUTE_REGEX);
  return isSearch
    ? searchHandler(event, context, callback)
    : fetchHandler(event, context, callback);
}

const postHandler = (event, context, callback) => {
  const path = getPath(event, context);
  const metadata = JSON.parse(event.headers[constants.METADATA_HEADER_NAME] || null);
  const contentType = event.headers['Content-Type'] || 'application/octet-stream';
  return filebox
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
  return filebox
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

const routes = [
  {
    method: 'GET',
    path: '/*',
    handler: getHandler
  }, {
    method: 'POST',
    path: '/*',
    handler: postHandler
  }, {
    method: 'DELETE',
    path: '/*',
    handler: deleteHandler
  }
];

const httpRouter = require('aws-lambda-http-router').create(routes);

exports.handler = httpRouter.handler;
