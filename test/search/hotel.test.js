var assert = require('assert');
var hotel = require('../../lib/search/hotel');

describe('search.hotel', function () {
  it('sanitizeInput: should return undefined when the input is invalid', function (done) {
    assert.equal(hotel.__sanitizeInput([]), undefined);
    done();
  });
  it('sanitizeInput: should return an array when the input is a string', function (done) {
    assert.deepEqual(hotel.__sanitizeInput('string'), ['string']);
    done();
  });
  it('sanitizeInput: should return an array when the input is an array', function (done) {
    assert.deepEqual(hotel.__sanitizeInput(['array']), ['array']);
    done();
  });
});
