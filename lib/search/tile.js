var isArray = require('lodash.isarray');
var neo4j = require('neo4j');
var deprecate = require('depd')('taggable-searcher:search:tile');

var database;

function init (endpoint) {
  /* istanbul ignore next */
  if (!endpoint) { deprecate('Implicit configuration of NEO4J_ENDPOINT via environment variables is deprecated. You should pass the endpoint as an argument to init()'); }
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function find (params, callback) {
  init();
  var ids = isArray(params.includedIn) ? params.includedIn : [params.includedIn];
  const searchString = computeMatches(ids, params.limit, params.fastQuery).join(' UNION ');
  query(searchString, callback);
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
  const locatedin = `(:geo {id:'${id}'})-[:LOCATED_IN*..10]->()-[:INCLUDES]->(tile:tile {active: true}) RETURN tile`;
  const includes = `(:geo {id:'${id}'})-[:INCLUDES]->(tile:tile {active: true}) RETURN tile`;
  // const includes2 = `(:geo {id:'${id}'})-[:FILTERS]->()-[:INCLUDES]->(tile:tile {active: true}) return tile`;
  if (fastQuery) {
    // return `MATCH ${locatedin} ${limit} UNION MATCH ${includes} ${limit} UNION MATCH ${includes2} ${limit}`;
    return `MATCH ${locatedin} ${limit} UNION MATCH ${includes} ${limit}`;
  } else {
    return `MATCH path = ${locatedin},nodes(path) as nodes,relationships(path) as relationships ${limit} UNION MATCH path = ${includes},nodes(path) as nodes,relationships(path) as relationships ${limit}`;
  }
}

function computeGeneralMatch (id, type, limit, fastQuery) {
  const query = `(:${type} {id:'${id}'})-[:INCLUDES]->(tile:tile {active: true}) RETURN tile`;
  const query2 = `(:${type} {id:'${id}'})-[:FILTERS]->()-[:INCLUDES]->(tile:tile {active: true}) return tile`;
  if (fastQuery) {
    return `MATCH ${query} ${limit} UNION MATCH ${query2} ${limit}`;
  } else {
    return `MATCH path = ${query},nodes(path) as nodes,relationships(path) as relationships ${limit}`;
  }
}

module.exports = find;
module.exports.init = init;
module.exports.__computeMatches = computeMatches;
