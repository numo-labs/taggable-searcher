
function query (ids, options, cloudSearchDomain, callback) {
  var params = {
    query: ids.constructor === Array ? ids.join(' ') : ids,
    queryParser: 'simple',
    queryOptions: JSON.stringify({fields: ['id'], defaultOperator: options.operator}),
    size: options.size,
    start: options.start
  };

  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}

module.exports = query;
