require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var params = {
  geography: [],
  amenities: ['amenity:ne.wifi', 'amenity:ne.allinclusive'],
  marketing: [],
  tiles: ['tile:article.geo.london']
};

index.search.hotel(params, function (err, result) {
  if (err) console.error(err);
  console.log('Found ' + result.data.length + ' hotels.');
  console.log(JSON.stringify(result, null, 2));
  assert(result.data.length > 0);
});

// var params2 = {
//   amenities: 'amenity:ne.allinclusive'
// };

// index.search.hotel(params2, function (err, result) {
//   if (err) console.error(err);
//   console.log('Found ' + result.data.length + ' hotels.');
//   assert(result.data.length > 0);
// });

// var params3 = {
//   geography: 'geo:geonames.2510769'
// };

// index.search.hotel(params3, function (err, result) {
//   if (err) console.error(err);
//   console.log('Found ' + result.data.length + ' hotels.');
//   assert(result.data.length > 0);
// });
