var util = require('util');
var isArray = require('lodash.isarray');
var neo4j = require('neo4j');
var database;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function find (params, callback) {
  init();
  var ids = isArray(params.includedIn) ? params.includedIn : [params.includedIn];
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  query(util.format('MATCH %s RETURN tile %s', computeMatches(ids), limit), callback);
}

function query (query, callback) {
  console.log('Neo4j query:', query);
  database.cypher({query: query}, callback);
}

function computeMatches (ids) {
  return ids.map(function (id) {
    return util.format('(tile:tile)<-[:INCLUDES]-(:%s {id:"%s"})', id.match(/(\w*:\w*)/)[1], id);
  });
}

module.exports = find;
module.exports.init = init;
module.exports.__computeMatches = computeMatches;
