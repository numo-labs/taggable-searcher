require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var options = {
  text: 'geo:geonames.',
  size: 2,
  context: 'taggy'
};

index.suggest(options, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.hits.hit.length, 2);
});
