var util = require('util');
var neo4j = require('neo4j');
var async = require('async');
var search = require('./index');

var database;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function find (params, callback) {
  // Check if or database connection is set up.
  init();

  getTileFilters(params.tiles, function (err, filters) {
    if (err) return callback(err);
    var sanitizedParams = mergeParams(params, filters);

    // Launch query
    query(computeQueries(sanitizedParams.geography, sanitizedParams.amenities, sanitizedParams.marketing), sanitizedParams.hotels, callback);
  });
}

/**
 * Computes the NEO4J queries we need to execute.
 */
function computeQueries (geography, amenities, marketing) {
  var queries = [];

  if (geography.length) {
    queries.push(geography.map(function (geo) {
      return computeGeneralQuery(geo, amenities);
    }).join(' UNION '));
  } else if (amenities.length) {
    queries.push(computeGeneralQuery(undefined, amenities));
  }

  if (marketing.length > 0) {
    queries.push(computeMarketingQuery(marketing));
  }
  return queries;
}

/*
 * For tiles we search related types this to allow then to be aggated
 * This simplifies the overall query
 */
function getTileFilters (tiles, callback) {
  if (tiles && tiles.length) {
    var params = {
      linkType: ':FILTERS',
      maxDept: 5
    };

    var filters = {
      amenities: [],
      marketing: [],
      hotels: [],
      geography: []
    };

    search.node(tiles).outgoing(params, function (err, data) {
      if (err) return callback(err);
      data.data.forEach(function (tag) {
        var type = tag.node.properties.nodeType;
        var id = tag.node.properties.id;
        if (type === 'amenity') filters.amenities.push(id);
        else if (type === 'marketing') filters.marketing.push(id);
        else if (type === 'hotel') filters.hotels.push(id);
        else if (type === 'geo') filters.geography.push(id);
      });
      return callback(null, filters);
    });
  } else {
    return callback(null, undefined);
  }
}

/**
 * Computes the geography / amenity query.
 */
function computeGeneralQuery (geo, amenities) {
  if (!geo && !amenities.length) return undefined;
  var geoQuery = geo ? util.format('(:geo {id:"%s"})<-[:LOCATED_IN*..10]-', geo) : '';
  var hotelQuery = '(:hotel)<-[:IS]-(hotel:hotel)';
  var amenityQuery = amenities.length ? util.format(',%s', amenities.map(function (amenity) {
    return util.format('(hotel)-[:HAS]->(:amenity {id:"%s"})', amenity);
  })) : '';

  return util.format('MATCH path = %s%s%s RETURN hotel,nodes(path) as nodes,relationships(path) as relationships', geoQuery, hotelQuery, amenityQuery);
}

/**
 * Computes the marketing queries.
 */
function computeMarketingQuery (marketing) {
  if (marketing) {
    return marketing.map(function (id) {
      return util.format('MATCH path = (hotel)-[:IS]->(:hotel)-[:LOCATED_IN*..10]->(:geo)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel, nodes(path) as nodes,relationships(path) as relationships UNION MATCH path = (hotel)-[:IS]->(:hotel)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel, nodes(path) as nodes,relationships(path) as relationships', id, id);
    }).join(' UNION ');
  }
}

/**
 * Executes each query group. (Query groups are based on geo.)
 */
function query (queries, hotelsToIntersect, callback) {
  async.parallel(queries.map(function (query) {
    return computeQueryFunctions(query, database);
  }), function (err, result) {
    err = err || null; // if no error return null

    var returnObject = {
      queries: [],
      data: []
    };

    // If there is only one result set we can immediately return.
    if (!hotelsToIntersect.length && result.length === 1) {
      // Add queries
      returnObject.queries.push(result[0].query);

      // Add nodes
      returnObject.data = result[0].data;
    } else if (hotelsToIntersect.length) {
      result.forEach(function (r) {
        returnObject.queries.push(r.query);
        r.nodes.forEach(function (node) {
          if (~hotelsToIntersect.indexOf(node.hotel.properties.id)) {
            returnObject.data.push(node);
          }
        });
      });
    } else if (!hotelsToIntersect.length && result.length > 0) {
      // We know we have max 2 results (general and marketing);
      returnObject.queries.push([result[0].query, result[1].query]);
      // We take the smallest list to be the intersection candidate so that array.contains will be faster.
      var intersectionIndex = result[0].length > result[1].length ? 0 : 1;
      var intersections = result[intersectionIndex].data.map(function (node) {
        return node.hotel.properties.id;
      });
      returnObject.data = result[intersectionIndex === 0 ? 1 : 0].data.map(function (node) {
        if (~intersections.indexOf(node.hotel.properties.id)) return node;
      }).filter(function (node) { if (node) return node; });
    }

    return callback(err, returnObject);
  });
}

function computeQueryFunctions (query, database) {
  return function (next) {
    database.cypher({query: query}, function (err, nodes) {
      if (err) return next({query: query, err: err});
      return next(null, {query: query, data: nodes});
    });
  };
}

function mergeParams (a, b) {
  var sa = sanitizeParams(a);
  var sb = sanitizeParams(b);
  return {
    amenities: sb ? sa.amenities.concat(sb.amenities) : sa.amenities,
    geography: sb ? sa.geography.concat(sb.geography) : sa.geography,
    marketing: sb ? sa.marketing.concat(sb.marketing) : sa.marketing,
    hotels: sb ? sa.hotels.concat(sb.hotels) : sa.hotels
  };
}

function sanitizeParams (params) {
  if (!params) return undefined;
  return {
    amenities: toArray(params.amenities),
    geography: toArray(params.geography),
    marketing: toArray(params.marketing),
    hotels: toArray(params.hotels)
  };
}

function toArray (input) {
  if (input) {
    if (Array.isArray(input)) {
      return input;
    } else {
      return [input];
    }
  } return [];
}

module.exports = find;
module.exports.init = init;
