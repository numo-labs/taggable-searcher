var util = require('util');
var AWS = require('aws-sdk');
var optionsHandler = require('./optionsHandler');

var cloudSearchDomain;

function init (endpoint) {
  if (!cloudSearchDomain) cloudSearchDomain = new AWS.CloudSearchDomain({endpoint: endpoint || process.env.CLOUDSEARCH_ENDPOINT});
}

function suggest (o, callback) {
  init();
  if (!cloudSearchDomain) throw Error('Taggy was never initialized with cloudSearchDomain');
  var options = optionsHandler(o);

  var params = {
    query: computeQuery(options.text, options.context, options.operator, options.include, options.exclude),
    queryParser: 'structured'
  };
  if (options.start) params.start = options.start;
  if (options.size) params.size = options.size;

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

function computeQuery (text, context, operator, include, exclude) {
  return util.format(
    '(%s %s %s%s%s)',
    operator,
    computeContext(context),
    computeSearchField(text),
    computePrefixes(include, 'or'),
    exclude ? util.format('(not %s)', computePrefixes(exclude, 'or')) : ''
  );
}

function computeContext (context) {
  if (context) return util.format("context:'%s'", context);
  return '';
}

function computeSearchField (text) {
  if (!text) return '';
  if (text.match(/(\w+:\w+\.\w*)/)) {
    return util.format("(prefix field=tagid '%s')", text);
  } else {
    var words = text.split(' ');
    if (words.length === 1) return util.format("(prefix field=name '%s')", words[0]);
    return util.format('(and %s)', words.map(function (word) {
      return util.format("(prefix field=name '%s')", word);
    }).join(''));
  }
}

function computePrefixes (items, operator) {
  if (items) {
    if (items.length === 1) {
      return util.format("(prefix field=tagid '%s')", items[0]);
    } else {
      return util.format('(%s %s)', operator, items.map(function (item) {
        return util.format("(prefix field=tagid '%s')", item);
      }).join(''));
    }
  }
  else return '';
}

module.exports = suggest;
suggest.init = init;
module.exports.__suggest = suggest;
module.exports.__computeQuery = computeQuery;
module.exports.__computePrefixes = computePrefixes;
module.exports.__computeSearchField = computeSearchField;
