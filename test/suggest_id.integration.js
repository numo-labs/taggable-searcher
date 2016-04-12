var assert = require('assert');
var index = require('../index');
var config = require('../config.json');

describe('Integration test for suggest id', function () {
  index.init(config.cloudsearch.endpoint);
  it('should return suggestions for hotel:mhid', function (done) {
    index.suggestId('hotel:mhid', {size: 2}, function (err, data) {
      if (err) console.log(err);
      assert.equal(data.suggest.found, 2);
      done();
    });
  });
});
