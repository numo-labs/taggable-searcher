'use strict';
const simple = require('simple-mock');
const ElasticSearch = require('elasticsearch');
const AWS = require('aws-sdk');
const assert = require('assert');
const uniq = require('lodash.uniq');
const all = require('lodash.every');

const taggy = require('../../');

describe('suggest', () => {
  const mockClient = {
    search: simple.mock()
  };
  beforeEach(() => {
    mockClient.search.actions = [];
    mockClient.search.callbackWith(null, require('./fixtures/result.json'));
    simple.mock(ElasticSearch, 'Client').returnWith(mockClient);
  });
  afterEach(() => {
    simple.restore();
  });

  describe('init', () => {
    beforeEach(() => {
      simple.mock(AWS, 'EnvironmentCredentials', () => {});
    });
    it('returns a function', () => {
      const suggest = taggy.suggest.init({ endpoint: 'test endpoint', region: 'eu-west-1' });
      assert.equal(typeof suggest, 'function');
    });
    it('initialises an elastic search client with the endpoint provided', () => {
      taggy.suggest.init({ endpoint: 'test endpoint', region: 'eu-west-1' });
      assert(ElasticSearch.Client.called);
      assert.equal(ElasticSearch.Client.lastCall.args[0].hosts, 'test endpoint');
    });
    it('sets the AWS region if provided', () => {
      taggy.suggest.init({ endpoint: 'test endpoint', region: 'eu-west-1' });
      assert(ElasticSearch.Client.called);
      assert.deepEqual(ElasticSearch.Client.lastCall.args[0].amazonES.region, 'eu-west-1');
    });
    it('uses credentials from options if provided', () => {
      taggy.suggest.init({ endpoint: 'test endpoint', region: 'eu-west-1', credentials: { accessKey: 'abc123', secretKey: 'def456' } });
      assert(ElasticSearch.Client.called);
      assert.equal(ElasticSearch.Client.lastCall.args[0].amazonES.accessKey, 'abc123');
      assert.equal(ElasticSearch.Client.lastCall.args[0].amazonES.secretKey, 'def456');
    });
    it('uses local credentials from AWS SDK if none are provided', () => {
      taggy.suggest.init({ endpoint: 'test endpoint', region: 'eu-west-1' });
      assert(ElasticSearch.Client.called);
      assert(AWS.EnvironmentCredentials.called);
      assert.equal(AWS.EnvironmentCredentials.lastCall.args[0], 'AWS');
      assert(ElasticSearch.Client.lastCall.args[0].amazonES.credentials instanceof AWS.EnvironmentCredentials);
    });
    it('throws if no endpoint is defined', () => {
      assert.throws(() => {
        taggy.suggest.init({ region: 'eu-west-1' });
      });
    });
    it('throws if no region is defined', () => {
      assert.throws(() => {
        taggy.suggest.init({ endpoint: 'endpoint' });
      });
    });
  });

  describe('suggest', () => {
    let suggest;
    beforeEach(() => {
      suggest = taggy.suggest.init({ endpoint: 'test endpoint', region: 'eu-west-1' });
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

      describe('filtering', () => {
        it('removes any results which match the type provided in `exclude` option', (done) => {
          suggest({ text: 'spa', exclude: 'hotel' }, (err, result) => {
            assert(!err);
            const types = result.data.hits.hit
              .map(o => o.fields.tagid)
              .map(id => id.split(':')[0]);
            assert(all(types, type => type !== 'hotel'));
            done();
          });
        });

        it('removes any results which do not match the type provided in `include` option', (done) => {
          suggest({ text: 'spa', include: 'marketing' }, (err, result) => {
            assert(!err);
            const types = result.data.hits.hit
              .map(o => o.fields.tagid)
              .map(id => id.split(':')[0]);
            assert(all(types, type => type === 'marketing'));
            done();
          });
        });

        it('supports an array as `include` option', (done) => {
          suggest({ text: 'spa', include: ['marketing', 'geo'] }, (err, result) => {
            assert(!err);
            const types = result.data.hits.hit
              .map(o => o.fields.tagid)
              .map(id => id.split(':')[0]);
            assert(all(types, type => (type === 'marketing' || type === 'geo')));
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
});
