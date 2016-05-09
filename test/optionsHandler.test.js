var assert = require('assert');
var optionsHandler = require('../lib/suggest/optionsHandler');

describe('optionsHandler', function () {
  it('should return the same object if everything was valid', function (done) {
    var options = {
      text: 'Spa',
      context: 'dk:da',
      start: 15,
      size: 125,
      operator: 'or',
      include: 'hotel',
      exclude: 'geo'
    };

    var expectedResult = {
      text: 'Spa',
      context: 'dk:da',
      start: 15,
      size: 125,
      operator: 'or',
      include: ['hotel']
    };

    var result = optionsHandler(options);
    assert.deepEqual(result, expectedResult);
    done();
  });
  it('should return the default size when the incoming size was not an integer', function (done) {
    var options = {
      text: 'Spa',
      size: 'I am not an int'
    };

    var expectedResult = {
      text: 'Spa',
      operator: 'and',
      size: 10,
      start: 0
    };

    var result = optionsHandler(options);
    assert.deepEqual(expectedResult, result);
    done();
  });
  it('should return the default start when the incoming start was not an integer', function (done) {
    var options = {
      text: 'Spa',
      start: 'I am not an int'
    };

    var expectedResult = {
      text: 'Spa',
      operator: 'and',
      size: 10,
      start: 0
    };

    var result = optionsHandler(options);
    assert.deepEqual(expectedResult, result);
    done();
  });
  it('should return the default and operator when the incoming start was not a valid operator', function (done) {
    var options = {
      text: 'Spa',
      operator: 'I am not a valid operator'
    };

    var expectedResult = {
      text: 'Spa',
      operator: 'and',
      size: 10,
      start: 0
    };

    var result = optionsHandler(options);
    assert.deepEqual(expectedResult, result);
    done();
  });
  it('should return an include array if the input was a single item', function (done) {
    var options = {
      text: 'Spa',
      include: 'single item'
    };

    var expectedResult = {
      text: 'Spa',
      operator: 'and',
      size: 10,
      start: 0,
      include: ['single item']
    };

    var result = optionsHandler(options);
    assert.deepEqual(expectedResult, result);
    done();
  });
  it('should return an exclude array if the input was a single item', function (done) {
    var options = {
      text: 'Spa',
      exclude: 'single item'
    };

    var expectedResult = {
      text: 'Spa',
      operator: 'and',
      size: 10,
      start: 0,
      exclude: ['single item']
    };

    var result = optionsHandler(options);
    assert.deepEqual(expectedResult, result);
    done();
  });
  it('should throw an error when no text is provided', function (done) {
    try {
      optionsHandler({});
    } catch (e) {
      assert.deepEqual(e, Error('Option text needs to be provided'));
      done();
    }
  });
});
