var util = require('util');
var isArray = require('lodash.isarray');

function query (names, options, cloudSearchDomain, callback) {
  var params = {
    query: computeQuery(isArray(names) ? names : [names], options),
    queryParser: 'structured',
    start: options.start,
    size: options.size
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

function computeQuery (names, options) {
  var displayNames = names.map(function (name) {
    return util.format("(phrase field=displayname '%s')", name);
  }).join('');

  var idPrefix = options.idPrefix ? "(prefix field=id '" + options.idPrefix + "')" : '';
  return util.format('(%s %s %s)', options.operator, displayNames, idPrefix);
}

module.exports = query;
