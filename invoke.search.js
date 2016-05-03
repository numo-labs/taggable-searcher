var assert = require('assert');
var index = require('./index');

var config = {
  neo4j: process.env.NEO4J_ENDPOINT
};

index.init(config);

index.search.hotel(':hotel:ne')
    .has('amenity:ne.lolloandbernie')
    .locatedIn(['geo:geonames.146615'])
    .limit(2)
    .find(function (_, data) {
      console.log(JSON.stringify(data, null, 2));
      assert.equal(data.length, 2);
    });
