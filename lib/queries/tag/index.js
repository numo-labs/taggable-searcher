var _ = require('lodash');
var util = require('util');
var async = require('async');
var sanitize = require('../../sanitizer');

function query (tags, options, cloudSearchDomain, callback) {
  var chunkedTags = tags.constructor === Array ? _.chunk(tags, 50) : [[tags]];
  async.parallel(
    computeFunctions(chunkedTags, options, cloudSearchDomain),
    function (err, data) {
      if (err) return callback(err);

      var merged = _.reduce(data, function (result, value) {
        /**
         * We will merge all results together. We will keep the 'status' object
         * of the last result, we merge all the hits.hit arrays together and we
         * add all the 'found' integers together.
         */
        return _.mergeWith(result, value, function (o, s, key) {
          if (_.isArray(o)) return o.concat(s);
          else if (_.isInteger(o) && key === 'found') return o + s;
        });
      });

      callback(null, merged);
    }
  );
}

function computeFunctions (tags, options, cloudSearchDomain) {
  var idPrefix = options.idPrefix ? "(prefix field=id '" + options.idPrefix + "')" : '';
  return tags.map(function (tagGroup) {
    return function (callback) {
      return search(tagGroup, options, idPrefix, cloudSearchDomain, callback);
    };
  });
}

function search (tags, options, idPrefix, cloudSearchDomain, callback) {
  var params = {
    query: util.format('(and (%s %s)%s)', options.operator, computePhrases(tags).join(''), idPrefix),
    queryParser: 'structured',
    start: options.start,
    size: options.size
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

function computePhrases (tags) {
  return tags.map(function (tag) {
    if (_.isArray(tag)) return util.format('(or %s)', computePhrases(tag).join(''));
    return util.format("(phrase field=%s '%s')", sanitize.idToPrefix(tag), tag);
  });
}

module.exports = query;
