var assert = require('assert');
var index = require('../index');
var endpoint = process.env.CLOUDSEARCH_ENDPOINT;

describe('Integration test for query id', function () {
  index.init(endpoint);
  it('should return results for an existing list of ids', function (done) {
    index.searchByDoc(['"_id":"geo:geonames.2267057"'], { size: 2, start: 5, operator: index.operator.OR }, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.hit.length, 2);
      assert.equal(data.hits.start, 5);
      done();
    });
  });
});
