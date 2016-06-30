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
  query(computeMatches(ids, params.limit, params.fastQuery)
    .concat('MATCH (tile:tile {active: true}) return tile')
    .join(' UNION '), callback);
}

function query (query, callback) {
  database.cypher({query: query}, function (err, nodes) {
    err = err || null; // if no error return null.
    return callback(err, {query: query, data: nodes});
  });
}

function computeMatches (ids, limit, fastQuery) {
  var limitQuery = limit ? 'LIMIT ' + limit : '';
  return ids.map(function (id) {
    var matches = id.match(/(\w*):\w*\.\w+/);
    var prefix = matches ? matches[1] : undefined;
    if (prefix) {
      switch (prefix) {
        case 'geo':
          return computeGeoMatch(id, limitQuery, fastQuery);
        default:
          return computeGeneralMatch(id, prefix, limitQuery, fastQuery);
      }
    }
  }).filter(function (id) { if (id) return id; });
}

function computeGeoMatch (id, limit, fastQuery) {
  if (fastQuery) {
    return util.format("MATCH (:geo {id:'%s'})-[:LOCATED_IN*..10]->()-[:INCLUDES]->(tile:tile) RETURN tile %s UNION MATCH (:geo {id:'%s'})-[:INCLUDES]->(tile:tile) RETURN tile %s", id, limit, id, limit);
  } else {
    return util.format("MATCH path = (:geo {id:'%s'})-[:LOCATED_IN*..10]->()-[:INCLUDES]->(tile:tile) RETURN tile,nodes(path) as nodes,relationships(path) as relationships %s UNION MATCH path = (:geo {id:'%s'})-[:INCLUDES]->(tile:tile) RETURN tile,nodes(path) as nodes,relationships(path) as relationships %s", id, limit, id, limit);
  }
}

function computeGeneralMatch (id, type, limit, fastQuery) {
  if (fastQuery) {
    return util.format("MATCH (:%s {id:'%s'})-[:INCLUDES]->(tile:tile) RETURN tile %s", type, id, limit);
  } else {
    return util.format("MATCH path = (:%s {id:'%s'})-[:INCLUDES]->(tile:tile) RETURN tile,nodes(path) as nodes,relationships(path) as relationships %s", type, id, limit);
  }
}

module.exports = find;
module.exports.init = init;
module.exports.__computeMatches = computeMatches;
