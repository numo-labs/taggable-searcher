require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var params = {
  includedIn: ['geo:geonames.390903'],
  limit: 2
};

index.search.tile(params, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.length, 2);
});
