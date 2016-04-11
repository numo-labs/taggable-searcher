var chunk = require('lodash.chunk');
var mergeWith = require('lodash.mergewith');
var util = require('util');
var async = require('async');
var sanitize = require('../../sanitizer');

function query (tags, options, cloudSearchDomain, callback) {
  var chunkedTags = tags.constructor === Array ? chunk(tags, 50) : [[tags]];
  async.parallel(
    computeFunctions(chunkedTags, options, cloudSearchDomain),
    function (err, data) {
      if (err) return callback(err);
      console.log('data', data);
      var returnData;
      data.forEach(function (result) {
        if (!returnData) returnData = result;
        else {
          returnData = mergeWith(returnData, result, integerMerger);
        }
      });
      callback(null, returnData);
    }
  );
}

function integerMerger (o, s) {
  console.log('merger', o);
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
  var tagPhrases = tags.map(function (tag) {
    return util.format("(phrase field=%s '%s')", sanitize.idToPrefix(tag), tag);
  });

  var params = {
    query: util.format('(and (%s %s)%s)', options.operator, tagPhrases.join(''), idPrefix),
    queryParser: 'structured',
    start: options.start,
    size: options.size
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

module.exports = query;
