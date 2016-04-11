var AWS = require('aws-sdk');
var sanitize = require('./lib/sanitizer');
var queries = require('./lib/queries');
var cloudSearchDomain;

function init (endpoint) {
  cloudSearchDomain = new AWS.CloudSearchDomain({endpoint: endpoint});
}

function checkInit () {
  if (!cloudSearchDomain) throw new Error('Taggable Searcher was not initialised');
}

function searchById (ids, options, callback) {
  checkInit();
  return queries.queryId(ids, sanitize.options(options), cloudSearchDomain, callback);
}

function searchByName (names, options, callback) {
  checkInit();
  return queries.queryName(names, sanitize.options(options), cloudSearchDomain, callback);
}

function searchByTags (tags, options, callback) {
  checkInit();
  return queries.queryTag(tags, sanitize.options(options), cloudSearchDomain, callback);
}

module.exports.init = init;
module.exports.searchById = searchById;
module.exports.searchByName = searchByName;
module.exports.searchByTags = searchByTags;
