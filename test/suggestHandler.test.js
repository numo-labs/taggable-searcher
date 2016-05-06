var assert = require('assert');
var suggestHandler = require('../lib/suggest');

describe('suggestHandler', function () {
  it('computePrefixes: should return a single prefix if only one item was passed', function (done) {
    var item = ['geo'];
    var expectedResult = "(prefix field=tagid 'geo')";
    var result = suggestHandler.__computePrefixes(item, 'or');
    assert.equal(result, expectedResult);
    done();
  });
  it('computePrefixes: should return a string of prefixes if multiple items are passed', function (done) {
    var items = ['geo', 'hotel'];
    var expectedResult = "(or (prefix field=tagid 'geo')(prefix field=tagid 'hotel'))";
    var result = suggestHandler.__computePrefixes(items, 'or');
    assert.equal(result, expectedResult);
    done();
  });
  it('computeQuery: should build the cloudsearch query', function (done) {
    var expectedResult = "(and context:'dk:da' (prefix field=name 'spa'))";
    var result = suggestHandler.__computeQuery('spa', 'dk:da', 'and');
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(prefix field=tagid 'geo'))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', ['geo']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(or (prefix field=tagid 'geo')(prefix field=tagid 'hotel')))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', ['geo', 'hotel']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(not (prefix field=tagid 'geo')))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', null, ['geo']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(not (or (prefix field=tagid 'geo')(prefix field=tagid 'hotel'))))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', null, ['geo', 'hotel']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(prefix field=tagid 'geo')(not (prefix field=tagid 'hotel')))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', ['geo'], ['hotel']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(or (prefix field=tagid 'geo')(prefix field=tagid 'hotel'))(not (prefix field=tagid 'hotel')))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', ['geo', 'hotel'], ['hotel']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(prefix field=tagid 'geo')(not (or (prefix field=tagid 'hotel')(prefix field=tagid 'geo'))))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', ['geo'], ['hotel', 'geo']);
    assert.equal(result, expectedResult);

    expectedResult = "(and context:'dk:da' (prefix field=name 'spa')(or (prefix field=tagid 'geo')(prefix field=tagid 'hotel'))(not (or (prefix field=tagid 'hotel')(prefix field=tagid 'geo'))))";
    result = suggestHandler.__computeQuery('spa', 'dk:da', 'and', ['geo', 'hotel'], ['hotel', 'geo']);
    assert.equal(result, expectedResult);
    done();
  });
  it('computeSearchField: should return id search if id is provided', function (done) {
    var result = suggestHandler.__computeSearchField('this:is.qtest');
    assert.equal(result, "tagid:'%s' ");
    done();
  });
  it('computeSearchField: should return name prefix search if id is provided', function (done) {
    var result = suggestHandler.__computeSearchField('Spa');
    assert.equal(result, "(prefix field=name '%s')");
    done();
  });
});
