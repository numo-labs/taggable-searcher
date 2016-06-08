require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: search.node', function () {
  it('should find the incoming nodes for a tiles', function (done) {
    var params = {
      maxDepth: 1,
      limit: 2
    };

    index.search.node(['tile:article.geo.spain']).incoming(params, function (err, result) {
      if (err) done(err);
      assert.equal(result.data.length, 2);
      done();
    });
  });
  it('should find the outgoing nodes for a hotel', function (done) {
    var params = {
      label: ':amenity',
      limit: 2
    };

    index.search.node('hotel:ne.wvid.10036').outgoing(params, function (err, result) {
      if (err) done(err);
      assert.equal(result.data.length, 2);
      done();
    });
  });
  it('should find the outgoing and incoming nodes of a specific node', function (done) {
    var params = {
      limit: 2
    };

    index.search.node('hotel:ne.wvid.10036').links(params, function (err, result) {
      if (err) done(err);
      assert.equal(result.data.length, 2);
      done();
    });
  });
  it('should find a specific node', function (done) {
    index.search.node('hotel:ne.wvid.10036').find(function (err, result) {
      if (err) done(err);
      assert.equal(result.data[0].node.properties.id, 'hotel:ne.wvid.10036');
      done();
    });
  });
});
