require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: search.tile', function () {
  it('should find tiles based on the includedIn param', function (done) {
    var params = {
      includedIn: ['geo:geonames.8199138'],
      fastQuery: true,
      limit: 2
    };

    index.search.tile(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length === 2);
      done();
    });
  });
});
