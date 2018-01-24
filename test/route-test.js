const constants = require('../constants');
const assert = require('assert');

describe('route', function () {

  describe('regex', function () {

    const regex = constants.SEARCH_ROUTE_REGEX;

    it('Should match command routes', function (done) {
      const routes = ['/$search', '/$search/', '/$SEARCH', '/$SEARCH/'];
      for (let i = 0; i < routes.length; i++) {
        assert(regex.test(routes[i]), `${routes[i]} failed command route check`);
      }
      done();
    });

    it('Should match fetch routes', function (done) {
      const routes = ['/', '/test', '/test/sub', '/_foo/test'];
      for (let i = 0; i < routes.length; i++) {
        assert(!regex.test(routes[i]), `${routes[i]} failed fetch route check`);
      }
      done();
    });

  });

});
