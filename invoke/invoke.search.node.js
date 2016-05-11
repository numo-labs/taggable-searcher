require('env2')('.env');
var assert = require('assert');
var index = require('../index');

// Find the incoming nodes for a specific node
var params = {
  linkType: ':FILTERS',
  maxDept: 5,
  limit: 2
};

index.search.node(['tile:article.geo.spain', 'tile:article.geo.london']).outgoing(params, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.length, 2);
});

// // Find the outgoing nodes for a specific node
// var params2 = {
//   label: ':amenity',
//   limit: 2
// };

// index.search.node('hotel:ne.wvid.6530').outgoing(params2, function (err, data) {
//   if (err) console.error(err);
//   console.log(JSON.stringify(data, null, 2));
//   assert.equal(data.length, 2);
// });

// // Find the in and outgoing nodes for a specific node
// var params3 = {
//   limit: 2
// };

// index.search.node('hotel:ne.wvid.6530').links(params3, function (err, data) {
//   if (err) console.error(err);
//   console.log(JSON.stringify(data, null, 2));
//   assert.equal(data.length, 2);
// });

// // Find a specific node
// index.search.node('hotel:ne.wvid.6530').find(function (err, data) {
//   if (err) console.error(err);
//   console.log(JSON.stringify(data, null, 2));
//   assert.equal(data.properties.id, 'hotel:ne.wvid.6530');
// });
