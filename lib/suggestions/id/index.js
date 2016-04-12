function suggest (text, options, cloudSearchDomain, callback) {
  var params = {
    query: text,
    suggester: 'id',
    size: options.size
  };

  cloudSearchDomain.suggest(params, callback);
}

module.exports = suggest;
