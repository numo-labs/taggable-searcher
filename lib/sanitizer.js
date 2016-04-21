var isInteger = require('lodash.isinteger');
var isArray = require('lodash.isarray');

var DEFAULT_QUERY_OPTIONS = {
  size: 1000,
  start: 0,
  operator: 'or',
  idPrefix: '',
  parallel: false,
  parallelChunkSize: 100
};

var DEFAULT_SUGGESTION_OPTIONS = {
  size: 10,
  minLetters: 1
};

var operators = ['or', 'and'];

function queryOptions (options) {
  if (options) {
    return {
      size: isInteger(options.size) ? options.size : DEFAULT_QUERY_OPTIONS.size,
      start: isInteger(options.start) ? options.start : DEFAULT_QUERY_OPTIONS.start,
      operator: operators.indexOf(options.operator) > -1 ? options.operator : DEFAULT_QUERY_OPTIONS.operator,
      idPrefix: options.idPrefix ? computeIdPrefixQuery(options.idPrefix) : DEFAULT_QUERY_OPTIONS.idPrefix,
      parallel: options.parallel ? true : DEFAULT_QUERY_OPTIONS.parallel,
      parallelChunkSize: isInteger(options.parallelChunkSize) ? options.parallelChunkSize : DEFAULT_QUERY_OPTIONS.parallelChunkSize
    };
  } else {
    return DEFAULT_QUERY_OPTIONS;
  }
}

function computeIdPrefixQuery (idPrefix) {
  const idPrefixes = isArray(idPrefix) ? idPrefix : [idPrefix];
  const prefixes = idPrefixes.map(function (prefix) {
    return "(prefix field=id '" + prefix + "')";
  });

  return '(or ' + prefixes.join('') + ')';
}

function suggestionOptions (options) {
  if (options) {
    return {
      size: isInteger(options.size) ? options.size : DEFAULT_SUGGESTION_OPTIONS.size,
      minLetters: isInteger(options.minLetters) ? options.minLetters : DEFAULT_SUGGESTION_OPTIONS.minLetters
    };
  } else {
    return DEFAULT_SUGGESTION_OPTIONS;
  }
}

function idToPrefix (id) {
  var type = id.substring(0, id.indexOf(':'));
  var types = {
    geo: 'geotags',
    amenity: 'amenitytags',
    hotel: 'hoteltags',
    marketing: 'marketingtags'
  };
  return types[type];
}

module.exports.queryOptions = queryOptions;
module.exports.suggestionOptions = suggestionOptions;
module.exports.idToPrefix = idToPrefix;
