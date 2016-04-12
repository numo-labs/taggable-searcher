var assert = require('assert');
var index = require('../index');
var endpoint = process.env.CLOUDSEARCH_ENDPOINT;

describe('Integration test for query id', function () {
  index.init(endpoint);
  it('should return results for an existing list of ids', function (done) {
    index.searchById(['geo:geonames.2510769', 'geo:geonames.5377281'], { size: 1, start: 1 }, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.found, 2);
      assert.equal(data.hits.hit.length, 1);
      assert.equal(data.hits.start, 1);
      done();
    });
  });
});
