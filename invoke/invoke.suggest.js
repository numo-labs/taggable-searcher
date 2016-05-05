var assert = require('assert');
var index = require('../index');

var options = {
  text: 'Spa',
  size: 1,
  include: 'geo',
  context: 'dk:da'
};

index.suggest(options, function (err, data) {
  if (err) console.error(err);
  console.log(JSON.stringify(data));
  assert.equal(data.hits.hit[0].fields.name, 'Spanien');
});
