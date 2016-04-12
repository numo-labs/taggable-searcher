var assert = require('assert');
var index = require('../index');
var config = require('../config.json');

describe('Integration test for suggest name', function () {
  index.init(config.cloudsearch.endpoint);
  it('should return suggestions for spa', function (done) {
    index.suggestName('spa', {size: 2}, function (err, data) {
      if (err) console.log(err);
      assert.equal(data.suggest.found, 2);
      done();
    });
  });
});
