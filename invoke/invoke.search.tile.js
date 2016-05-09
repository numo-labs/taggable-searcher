var assert = require('assert');
var index = require('../index');

var params = {
  includedIn: ['marketing:concept.casacook', 'geo:geonames.390903', 'amenity:test.1245'],
  limit: 2
};

index.search.tile(params, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.length, 1);
});
