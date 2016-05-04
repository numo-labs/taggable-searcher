var assert = require('assert');
var index = require('./index');

var options = {
  text: 'Spa',
  size: 2,
  include: 'geo'
};

index.suggest(options, function (err, data) {
  console.error(err);
  console.log(data);
  assert.equal(data.hits.found, 2);
});
