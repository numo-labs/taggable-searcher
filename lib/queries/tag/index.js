var isArray = require('lodash.isarray');
var util = require('util');
var sanitize = require('../../sanitizer');

function query (tags, options, cloudSearchDomain, callback) {
  var params = {
    query: computeQuery(isArray(tags) ? tags : [tags], options),
    queryParser: 'structured',
    start: options.start,
    size: options.size
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

function computeQuery (tags, options) {
  var phrases = computePhrase(tags).join('');
  var idPrefix = options.idPrefix ? "(prefix field=id '" + options.idPrefix + "')" : '';
  return util.format('(%s %s %s)', options.operator, phrases, idPrefix);
}

function computePhrase (tags) {
  return tags.map(function (tag) {
    if (isArray(tag)) return util.format('(or %s)', computePhrase(tag).join(''));
    else return util.format("(phrase field=%s '%s')", sanitize.idToPrefix(tag), tag);
  });
}

module.exports = query;
