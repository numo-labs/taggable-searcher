require('env2')('.env');
const assert = require('assert');
const uniq = require('lodash.uniqby');
const index = require('../index');

describe('Integration: suggest', function () {
  it('should return a list of suggestions based on test', function (done) {
    const options = {
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
  it('should return a unique list of suggestions', function (done) {
    const options = {
      text: 'spa',
      size: 100,
      exclude: 'hotel',
      context: 'dk:da'
    };

    index.suggest(options, function (err, result) {
      if (err) done(err);
      assert.equal(uniq(result.data.hits.hit, o => o.fields.tagid).length, result.data.hits.hit.length);
      assert.equal(result.data.hits.found, result.data.hits.hit.length);
      done();
    });
  });
});
