require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: suggest', function () {
  it('should return a list of suggestions based on test', function (done) {
    var options = {
      text: 'Spa',
      size: 2,
      include: ['geo'],
      context: 'dk:da'
    };

    index.suggest(options, function (err, result) {
      if (err) done(err);
      assert.equal(result.data.hits.hit.length, 2);
      done();
    });
  });
});
