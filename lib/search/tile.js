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
  query(computeMatches(ids).join(' UNION '), callback);
}

function query (query, callback) {
  console.log('Neo4j query:', query);
  database.cypher({query: query}, callback);
}

function computeMatches (ids) {
  return ids.map(function (id) {
    var matches = id.match(/(\w*):\w*\.\w+/);
    var prefix = matches ? matches[1] : undefined;
    if (prefix) {
      switch (prefix) {
        case 'geo':
          return computeGeoMatch(id);
        default:
          return computeGeneralMatch(id, prefix);
      }
    }
  }).filter(function (id) { if (id) return id; });
}

function computeGeoMatch (id) {
  return util.format("MATCH (:geo {id:'%s'})<-[:LOCATED_IN*..10]-()-[:INCLUDES]->(tile:tile) RETURN tile", id);
}

function computeGeneralMatch (id, type) {
  return util.format("MATCH (:%s {id:'%s'})-[:INCLUDES]->(tile:tile) RETURN tile", type, id);
}

module.exports = find;
module.exports.init = init;
module.exports.__computeMatches = computeMatches;
