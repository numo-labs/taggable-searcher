var isArray = require('lodash.isarray');
var AWS = require('aws-sdk');
var ElasticSearch = require('elasticsearch');
var optionsHandler = require('./optionsHandler');
var uniq = require('lodash.uniqby');

var client;

function init () {
  if (!client) {
    var params = {
      hosts: process.env.ELASTICSEARCH_ENDPOINT,
      connectionClass: require('http-aws-es'),
      amazonES: {
        region: process.env.AWS_REGION
      }
    };

    if (process.env.AWS_USE_ACCESS_KEY) {
      params.amazonES.accessKey = process.env.AWS_ACCESS_KEY_ID;
      params.amazonES.secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    } else {
      params.amazonES.credentials = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    client = new ElasticSearch.Client(params);
  }

  return client;
}

function suggest (o, callback) {
  init();
  if (!client) throw Error('Taggy was never initialized with elasticsearch');
  var options = optionsHandler(o);

  client.search({
    index: 'taggy',
    type: 'taggy',
    from: options.start || 0,
    size: options.size || 50,
    body: {
      query: {
        filtered: {
          query: {
            bool: buildQuery(options)
          }
        }
      }
    }
  }, function (err, data) {
    if (err) return callback(err);
    formatResult(data, options, callback);
  });
}

function formatResult (data, options, callback) {
  data.hits.hits = uniq(data.hits.hits, hit => hit._source.tagid);
  var filter = filterData(options);
  var result = {
    status: {
      timesms: data.took
    },
    hits: {
      found: data.hits.hits.length,
      start: options.start || 0,
      hit: data.hits.hits.map(function (hit) {
        if (shouldInclude(hit._source.tagid, filter.list, filter.shouldInclude)) {
          return {
            id: hit._id,
            score: hit._score,
            fields: {
              name: hit._source.name,
              tagid: hit._source.tagid,
              label: hit._source.label,
              context: hit._source.context,
              active: hit._source.active,
              boost: hit._source.boost
            }
          };
        }
      }).filter(function (hit) {
        if (hit) return hit;
      })
    }
  };
  callback(null, { filter: filter, data: result });
}

function filterData (options) {
  const include = isArray(options.include);
  return {
    shouldInclude: include,
    list: options.include || options.exclude || []
  };
}

function shouldInclude (text, items, should) {
  if (items.length === 0) return true;
  return (items.indexOf(text.substring(0, text.indexOf(':'))) > -1) === should;
}

function buildQuery (options) {
  const bool = { };

  const must = computeMustQuery(options.text, options.context);
  if (must) bool.must = must;

  return bool;
}

function computeMustQuery (text, context) {
  const must = [];
  if (text) {
    must.push(text.match(/(\w+:\w+\.\w*)/) ? { match_phrase_prefix: { tagid: text } } : { match_phrase_prefix: { name: text } });
  }
  if (context) must.push({ match: { context: context } });
  return must;
}

module.exports = suggest;
suggest.init = init;
module.exports.__suggest = suggest;
