var assert = require('assert');
var index = require('../index');

var options = {
  size: 1,
  exclude: 'geo'
};

index.suggest(options, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data));
  assert.equal(data.hits.hit.length, 1);
});
