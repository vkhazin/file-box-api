const promise = require('bluebird');

exports.create = function (config, logger) {

  function NotAuthenticated(message) {
    this.message = message;
    this.name = 'NotAuthenticated';
    Error.captureStackTrace(this, NotAuthenticated);
  }

  NotAuthenticated.prototype = Object.create(Error.prototype);
  NotAuthenticated.prototype.constructor = NotAuthenticated;

  function NotAuthorized(message) {
    this.message = message;
    this.name = 'NotAuthorized';
    Error.captureStackTrace(this, NotAuthorized);
  }

  NotAuthorized.prototype = Object.create(Error.prototype);
  NotAuthorized.prototype.constructor = NotAuthorized;

  const authenticate = (apiKey) => {
    const filteredKeys = config.acl.apiKeys.filter(x => x.apiKey === apiKey);
    if (filteredKeys.length == 0) {
      return promise.reject(new NotAuthenticated({error: 'ApiKey invalid or is missing'}));
    }
    const forceMock = filteredKeys.length == filteredKeys.filter(x => x.forceMock).length;
    const roles = filteredKeys
      .map(x => x.roles)
      .reduce((left, right) => left.concat(right), [])
      .filter(x => x != undefined);
    return promise.resolve({ roles: roles, forceMock: forceMock});
  };

  const authorize = (roles, path) => {
    const filteredRoles = config.acl.roles.filter(x => roles.indexOf(x.role) > -1);
    const groupPaths = filteredRoles
      .map(x => x.paths)
      .reduce((left, right) => left.concat(right), [])
      .filter(x => x != undefined);
    if (groupPaths.filter(x => path.match(new RegExp(x, 'ig'))).length == 0) {
      return promise.reject(new NotAuthorized({
        error: 'ApiKey is not authorized for path: ' + path
      }));
    }
    return promise.resolve(true);
  };

  return (function () {
    return {
      authCZ: (apiKey, path) => {
        return authenticate(apiKey).then(result => {
          return authorize(result.roles, path).then(success => {
            return result.forceMock;
          });
        });
      },
      authenticate: authenticate,
      authorize: authorize,
      NotAuthenticated: NotAuthenticated,
      NotAuthorized: NotAuthorized
    };
  }());
};
