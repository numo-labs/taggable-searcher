var assert = require('assert');
var index = require('../index');
var config = require('../config.json');

describe('Integration test for multiple queries', function () {
  index.init(config.cloudsearch.endpoint);
  it('should return results for an existing list of names', function (done) {
    index.searchByName(['spain', 'greece'], null, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.found, 1);
      assert.equal(data.hits.hit.length, 1);
      assert.equal(data.hits.start, 0);
      index.searchByTags(data.hits.hit[0].id, {size: 10, start: 3, idPrefix: 'hotel:NE'}, function (err, data) {
        if (err) return done(err);
        assert.equal(data.hits.hit.length, 10);
        assert.equal(data.hits.start, 3);
        done();
      });
    });
  });
});
