var util = require('util');
var _ = require('lodash');
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
  var geoQuery = geo ? util.format('(:geo {id:"%s"})<-[:LOCATED_IN*..10]-', geo) : '';
  var hotelQuery = '(:hotel)<-[:IS]-(hotel:hotel)';
  var amenityQuery = amenities ? util.format(',%s', amenities.map(function (amenity) {
    return util.format('(hotel)-[:HAS]->(:amenity {id:"%s"})', amenity);
  })) : '';

  return util.format('MATCH %s%s%s RETURN hotel', geoQuery, hotelQuery, amenityQuery);
}

/**
 * Computes the marketing queries.
 */
function computeMarketingQuery (marketing) {
  if (marketing) {
    return marketing.map(function (id) {
      return util.format('MATCH (hotel)-[:IS]->(:hotel)-[:LOCATED_IN*..10]->(:geo)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel UNION MATCH (hotel)-[:IS]->(:hotel)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel', id, id);
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
    // Push all queries together
    var queries = result.map(function (r) {
      return r.queries;
    });

    // Push all hotels together
    var hotels = _.uniq(_.flatten(result.map(function (r) {
      return _.flatten(r.hotels);
    })));

    err = err || null; // if no error return null
    return callback(err, {queries: _.flatten(queries), data: hotelsToIntersect ? _.intersection(hotels, hotelsToIntersect) : hotels});
  });
}

function computeQueryFunctions (queries, database) {
  return function (next) {
    async.parallel(queries.map(function (query) {
      return function (callback) {
        database.cypher({query: query}, function (err, nodes) {
          if (err) return callback({query: query, err: err});
          var ids = nodes.map(function (node) {
            return node.hotel.properties.id;
          });
          return callback(null, {query: query, hotels: ids});
        });
      };
    }), function (err, result) {
      if (err) return next(err);
      var queries = result.map(function (r) {
        return r.query;
      });
      var generalResult = result[0];
      var marketingResult = result[1];
      // If we have marketing results we need to intersect.
      if (marketingResult && marketingResult.hotels.length > 1) {
        return next(null, {queries: queries, hotels: _.intersection(generalResult.hotels, marketingResult.hotels)});
      } else {
        return next(null, {queries: queries, hotels: generalResult.hotels});
      }
    });
  };
}

function sanitizeInput (input) {
  if (input) {
    if (_.isArray(input)) {
      if (input.length < 1) return undefined;
      return input;
    }
    else return [input];
  } return input;
}

module.exports = find;
module.exports.init = init;
module.exports.__sanitizeInput = sanitizeInput;
module.exports.__computeQueries = computeQueries;
module.exports.__computeMarketingQuery = computeMarketingQuery;
module.exports.__computeGeneralQuery = computeGeneralQuery;
