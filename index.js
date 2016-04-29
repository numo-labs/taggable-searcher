var AWS = require('aws-sdk');
var optionsHandler = require('./lib/optionsHandler');
var suggestHandler = require('./lib/suggestHandler');

var cloudSearchDomain;

function init (config) {
  if (config.cloudSearchDomain) {
    cloudSearchDomain = new AWS.CloudSearchDomain({endpoint: config.cloudSearchDomain});
  }
}

function suggest (options, callback) {
  if (!cloudSearchDomain) throw Error('Taggy was never initialized with cloudSearchDomain');
  suggestHandler(optionsHandler.cloudSearch(options), cloudSearchDomain, callback);
}

module.exports.init = init;
module.exports.suggest = suggest;
