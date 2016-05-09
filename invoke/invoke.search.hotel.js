require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var params = {
  has: 'amenity:ne.allinclusive',
  locatedIn: 'geo:geonames.4930956',
  limit: 1
};

index.search.hotel(params, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.length, 1);
});

var params2 = {
  has: 'amenity:ne.allinclusive',
  limit: 5
};

index.search.hotel(params2, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.length, 5);
});

var params3 = {
  locatedIn: 'geo:geonames.2510769',
  limit: 2
};

index.search.hotel(params3, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.length, 2);
});
