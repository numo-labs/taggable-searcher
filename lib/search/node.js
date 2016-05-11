var util = require('util');
var neo4j = require('neo4j');

var database;
var nodeId;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function node (id) {
  init();
  nodeId = id;
  return {
    outgoing: outgoing,
    incoming: incoming,
    links: links,
    find: find
  };
}

function outgoing (params, callback) {
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  var label = params.label || '';
  query(util.format('MATCH (n {id:"%s"})-[relationship]->(node%s) RETURN relationship,node %s', nodeId, label, limit), callback);
}

function incoming (params, callback) {
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  var label = params.label || '';
  query(util.format('MATCH (n {id:"%s"})<-[relationship]-(node%s) RETURN relationship,node %s', nodeId, label, limit), callback);
}

function links (params, callback) {
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  var label = params.label || '';
  query(util.format('MATCH (n {id:"%s"})-[relationship]-(node%s) RETURN relationship,node %s', nodeId, label, limit), callback);
}

function find (callback) {
  query(util.format('MATCH (node {id:"%s"}) RETURN node', nodeId), function (err, data) {
    if (err) return callback(err);
    return callback(null, data[0].node);
  });
}

function query (query, callback) {
  database.cypher({query: query}, function (err, nodes) {
    err = err || null; // if no error return null
    return callback(err, {query: query, data: nodes});
  });
}

module.exports = node;
module.exports.init = init;
