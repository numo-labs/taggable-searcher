var isInteger = require('lodash.isinteger');
var isArray = require('lodash.isarray');

var TEXT_ERROR = Error('Option text needs to be provided!');

function cloudSearch (options) {
  if (options) {
    var o = {};
    if (options.text) o.text = options.text;
    else throw TEXT_ERROR;
    if (options.size) o.size = isInteger(options.size) ? options.size : 1000;
    if (options.start) o.start = isInteger(options.start) ? options.start : 0;
    if (options.operator) o.operator = ['or', 'and'].indexOf(options.operator) > -1 ? options.operator : 'and';
    if (options.include) o.include = isArray(options.include) ? options.include : [options.include];
    if (options.exclude) o.exclude = isArray(options.exclude) ? options.exclude : [options.exclude];
    return o;
  } else throw TEXT_ERROR;
}

module.exports.cloudSearch = cloudSearch;
