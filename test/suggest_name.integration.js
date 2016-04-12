var assert = require('assert');
var index = require('../index');
var endpoint = process.env.CLOUDSEARCH_ENDPOINT;

describe('Integration test for suggest name', function () {
  index.init(endpoint);
  it('should return suggestions for spa', function (done) {
    index.suggestName('spa', {size: 2}, function (err, data) {
      if (err) console.log(err);
      assert.equal(data.suggest.found, 2);
      done();
    });
  });
});
