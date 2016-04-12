var assert = require('assert');
var index = require('../index');
var endpoint = process.env.CLOUDSEARCH_ENDPOINT;

describe('Integration test for query name', function () {
  index.init(endpoint);
  it('should return results for an existing list of names', function (done) {
    index.searchByName(['spain'], null, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.found, 1);
      assert.equal(data.hits.hit.length, 1);
      assert.equal(data.hits.start, 0);
      done();
    });
  });
});
