var util = require('util');
var isArray = require('lodash.isarray');

var database;
var query = {
  limit: 1000,
  amenities: [],
  geo: [],
  label: ':hotel'
};

function init (neoDatabase, label) {
  database = neoDatabase;
  if (label) query.label = label;
  return {
    locatedIn: locatedIn,
    has: has,
    limit: limit,
    find: find
  };
}

function locatedIn (geo) {
  query.geo = query.geo.concat(isArray(geo) ? geo : [geo]);
  return this;
}

function has (amenities) {
  query.amenities = query.amenities.concat(isArray(amenities) ? amenities : [amenities]);
  return this;
}

function limit (limit) {
  query.limit = limit;
  return this;
}

function find (callback) {
  var query = buildQuery();
  console.log('Neo4j query:', query);
  database.cypher({query: query}, callback);
  query = {
    limit: 1000
  };
}

function buildQuery () {
  var geo = query.geo;
  var amenities = query.amenities;
  var limit = query.limit;
  var label = query.label;
  if (geo.length > 0 && amenities.length === 0) {
    return geo.map(function (g) {
      return util.format('MATCH %s(node%s) RETURN node LIMIT %s', g, label, limit);
    });
  } else if (geo.length === 0 && amenities.length > 0) {
    return util.format('MATCH %s RETURN node LIMIT %s', amenities.map(function (a) {
      return util.format('(node%s)-[:HAS]->(:amenity {id:"%s"})', label, a);
    }), limit);
  } else {
    return geo.map(function (g) {
      return util.format('MATCH %s RETURN node LIMIT %s', amenities.map(function (a) {
        return util.format('(:geo {id:"%s"})<-[LOCATED_IN*..10]-(node%s)-[:HAS]->(:amenity {id:"%s"})', g, label, a);
      }), limit);
    }).join(' UNION ');
  }
}

module.exports = init;
