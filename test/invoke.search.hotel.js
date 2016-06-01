require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: search.hotel', function () {
  it.only('should find results for amenities and tiles', function (done) {
    var params = {
      geography: [],
      amenities: ['amenity:ne.wifi', 'amenity:ne.allinclusive'],
      marketing: 'marketing:concept.casacook'
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      done();
    });
  });
  it('should find results for marketing', function (done) {
    var params = {
      marketing: 'marketing:concept.casacook'
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      done();
    });
  });
  it('should find results for geography', function (done) {
    var params = {
      geography: 'geo:geonames.2510769',
      size: 5
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      done();
    });
  });
  it('should find results for tiles', function (done) {
    var params = {
      geography: [],
      amenities: [],
      marketing: [],
      tiles: ['tile:article.dk.1255644']
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length === 0);
      done();
    });
  });
});
