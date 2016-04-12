var assert = require('assert');
var index = require('../index');
var endpoint = process.env.CLOUDSEARCH_ENDPOINT;

describe('Integration test for suggest id', function () {
  index.init(endpoint);
  it('should return suggestions for hotel:mhid', function (done) {
    index.suggestId('hotel:mhid', {size: 2}, function (err, data) {
      if (err) console.log(err);
      assert.equal(data.suggest.found, 2);
      done();
    });
  });
});
