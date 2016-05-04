var isInteger = require('lodash.isinteger');
var isArray = require('lodash.isarray');

function cloudSearch (options) {
  if (!options || !options.text) throw Error('Option text needs to be provided!');
  var o = {
    text: options.text,
    context: options.context || 'taggy',
    size: isInteger(options.size) ? options.size : 10,
    start: isInteger(options.start) ? options.start : 0,
    operator: ['or', 'and'].indexOf(options.operator) > -1 ? options.operator : 'and'
  };
  if (options.include) o.include = isArray(options.include) ? options.include : [options.include];
  if (options.exclude) o.exclude = isArray(options.exclude) ? options.exclude : [options.exclude];
  return o;
}

module.exports = cloudSearch;
