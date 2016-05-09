var util = require('util');
var isArray = require('lodash.isarray');
var neo4j = require('neo4j');

var database;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function sanitizeInput (input) {
  if (input) {
    if (isArray(input)) {
      if (input.length < 1) return undefined;
      return input;
    }
    else return [input];
  } return input;
}

function find (params, callback) {
  init();
  var limit = params.limit ? 'LIMIT ' + params.limit : '';
  var amenities = sanitizeInput(params.has);
  var geo = sanitizeInput(params.locatedIn);

  if (geo && !amenities) {
    query(util.format('MATCH %s RETURN node %s', computeOnlyGeoMatches(geo), limit), callback);
  } else if (!geo && amenities) {
    query(util.format('MATCH %s RETURN node %s', computeOnlyAmenityMatches(amenities), limit), callback);
  } else {
    query(computeGeoAndAmenityMatches(geo, amenities, limit), callback);
  }
}

function computeOnlyGeoMatches (geo) {
  return geo.map(function (g) {
    return util.format('(:geo {id:"%s"})<-[:LOCATED_IN*..10]-(:hotel)<-[:IS]-(node)', g);
  });
}

function computeOnlyAmenityMatches (amenities) {
  return amenities.map(function (amenity) {
    return util.format('(node)-[:HAS]->(:amenity {id:"%s"})', amenity);
  });
}

function computeGeoAndAmenityMatches (geo, amenities, limit) {
  return geo.map(function (g) {
    return util.format('MATCH %s RETURN node %s', amenities.map(function (a) {
      return util.format('(:geo {id:"%s"})<-[:LOCATED_IN*..10]-(:hotel)<-[:IS]-(node)-[:HAS]->(:amenity {id:"%s"})', g, a);
    }), limit);
  }).join(' UNION ');
}

function query (query, callback) {
  console.log('Neo4j query:', query);
  database.cypher({query: query}, callback);
}

module.exports = find;
module.exports.init = init;
module.exports.__sanitizeInput = sanitizeInput;
