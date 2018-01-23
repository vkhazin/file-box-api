const constants = require('../constants');
const assert = require('assert');

describe('route', function () {

  describe('regex', function () {

    it('Should match command routes', function (done) {
      const routes = ['/$search/', '/$search/test', '/$search/test/sub', '/$foo/test'];
      for (let i = 0; i < routes.length; i++) {
        assert(constants.COMMAND_PATH_REGEX.test(routes[i]), `${routes[i]} failed command route check`);
      }
      done();
    });

    it('Should match fetch routes', function (done) {
      const routes = ['/', '/test', '/test/sub', '/_foo/test'];
      for (let i = 0; i < routes.length; i++) {
        assert(!constants.COMMAND_PATH_REGEX.test(routes[i]), `${routes[i]} failed fetch route check`);
      }
      done();
    });

  });

});
