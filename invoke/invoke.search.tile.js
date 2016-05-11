require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var params = {
  includedIn: ['geo:geonames.390903'],
  limit: 2
};

index.search.tile(params, function (err, result) {
  if (err) console.error(err);
  console.log('Found ' + result.data.length + ' tiles.');
  console.log(JSON.stringify(result, null, 2));
  assert(result.data.length > 1);
});
