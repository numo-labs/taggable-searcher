var assert = require('assert');
var index = require('./index');

// Search for the parents of a specific node
index.search
  .node('amenity:ne.outdoorpool')
    .incoming(':hotel')
    .limit(2)
    .find(function (_, data) {
      console.log(JSON.stringify(data, null, 2));
      assert.equal(data.length, 2);
    });

// Search for the children of a specific node
index.search
  .node('hotel:ne.wvid.6530')
    .outgoing(':amenity')
    .limit(2)
    .find(function (_, data) {
      console.log(JSON.stringify(data, null, 2));
      assert.equal(data.length, 2);
    });

// Search for in and out relations of a specific node
index.search
  .node('hotel:ne.wvid.6530')
    .links()
    .limit(2)
    .find(function (_, data) {
      console.log(JSON.stringify(data, null, 2));
      assert.equal(data.length, 2);
    });

// Search for hotels with certain amenities
index.search
  .hotel()
    .has('amenity:ne.outdoorpool')
    .limit(2)
    .find(function (_, data) {
      console.log(JSON.stringify(data, null, 2));
      assert.equal(data.length, 2);
    });
