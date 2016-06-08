var util = require('util');
var neo4j = require('neo4j');
var async = require('async');
var uniq = require('lodash.uniq');
var search = require('./index');

var database;

function init (endpoint) {
  if (!database) database = new neo4j.GraphDatabase(endpoint || process.env.NEO4J_ENDPOINT);
}

function find (params, callback) {
  // Check if or database connection is set up.
  init();

  var fastQuery = params.fastQuery;

  getTileFilters(params.tiles, function (err, filters) {
    if (err) return callback(err);
    var sanitizedParams = mergeParams(params, filters);

    // Launch query
    query(computeQueries(sanitizedParams.geography, sanitizedParams.amenities, sanitizedParams.marketing, fastQuery), sanitizedParams.hotels, callback);
  });
}

/**
 * Computes the NEO4J queries we need to execute.
 */
function computeQueries (geography, amenities, marketing, fastQuery) {
  var queries = [];

  if (geography.length) {
    queries.push(geography.map(function (geo) {
      return computeGeneralQuery(fastQuery, geo, amenities);
    }).join(' UNION '));
  } else if (amenities.length) {
    queries.push(computeGeneralQuery(fastQuery, undefined, amenities));
  }

  if (marketing.length > 0) {
    queries.push(computeMarketingQuery(fastQuery, marketing));
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
      maxDepth: 5
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
        else if (type === 'hotel') filters.hotels.push(tag.node);
        else if (type === 'geo') filters.geography.push(id);
      });
      return callback(null, filters);
    });
  } else {
    return callback(null, undefined);
  }
}

function computeGeneralQuery (fastQuery, geo, amenities) {
  if (!geo && !amenities.length) return undefined;
  var geoQuery = geo ? util.format('(:geo {id:"%s"})<-[:LOCATED_IN*..10]-', geo) : '';
  var hotelQuery = '(:hotel)<-[:IS]-(hotel:hotel)';
  var amenityQuery = amenities.length ? util.format(',%s', amenities.map(function (amenity) {
    return util.format('(hotel)-[:HAS]->(:amenity {id:"%s"})', amenity);
  })) : '';

  if (fastQuery) {
    return computeFastGeneralQuery(geoQuery, hotelQuery, amenityQuery);
  } else {
    return computeVerboseGeneralQuery(geoQuery, hotelQuery, amenityQuery);
  }
}

/**
 * Computes the geography / amenity query, with all path information
 */
function computeVerboseGeneralQuery (geoQuery, hotelQuery, amenityQuery) {
  return util.format('MATCH path = %s%s%s RETURN hotel,nodes(path) as nodes,relationships(path) as relationships', geoQuery, hotelQuery, amenityQuery);
}

/**
 * Computes the geography / amenity query, with all path information
 */
function computeFastGeneralQuery (geoQuery, hotelQuery, amenityQuery) {
  return util.format('MATCH %s%s%s RETURN hotel', geoQuery, hotelQuery, amenityQuery);
}

/**
 * Computes the marketing queries.
 */
function computeMarketingQuery (fastQuery, marketing) {
  if (marketing) {
    return marketing.map(function (id) {
      if (fastQuery) {
        return util.format('MATCH (hotel)-[:IS]->(:hotel)-[:LOCATED_IN*..10]->(:geo)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel UNION MATCH (hotel)-[:IS]->(:hotel)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel UNION MATCH (hotel)-[:HAS]->(:amenity)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel', id, id, id);
      } else {
        return util.format('MATCH path = (hotel)-[:IS]->(:hotel)-[:LOCATED_IN*..10]->(:geo)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel, nodes(path) as nodes,relationships(path) as relationships UNION MATCH path = (hotel)-[:IS]->(:hotel)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel, nodes(path) as nodes,relationships(path) as relationships UNION MATCH path = (hotel)-[:HAS]->(:amenity)<-[:FILTERS*..10]-(:marketing {id:"%s"}) return hotel, nodes(path) as nodes,relationships(path) as relationships', id, id, id);
      }
    }).join(' UNION ');
  }
}

/**
 * Executes each query group. (Query groups are based on geo.)
 */
function query (queries, hotelsToAdd, callback) {
  async.parallel(queries.map(function (query) {
    return computeQueryFunctions(query, database);
  }), function (err, result) {
    err = err || null; // if no error return null
    // Intersect the search results together
    var intersected = intersectResults(result);

    // If we have extra hotels to add, add them here.
    if (hotelsToAdd.length) {
      filterUniqueHotels(hotelsToAdd, intersected.hotelIds).forEach(function (hotel) {
        intersected.data.push({hotel: hotel});
      });
    }
    return callback(err, {queries: intersected.queries, data: intersected.data});
  });
}

function filterUniqueHotels (hotels, hotelIdsToFilter) {
  return hotels.map(function (hotel) {
    // Only add it when it is not in the list yet.
    if (hotelIdsToFilter.indexOf(hotel.properties.id) === -1) return hotel;
  }).filter(function (hotel) { if (hotel) return hotel; });
}

function intersectResults (results) {
  if (!results.length) return {queries: [], data: [], hotelIds: []};
  else if (results.length === 1) return {queries: results[0].query, data: results[0].data, hotelIds: mapToIdsToArray(results[0].data)};
  else {
    var queries = [results[0].query, results[1].query];
    var smallestList = results[0].length > results[1].length ? 0 : 1;
    var hotelIds = mapToIdsToArray(results[smallestList].data);
    var data = results[smallestList === 0 ? 1 : 0].data.map(function (node) {
      if (~hotelIds.indexOf(node.hotel.properties.id)) return node;
    }).filter(function (node) { if (node) return node; });
    return {queries: queries, data: data, hotelIds: hotelIds};
  }
}

function mapToIdsToArray (data) {
  return data.map(function (node) {
    return node.hotel.properties.id;
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
    amenities: uniq(toArray(params.amenities)),
    geography: uniq(toArray(params.geography)),
    marketing: uniq(toArray(params.marketing)),
    hotels: uniq(toArray(params.hotels))
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
