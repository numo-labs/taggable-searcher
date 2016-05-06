var isInteger = require('lodash.isinteger');
var isArray = require('lodash.isarray');

function cloudSearch (options) {
  if (!options || (!options.text && !options.include && !options.exclude)) throw Error('You need to provide at least text, include or exclude');
  var o = {
    text: options.text,
    size: isInteger(options.size) ? options.size : 10,
    start: isInteger(options.start) ? options.start : 0,
    operator: ['or', 'and'].indexOf(options.operator) > -1 ? options.operator : 'and'
  };
  if (options.context) o.context = options.context;
  if (options.include) o.include = isArray(options.include) ? options.include : [options.include];
  if (options.exclude) o.exclude = isArray(options.exclude) ? options.exclude : [options.exclude];
  return o;
}

module.exports = cloudSearch;
