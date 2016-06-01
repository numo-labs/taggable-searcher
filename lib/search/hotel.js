var util = require('util');
var intersection = require('lodash.intersection');
var uniq = require('lodash.uniq');
var flatten = require('lodash.flatten');
var neo4j = require('neo4j');
var async = require('async');
var search = require('./index');

var database;
var NODE_TYPES = {
  AMENITY: 'amenity',
  TILE: 'tile',
  MARKETING: 'marketing',
  HOTEL: 'hotel',
  GEO: 'geo'
};

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function find (params, callback) {
  init();

  getExtendedFilters(params, function (err, data) {
    if (err) return callback(err);
    var amenities = sanitizeInput(params.amenities);
    var geography = sanitizeInput(params.geography, data.geography);
    var marketing = sanitizeInput(params.marketing);
    // var tiles = sanitizeInput(params.tiles);
    var hotel = sanitizeInput(params.hotels);

    if (geography) {
      query(geography.map(function (g) {
        return computeQueries(amenities, g, marketing);
      }), hotel, callback);
    } else {
      query([computeQueries(amenities, geography, marketing)], hotel, callback);
    }
  });
}

function computeQueries (amenities, geo, marketing) {
  var generalQuery = computeGeneralQuery(geo, amenities);
  var marketingQuery = computeMarketingQuery(marketing);

  var queries = [];
  if (generalQuery) queries.push(generalQuery);
  if (marketingQuery) queries.push(marketingQuery);

  return queries;
}

/*
 * For tiles we search related types this to allow then to be aggated
 * This simplifies the overall query
 */
function getExtendedFilters (params, callback) {
  var queryParams = {
    linkType: ':FILTERS',
    maxDept: 5,
    limit: 2
  };
  params.amenities = params.amenities || [];
  params.tiles = params.tiles || [];
  params.marketing = params.marketing || [];
  params.hotels = params.hotels || [];
  params.geography = params.geography || [];

  if (params.tiles.length > 0) {
    search.node(params.tiles).outgoing(queryParams, function (err, data) {
      if (err) return callback(err);
      if (Array.isArray(data.data)) {
        data.data.forEach(function (tag) {
          var node = tag.node.properties;
          switch (node.nodeType) {
            case NODE_TYPES.AMENITY:
              params.amenities.push(node.id);
              break;
            case NODE_TYPES.MARKETING:
              params.marketing.push(node.id);
              break;
            case NODE_TYPES.HOTEL:
              params.hotels.push(node.id);
              break;
            case NODE_TYPES.GEO:
              params.geography.push(node.id);
              break;
          }
        });
        return callback(null, params);
      }
    });
  } else {
    return callback(null, params);
  }
}

/**
 * Computes the geography / amenity query.
 */
function computeGeneralQuery (geo, amenities) {
  if (!geo && !amenities) return undefined;
  var geoQuery = geo ? util.format('(:geo {id:"%s"})<-[:LOCATED_IN*..10]-', geo) : '';
  var hotelQuery = '(:hotel)<-[:IS]-(hotel:hotel)';
  var amenityQuery = amenities ? util.format(',%s', amenities.map(function (amenity) {
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
function query (queriesList, hotelsToIntersect, callback) {
  async.parallel(queriesList.map(function (queries) {
    return computeQueryFunctions(queries, database);
  }), function (err, result) {
<<<<<<< dab0f7f2a70671e871ceae70d3dfeb4625633df7
    // Push all queries together
    var queries = result.map(function (r) {
      return r.queries;
    });

    // Push all hotels together
    var hotels = uniq(flatten(result.map(function (r) {
      return flatten(r.hotels);
    })));

    err = err || null; // if no error return null
    return callback(err, {queries: flatten(queries), data: hotelsToIntersect ? intersection(hotels, hotelsToIntersect) : hotels});
=======
    var mergedResults = mergeResults(result);
    err = err || null; // if no error return null
    return callback(err, {queries: (mergedResults.queries), data: mergedResults.nodes});
  });
}

function mergeResults (results) {
  return results.reduce(function (previous, current) {
    return {
      queries: previous.queries.concat(current.queries),
      nodes: previous.nodes.concat(current.nodes)
    };
>>>>>>> Return the whole structure for hotels and tiles
  });
}

function computeQueryFunctions (queries, database) {
  return function (next) {
    async.parallel(queries.map(function (query) {
      return function (callback) {
        database.cypher({query: query}, function (err, nodes) {
          if (err) return callback({query: query, err: err});
          return callback(null, {query: query, nodes: nodes});
        });
      };
    }), function (err, result) {
      if (err) return next(err);
      var queries = result.map(function (r) {
        return r.query;
      });
      var generalResult = result[0];
      var marketingResult = result[1];
      // If no results, return empty hotel array.
      if (!generalResult && !marketingResult) return next(null, {queries: queries, nodes: []});
      // If we have marketing results we need to intersect.
      if (marketingResult && marketingResult.hotels.length > 1) {
<<<<<<< dab0f7f2a70671e871ceae70d3dfeb4625633df7
        return next(null, {queries: queries, hotels: intersection(generalResult.hotels, marketingResult.hotels)});
=======
        return next(null, {queries: queries, nodes: generalResult.nodes.concat(marketingResult.nodes)});
>>>>>>> Return the whole structure for hotels and tiles
      } else {
        return next(null, {queries: queries, nodes: generalResult.nodes});
      }
    });
  };
}

function sanitizeInput (input) {
  if (input) {
    if (Array.isArray(input)) {
      if (input.length < 1) return undefined;
      return input;
    } else {
      return [input];
    }
  } return input;
}

module.exports = find;
module.exports.init = init;
module.exports.__sanitizeInput = sanitizeInput;
module.exports.__computeQueries = computeQueries;
module.exports.__computeMarketingQuery = computeMarketingQuery;
module.exports.__computeGeneralQuery = computeGeneralQuery;
