var util = require('util');
var neo4j = require('neo4j');
var deprecate = require('depd')('taggable-searcher:search:node');

var database;
var nodeId;

function init (endpoint) {
  /* istanbul ignore next */
  if (!endpoint) { deprecate('Implicit configuration of NEO4J_ENDPOINT via environment variables is deprecated. You should pass the endpoint as an argument to init()'); }
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function node (id) {
  init();
  nodeId = Array.isArray(id) ? id : [id];
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
  var linkType = params.linkType || '';
  var maxDepth = params.maxDepth ? '*..' + params.maxDepth : '';
  var q = nodeId.map(function (id) {
    return util.format('MATCH (n {id:"%s"})-[relationship%s%s]->(node%s) RETURN relationship,node %s', id, linkType, maxDepth, label, limit);
  }).join(' UNION ');
  query(q, callback);
}

function incoming (params, callback) {
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  var label = params.label || '';
  var linkType = params.linkType || '';
  var maxDepth = params.maxDepth ? '*..' + params.maxDepth : '';
  var q = nodeId.map(function (id) {
    return util.format('MATCH (n {id:"%s"})<-[relationship%s%s]-(node%s) RETURN relationship,node %s', id, linkType, maxDepth, label, limit);
  }).join(' UNION ');
  query(q, callback);
}

function links (params, callback) {
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  var label = params.label || '';
  var linkType = params.linkType || '';
  var maxDepth = params.maxDepth ? '*..' + params.maxDepth : '';
  var q = nodeId.map(function (id) {
    return util.format('MATCH (n {id:"%s"})-[relationship%s%s]-(node%s) RETURN relationship,node %s', nodeId, linkType, maxDepth, label, limit);
  }).join(' UNION ');
  query(q, callback);
}

function find (callback) {
  query(util.format('MATCH (node {id:"%s"}) RETURN node', nodeId), function (err, data) {
    err = err || null; // if no error return null.
    return callback(err, data);
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
