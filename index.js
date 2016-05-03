var AWS = require('aws-sdk');
var optionsHandler = require('./lib/optionsHandler');
var suggestHandler = require('./lib/suggestHandler');
var searchHandler = require('./lib/neo4j');

var cloudSearchDomain;

function init (config) {
  if (config.cloudSearchDomain) {
    cloudSearchDomain = new AWS.CloudSearchDomain({endpoint: config.cloudSearchDomain});
  }
  if (config.neo4j) {
    searchHandler(config.neo4j);
  }
}

function suggest (options, callback) {
  if (!cloudSearchDomain) throw Error('Taggy was never initialized with cloudSearchDomain');
  suggestHandler(optionsHandler.cloudSearch(options), cloudSearchDomain, callback);
}

module.exports.init = init;
module.exports.suggest = suggest;
module.exports.search = searchHandler;
