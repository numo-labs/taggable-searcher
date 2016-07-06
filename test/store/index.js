const simple = require('simple-mock');
const AWS = require('aws-sdk');
const assert = require('assert');
const store = require('../../').store;

describe('store', () => {
  const mockResult = { Body: { toString: simple.mock().returnWith('test-string') } };
  beforeEach(() => {
    mockResult.Body.toString.reset();
    simple.mock(AWS.S3.prototype, 'getObject').callbackWith(null, mockResult);
    store.init('numo-taggy', 'ci');
  });
  afterEach(() => {
    simple.restore();
  });
  it('calls through to S3.getObject', (done) => {
    store.get('geo:geonames.10062607', () => {
      assert.equal(AWS.S3.prototype.getObject.callCount, 1);
      done();
    });
  });
  it('loads from "numo-taggy" bucket', (done) => {
    store.get('geo:geonames.10062607', () => {
      const params = AWS.S3.prototype.getObject.lastCall.args[0];
      assert.equal(params.Bucket, 'numo-taggy');
      done();
    });
  });
  it('calls callback with `toString` from result Body', (done) => {
    store.get('geo:geonames.10062607', (err, result) => {
      assert(!err);
      assert.equal(mockResult.Body.toString.callCount, 1);
      assert.equal(result, 'test-string');
      done();
    });
  });
  it('calls callback with error if S3.getObject fails', (done) => {
    AWS.S3.prototype.getObject.actions = [];
    AWS.S3.prototype.getObject.callbackWith(new Error('test error'));
    store.get('geo:geonames.10062607', (err, result) => {
      assert(err);
      assert.equal(err.message, 'test error');
      done();
    });
  });
  describe('object key generation', () => {
    it('geo:geonames.10062607', (done) => {
      store.get('geo:geonames.10062607', () => {
        const params = AWS.S3.prototype.getObject.lastCall.args[0];
        assert.equal(params.Key, 'ci/geo/geonames/geo:geonames.10062607.json');
        done();
      });
    });
    it('marketing:term.spa', (done) => {
      store.get('marketing:term.spa', () => {
        const params = AWS.S3.prototype.getObject.lastCall.args[0];
        assert.equal(params.Key, 'ci/marketing/term/marketing:term.spa.json');
        done();
      });
    });
    it('amenity:ne.wifi', (done) => {
      store.get('amenity:ne.wifi', () => {
        const params = AWS.S3.prototype.getObject.lastCall.args[0];
        assert.equal(params.Key, 'ci/amenity/ne/amenity:ne.wifi.json');
        done();
      });
    });
  });
  describe('init', () => {
    it('sets the environment if passed as a parameter', (done) => {
      store.init(null, 'prod');
      store.get('geo:geonames.10062607', () => {
        const params = AWS.S3.prototype.getObject.lastCall.args[0];
        assert.equal(params.Key, 'prod/geo/geonames/geo:geonames.10062607.json');
        done();
      });
    });
    it('sets the bucket if passed as a parameter', (done) => {
      store.init('test-bucket');
      store.get('geo:geonames.10062607', () => {
        const params = AWS.S3.prototype.getObject.lastCall.args[0];
        assert.equal(params.Bucket, 'test-bucket');
        done();
      });
    });
  });
});
