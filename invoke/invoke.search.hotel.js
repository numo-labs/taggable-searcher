require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var params = {
  geography: ['geo:geonames.7732185', 'geo:geonames.2514042', 'geo:geonames.2514042'],
  amenities: ['amenity:ne.wifi', 'amenity:ne.allinclusive'],
  marketing: ['marketing:concept.sunprime']
};

index.search.hotel(params, function (err, result) {
  if (err) console.error(err);
  console.log('Found ' + result.data.length + ' hotels.');
  assert(result.data.length > 0);
});

var params2 = {
  amenities: 'amenity:ne.allinclusive'
};

index.search.hotel(params2, function (err, result) {
  if (err) console.error(err);
  console.log('Found ' + result.data.length + ' hotels.');
  assert(result.data.length > 0);
});

var params3 = {
  geography: 'geo:geonames.2510769'
};

index.search.hotel(params3, function (err, result) {
  if (err) console.error(err);
  console.log('Found ' + result.data.length + ' hotels.');
  assert(result.data.length > 0);
});
