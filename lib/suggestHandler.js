var util = require('util');

function suggest (options, cloudSearchDomain, callback) {
  var params = {
    query: computeQuery(options.text, options.market, options.language, options.operator, options.include, options.exclude),
    queryParser: 'structured'
  };
  if (options.start) params.start = options.start;
  if (options.size) params.size = options.size;

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

function computeQuery (text, market, language, operator, include, exclude) {
  return util.format(
    '(%s %s %s%s%s)',
    operator,
    util.format("context:'%s:%s'", market, language),
    util.format("(prefix field=name '%s')", text),
    computePrefixes(include, 'or'),
    exclude ? util.format('(not %s)', computePrefixes(exclude, 'or')) : ''
  );
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
module.exports.__suggest = suggest;
module.exports.__computeQuery = computeQuery;
module.exports.__computePrefixes = computePrefixes;
