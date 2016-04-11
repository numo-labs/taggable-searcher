function query (words, options, cloudSearchDomain, callback) {
  var params = {
    query: words.constructor === Array ? words.join(' ') : words,
    queryParser: 'simple',
    queryOptions: JSON.stringify({fields: ['doc'], defaultOperator: options.operator}),
    size: options.size,
    start: options.start
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

module.exports = query;
