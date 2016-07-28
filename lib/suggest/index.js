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

function buildQuery (options) {
  const query = {
    must: computeMustQuery(options.text, options.context)
  };
  query.must_not = [];
  if (options.activeOnly) {
    query.must_not.push({ term: { active: false } });
  }
  if (options.exclude && options.exclude.length) {
    options.exclude.forEach((type) => {
      query.must_not.push({ prefix: { tagid: type } });
    });
  } else if (options.include && options.include.length) {
    const or = [];
    options.include.forEach((type) => {
      or.push({ prefix: { tagid: type } });
    });
    query.must.push({ bool: { should: or } });
  }
  return query;
}

function formatResult (data, options, callback) {
  data.hits.hits = uniq(data.hits.hits, hit => hit._source.tagid);
  var result = {
    status: {
      timesms: data.took
    },
    hits: {
      found: data.hits.total,
      start: options.start || 0,
      hit: data.hits.hits.map((hit) => {
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
      })
    }
  };
  callback(null, { data: result });
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
