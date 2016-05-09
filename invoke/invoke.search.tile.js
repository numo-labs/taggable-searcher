var assert = require('assert');
var index = require('../index');

var params = {
  includedIn: 'geo:geonames.361291',
  limit: 2
};

index.search.tile(params, function (err, data) {
  if (err) console.error(err);
  assert.equal(data.length, 2);
});
