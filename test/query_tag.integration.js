var assert = require('assert');
var index = require('../index');
var config = require('../config.json');

describe('Integration test for query tag', function () {
  index.init(config.cloudsearch.endpoint);
  it('should return results for an existing list of names', function (done) {
    index.searchByTags([['geo:geonames.2510769', 'geo:geonames.6697810']], { size: 10, start: 5 }, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.hit.length, 10);
      assert.equal(data.hits.start, 5);
      done();
    });
  });
});
