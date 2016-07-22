require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: search.tile', function () {
  it('should find tiles based on the includedIn param', function (done) {
    var params = {
      includedIn: ['tile:article.dk.19'],
      fastQuery: true,
      limit: 2
    };

    index.search.tile(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      done();
    });
  });
  it('should find results for Lollo & Bernie', function (done) {
    this.timeout(4000);
    var params = {
      includedIn: ['tile:article.dk.19'],
      fastQuery: true
    };

    index.search.tile(params, function (err, result) {
      if (err) return done(err);
      assert(result.data.length > 0);
      done();
    });
  });
});
