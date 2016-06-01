require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: suggest.id', function () {
  it('should return a list of suggestions', function (done) {
    var options = {
      text: 'geo:geonames.',
      size: 2,
      context: 'taggy'
    };

    index.suggest(options, function (err, result) {
      if (err) console.error(err);
      assert.equal(result.data.hits.hit.length, 2);
      done();
    });
  });
});
