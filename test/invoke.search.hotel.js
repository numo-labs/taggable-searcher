require('env2')('.env');
var assert = require('assert');
var index = require('../index');

describe('Integration: search.hotel', function () {
  it('should find results for amenities and tiles', function (done) {
    var params = {
      geography: ['geo:geonames.259511'],
      amenities: ['amenity:ne.wifi', 'amenity:ne.allinclusive']
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
      geography: 'geo:geonames.259511',
      size: 5
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      done();
    });
  });
  it('should find results for tiles', function (done) {
    this.timeout(4000);
    var params = {
      geography: [],
      amenities: ['amenity:ne.wifi', 'amenity:ne.allinclusive'],
      marketing: [],
      tiles: ['tile:article.geo.spain']
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      done();
    });
  });
  it('should find results for all the params filled in', function (done) {
    this.timeout(4000);
    var params = {
      geography: [],
      amenities: ['amenity:ne.wifi', 'amenity:ne.bar'],
      marketing: [],
      tiles: ['tile:article.dk.SJBO6CKG']
    };

    index.search.hotel(params, function (err, result) {
      if (err) done(err);
      assert(result.data.length > 0);
      console.log('result', result);
      done();
    });
  });
});
