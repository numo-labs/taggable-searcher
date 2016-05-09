require('env2')('.env');
var assert = require('assert');
var index = require('../index');

var options = {
  text: 'New',
  size: 2,
  include: ['geo'],
  context: 'dk:da'
};

index.suggest(options, function (err, data) {
  if (err) return console.error(err);
  console.log(JSON.stringify(data, null, 2));
  assert.equal(data.hits.hit.length, 2);
});
