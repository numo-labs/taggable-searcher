var neo4j = require('neo4j');
var _hotel = require('./hotel');
var database;

function init (endpoint) {
  database = new neo4j.GraphDatabase(endpoint);
}

function hotel (label) {
  if (!database) throw Error('Taggy was never initialized with neo4j');
  return _hotel(database, label);
}

module.exports = init;
module.exports.hotel = hotel;
