var assert = require('assert');
var index = require('../index');
var endpoint = process.env.CLOUDSEARCH_ENDPOINT;

describe('Integration test for query tag', function () {
  index.init(endpoint);
  it('should return results for an existing list of names', function (done) {
    index.searchByTags([['geo:geonames.2510769', 'geo:geonames.6697810']], { size: 10, start: 5 }, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.hit.length, 10);
      assert.equal(data.hits.start, 5);
      done();
    });
  });
  it('should return results for a single name', function (done) {
    index.searchByTags(['geo:geonames.2510769', 'geo:geonames.6697810'], { size: 10, start: 5 }, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.hit.length, 10);
      assert.equal(data.hits.start, 5);
      done();
    });
  });
  it('should get results in parallel if option is set', function (done) {
    this.timeout(10000);
    var options = {
      parallel: true,
      size: 123
    };
    index.searchByTags('geo:geonames.2510769', options, function (err, data) {
      if (err) return done(err);
      assert.equal(data.hits.hit.length, 123);
      done();
    });
  });
});
