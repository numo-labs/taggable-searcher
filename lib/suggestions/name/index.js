function suggest (text, options, cloudSearchDomain, callback) {
  var params = {
    query: text,
    suggester: 'displayname',
    size: options.size
  };

  cloudSearchDomain.suggest(params, callback);
}

module.exports = suggest;
