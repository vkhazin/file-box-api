'use strict';

// Dependencies

const promise = require('bluebird')
const config = process.env.config
  ? JSON.parse(process.env.config)
  : require('config');
const logger = require('./logger').create(config);
const fileModule = require('./file-mock').create(config, logger);
const utils = require('./utils');

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
  return event.path.substring(len);
}

// Handlers

const commandHandler = (command, path, event, context, callback) => {
  let action;
  switch (command) {
    case 'search':
      const qs = event.queryStringParameters || {};
      action = fileModule.list(path, Number(qs.from), Number(qs.size)).then(data => {
        const response = {
          statusCode: 200,
          body: data
        };
        callback(null, response);
        return promise.resolve(response);
      });
      break;
    default:
      const response = {
        statusCode: 400
      };
      callback(null, response);
      return promise.resolve(response);
  }

  return action.catch(resolveError(promise, callback));
}

const fetchHandler = (event, context, callback) => {
  const path = getPath(event, context);
  return fileModule
    .fetch(path)
    .then(data => {
      const response = { statusCode: 404 };
      if (data) {
        response.statusCode = 200;
        response.body = data.content;
        response.headers = {
          [constants.METADATA_HEADER_NAME]: JSON.stringify(data.metadata)
        };
      };
      callback(null, response);
      return promise.resolve(response);
    })
    .catch(resolveError(promise, callback));
}

const getHandler = (event, context, callback) => {
  let path = getPath(event, context);
  const match = path.match(constants.COMMAND_PATH_REGEX);
  if (match) {
    const command = match[1].toLowerCase();
    path = match[2];
    return commandHandler(command, path, event, context, callback);
  }

  return fetchHandler(event, context, callback);
}

const postHandler = (event, context, callback) => {
  const path = getPath(event, context);
  const metadata = JSON.parse(event.headers[constants.METADATA_HEADER_NAME] || null);
  return fileModule
    .store(path, event.body, metadata)
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
  return fileModule
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
