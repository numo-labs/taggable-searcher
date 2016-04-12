var isInteger = require('lodash.isinteger');

var DEFAULT_OPTIONS = {
  size: 1000,
  start: 0,
  operator: 'or'
};

var operators = ['or', 'and'];

function options (options) {
  if (options) {
    var sanitizedOptions = {
      size: isInteger(options.size) ? options.size : DEFAULT_OPTIONS.size,
      start: isInteger(options.start) ? options.start : DEFAULT_OPTIONS.start,
      operator: operators.indexOf(options.operator) > -1 ? options.operator : DEFAULT_OPTIONS.operator
    };

    if (options.idPrefix) sanitizedOptions.idPrefix = options.idPrefix;
    return sanitizedOptions;
  } else {
    return DEFAULT_OPTIONS;
  }
}

function idToPrefix (id) {
  var type = id.substring(0, id.indexOf(':'));
  var types = {
    geo: 'geotags',
    amenity: 'amenitytags',
    hotel: 'hoteltags',
    marketing: 'marketingtags'
  };
  return types[type];
}

module.exports.options = options;
module.exports.idToPrefix = idToPrefix;
