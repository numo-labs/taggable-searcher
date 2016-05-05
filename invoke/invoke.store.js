var assert = require('assert');
var index = require('../index');

// Should be able to retrieve a document
index.store.get('geo:geonames.10062607', function (_, data) {
  var document = JSON.parse(data);
  console.log(document);
  assert.equal(document._id, 'geo:geonames.10062607');
});

// Should be able to update a document
// var document = {
//   displayName: 'Bar | Bar',
//   location: {
//     lat: 0,
//     lon: 0
//   },
//   _id: 'amenity:ne.bar',
//   active: true
// };
//
// index.store.update('amenity:ne.bar', document, function (_, data) {
//   assert.equal(data.key, 'ci/amenity/ne/amenity:ne.bar.json');
// });
