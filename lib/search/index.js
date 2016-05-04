var neo4j = require('neo4j');
var _hotel = require('./hotel');
var _node = require('./node');

var database;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function hotel (label) {
  init();
  return _hotel(database, label);
}

function node (id) {
  init();
  if (!id) throw Error('An id is required to find the correct node');
  return _node(database, id);
}

module.exports.init = init;
module.exports.hotel = hotel;
module.exports.node = node;
