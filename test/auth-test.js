process.env.config = JSON.stringify(require('../config/local-testing.json'));
const config = (process.env.config)
  ? JSON.parse(process.env.config)
  : require('config');
const logger = require('../logger').create(config);
const assert = require('assert');
const auth = require('../auth').create(config, logger);

const apiHeaderName = config.acl.authCHeader;
const fullAccessMockRoleKey = 'e6ffd1e1-f423-4c2d-b82b-2473f673c2ba';
const fullAccessRoleKey = 'fca92103-e03e-4e87-b30b-999822783335';
const fullAccessRoleName = 'full-access';
const fullAccessRolePath = '/some/random/path/file.ext';
const testRoleKey = 'c75ca992-4cba-4167-9703-c09a12c6684c';
const testRoleName = 'test';
const testRolePath = '/test/path/file.ext';

describe('auth', () => {

  it('authC - success', (done) => {
    auth
      .authenticate(fullAccessRoleKey)
      .then(result => {
        assert(result.roles);
      })
      .done(done);
  });

  it('authC - failure', (done) => {
    auth
      .authenticate(fullAccessRoleKey + 'bad')
      .then(result => {
        assert.fail(result.roles);
      })
      .catch(auth.NotAuthenticated, err => {
        assert(err.message.error);
      })
      .catch(err => {
        assert.fail(`Unexpected catch: ${JSON.stringify(err)}`);
      })
      .done(done);
  });

  it('authCZ - forceMock', function (done) {
    auth
      .authenticate(fullAccessMockRoleKey)
      .then(result => {
        assert(result.roles);
        assert(result.forceMock);
      })
      .catch(auth.NotAuthorized, err => {
        assert.fail(err.message.error);
      })
      .catch(err => {
        assert.fail(`Unexpected catch: ${JSON.stringify(err)}`);
      })
      .done(done);
  });

  it('authCZ - no forceMock', function (done) {
    auth
      .authenticate(testRoleKey)
      .then(result => {
        assert(result.roles);
        assert(!result.forceMock);
      })
      .catch(auth.NotAuthorized, err => {
        assert.fail(err.message.error);
      })
      .catch(err => {
        assert.fail(`Unexpected catch: ${JSON.stringify(err)}`);
      })
      .done(done);
  });

  it('authZ - success', (done) => {
    auth
      .authorize([fullAccessRoleName], fullAccessRolePath)
      .then(result => {
        assert(result);
      })
      .catch(err => {
        assert.fail(err);
      })
      .done(done);
  });

  it('authZ - failure', (done) => {
    auth
      .authorize(['bad role name'], fullAccessRolePath)
      .then(result => {
        assert.fail(result);
      })
      .catch(auth.NotAuthorized, err => {
        assert(err.message.error);
      })
      .catch(err => {
        assert.fail(`Unexpected catch: ${JSON.stringify(err)}`);
      })
      .done(done);
  });

  it('authCZ - success', (done) => {
    auth
      .authCZ(fullAccessRoleKey, fullAccessRolePath)
      .then(result => {
        assert(!result);
      })
      .done(done);
  });

  it('authCZ - authC failure', (done) => {
    auth
      .authCZ('bad key', fullAccessRolePath)
      .then(result => {
        assert.fail(`Unexpected authCZ-authC success: ${JSON.stringify(result)}`);
      })
      .catch(auth.NotAuthenticated, err => {
        assert(err.message.error);
      })
      .catch(err => {
        assert.fail(`Unexpected catch: ${JSON.stringify(err)}`);
      })
      .done(done);
  });

  it('authCZ - authZ failure', function (done) {
    auth
      .authCZ(testRoleKey, fullAccessRolePath)
      .then(result => {
        assert.fail(`Unexpected authCZ-authZ success: ${JSON.stringify(result)}`);
      })
      .catch(auth.NotAuthorized, err => {
        assert(err.message.error);
      })
      .catch(err => {
        assert.fail(`Unexpected catch: ${JSON.stringify(err)}`);
      })
      .done(done);
  });

});
