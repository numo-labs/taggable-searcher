const simple = require('simple-mock');
const ElasticSearch = require('elasticsearch');
const assert = require('assert');
const uniq = require('lodash.uniq');

const suggest = require('../../').suggest;

describe('suggest', () => {
  const mockClient = {
    search: simple.mock()
  };
  beforeEach(() => {
    mockClient.search.callbackWith(null, require('./fixtures/result.json'));
    simple.mock(ElasticSearch, 'Client').returnWith(mockClient);
  });
  afterEach(() => {
    simple.restore();
  });

  it('calls to elasticsearch search method', (done) => {
    suggest({ text: 'spa' }, () => {
      assert.equal(mockClient.search.callCount, 1);
      assert.equal(mockClient.search.lastCall.args[0].index, 'taggy');
      assert.equal(mockClient.search.lastCall.args[0].type, 'taggy');
      done();
    });
  });

  describe('query', () => {
    it('passes start and size options to elasticsearch query', (done) => {
      suggest({ text: 'spa', start: 100, size: 10 }, () => {
        assert.equal(mockClient.search.lastCall.args[0].from, 100);
        assert.equal(mockClient.search.lastCall.args[0].size, 10);
        done();
      });
    });

    it('does a prefix match on the name property for simple string searches', (done) => {
      suggest({ text: 'spa' }, () => {
        const query = mockClient.search.lastCall.args[0].body.query.filtered.query.bool;
        assert.deepEqual(query.must[0], { match_phrase_prefix: { name: 'spa' } });
        done();
      });
    });
    it('does a prefix match on the tagid property if the serch string looks like a tag', (done) => {
      suggest({ text: 'abc:def.ghi' }, () => {
        const query = mockClient.search.lastCall.args[0].body.query.filtered.query.bool;
        assert.deepEqual(query.must[0], { match_phrase_prefix: { tagid: 'abc:def.ghi' } });
        done();
      });
    });
    it('adds a context match to query if a context option is provided', (done) => {
      suggest({ text: 'spa', context: 'dk:da' }, () => {
        const query = mockClient.search.lastCall.args[0].body.query.filtered.query.bool;
        assert.deepEqual(query.must[1], { match: { context: 'dk:da' } });
        done();
      });
    });
    it('adds a `must_not` clause to query if exclude option is passed', (done) => {
      suggest({ text: 'abc:def.ghi', exclude: 'hotel' }, () => {
        const query = mockClient.search.lastCall.args[0].body.query.filtered.query.bool;
        assert.deepEqual(query.must_not[0], { prefix: { tagid: 'hotel' } });
        done();
      });
    });
    it('adds a `should` sub-clause to `must` query if include option is passed', (done) => {
      suggest({ text: 'abc:def.ghi', include: ['hotel', 'marketing'] }, () => {
        const query = mockClient.search.lastCall.args[0].body.query.filtered.query.bool;
        assert.deepEqual(query.must[1].bool.should, [{ prefix: { tagid: 'hotel' } }, { prefix: { tagid: 'marketing' } }]);
        done();
      });
    });
  });

  describe('results', () => {
    describe('uniqueness', () => {
      it('returns each tagid only once', (done) => {
        suggest({ text: 'spa' }, (err, result) => {
          assert(!err);
          const ids = result.data.hits.hit.map(o => o.fields.tagid);
          assert.equal(ids.length, uniq(ids).length);
          done();
        });
      });
    });
    describe('count', () => {
      it('includes the total number of results, before pagination', (done) => {
        mockClient.search.actions = [];
        mockClient.search.callbackWith(null, require('./fixtures/paginated-result.json'));
        suggest({ text: 'spa', size: 10 }, (err, result) => {
          assert(!err);
          assert.equal(result.data.hits.found, 80);
          done();
        });
      });
    });
  });

  describe('error handling', () => {
    it('calls callback with error if elasticsearch fails', (done) => {
      mockClient.search.actions = [];
      mockClient.search.callbackWith(new Error('elasticsearch error'));
      suggest({ text: 'spa' }, (err) => {
        assert(err);
        assert.equal(err.message, 'elasticsearch error');
        done();
      });
    });
  });
});
