var AWS = require('aws-sdk');
var sanitize = require('./lib/sanitizer');
var queries = require('./lib/queries');
var suggestions = require('./lib/suggestions');
var cloudSearchDomain;

var operator = {
  'AND': 'and',
  'OR': 'or'
};

function init (endpoint) {
  cloudSearchDomain = new AWS.CloudSearchDomain({endpoint: endpoint});
}

function checkInit () {
  if (!cloudSearchDomain) throw new Error('Taggable Searcher was not initialised');
}

function searchById (ids, options, callback) {
  checkInit();
  return queries.queryId(ids, sanitize.queryOptions(options), cloudSearchDomain, callback);
}

function searchByName (names, options, callback) {
  checkInit();
  return queries.queryName(names, sanitize.queryOptions(options), cloudSearchDomain, callback);
}

function searchByTags (tags, options, callback) {
  checkInit();
  return queries.queryTag(tags, sanitize.queryOptions(options), cloudSearchDomain, callback);
}

function searchByDoc (words, options, callback) {
  checkInit();
  return queries.queryDoc(words, sanitize.queryOptions(options), cloudSearchDomain, callback);
}

function suggestId (text, options, callback) {
  checkInit();
  var sanitizedOptions = sanitize.suggestionOptions(options);
  if (text && text.length >= sanitizedOptions.minLetters) {
    return suggestions.suggestId(text, sanitizedOptions, cloudSearchDomain, callback);
  }
  return callback(null, []);
}

function suggestName (text, options, callback) {
  checkInit();
  var sanitizedOptions = sanitize.suggestionOptions(options);
  if (text && text.length >= sanitizedOptions.minLetters) {
    return suggestions.suggestName(text, sanitizedOptions, cloudSearchDomain, callback);
  }
  return callback(null, []);
}

module.exports.init = init;
module.exports.searchById = searchById;
module.exports.searchByName = searchByName;
module.exports.searchByTags = searchByTags;
module.exports.searchByDoc = searchByDoc;
module.exports.suggestId = suggestId;
module.exports.suggestName = suggestName;
module.exports.operator = operator;
