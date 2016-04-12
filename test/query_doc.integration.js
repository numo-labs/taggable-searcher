var assert = require('assert');
var index = require('../index');
var config = require('../config.json');

describe('Integration test for query id', function () {
  index.init(config.cloudsearch.endpoint);
  it('should return results for an existing list of ids', function (done) {
    index.searchByDoc(['"_id":"geo:geonames.2267057"'], { size: 2, start: 5, operator: index.operator.OR }, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.hit.length, 2);
      assert.equal(data.hits.start, 5);
      done();
    });
  });
});
