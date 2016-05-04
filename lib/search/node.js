var util = require('util');

var database;
var query = {
  limit: 1000,
  query: '',
  id: '',
  label: ''
};

function node (neoDatabase, id) {
  database = neoDatabase;
  query.id = id;
  return {
    outgoing: outgoing,
    incoming: incoming,
    links: links,
    limit: limit,
    find: find,
    _query: query
  };
}

function outgoing (label) {
  if (label) query.label = label;
  query.query = 'MATCH (n {id:"%s"})-[relationship]->(node%s) RETURN relationship,node LIMIT %s';
  return this;
}

function incoming (label) {
  if (label) query.label = label;
  query.query = 'MATCH (n {id:"%s"})<-[relationship]-(node%s) RETURN relationship,node LIMIT %s';
  return this;
}

function links (label) {
  if (label) query.label = label;
  query.query = 'MATCH (n {id:"%s"})-[relationship]-(node%s)RETURN relationship,node LIMIT %s';
  return this;
}

function find (callback) {
  var formattedQuery = util.format(query.query, query.id, query.label, query.limit);
  console.log('Neo4j query:', formattedQuery);
  database.cypher({query: formattedQuery}, callback);
}

function limit (limit) {
  if (limit) {
    query.limit = limit;
  }
  return this;
}

module.exports = node;
