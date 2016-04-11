var util = require('util');

function query (names, options, cloudSearchDomain, callback) {
  var params = {
    query: computeQuery(names.constructor === Array ? names : [names], options),
    queryParser: 'structured',
    start: options.start,
    size: options.size
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

function computeQuery (names, options) {
  var displayNames = names.map(function (name) {
    return util.format("(prefix field=displayname '%s')", name);
  });

  var idPrefix = options.idPrefix ? "(prefix field=id '" + options.idPrefix + "')" : '';
  return util.format('(and (%s %s)%s)', options.operator, displayNames.join(''), idPrefix);
}

module.exports = query;
