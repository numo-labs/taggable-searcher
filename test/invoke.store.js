var assert = require('assert');
var index = require('../index');

describe('Integration: store', function () {
  it('should fetch a document from s3 based on item id', function (done) {
    index.store.get('geo:geonames.10062607', function (_, data) {
      var document = JSON.parse(data);
      assert.equal(document._id, 'geo:geonames.10062607');
      done();
    });
  });
});
