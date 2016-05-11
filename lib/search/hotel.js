var util = require('util');
var _ = require('lodash');
var neo4j = require('neo4j');
var async = require('async');

var database;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function find (params, callback) {
  init();
  var amenities = sanitizeInput(params.amenities);
  var geo = sanitizeInput(params.geography);
  var marketing = sanitizeInput(params.marketing);

  if (geo) {
    query(geo.map(function (g) {
      return computeQueries(amenities, g, marketing);
    }), callback);
  } else {
    query([computeQueries(amenities, geo, marketing)], callback);
  }
}

function computeQueries (amenities, geo, marketing) {
  var generalQuery = computeGeneralQuery(geo, amenities);
  var marketingQuery = computeMarketingQuery(marketing);

  var queries = [];
  if (generalQuery) queries.push(generalQuery);
  if (marketingQuery) queries.push(marketingQuery);

  return queries;
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
function query (queriesList, callback) {
  async.parallel(queriesList.map(function (queries) {
    return computeQueryFunctions(queries, database);
  }), function (err, result) {
    // Push all queries together
    var queries = result.map(function (r) {
      return r.queries;
    });

    // Push all hotels together
    var hotels = result.map(function (r) {
      return _.flatten(r.hotels);
    });

    err = err || null; // if no error return null
    return callback(err, {queries: _.flatten(queries), data: _.uniq(_.flatten(hotels))});
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
        return next(null, {queries: queries, hotels: _.intersectionWith(generalResult.hotels, marketingResult.hotels, _.isEqual)});
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
