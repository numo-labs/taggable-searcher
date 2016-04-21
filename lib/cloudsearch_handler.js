var async = require('async');

module.exports = function query (params, options, cloudSearchDomain, callback) {
  if (options.parallel) {
    async.parallel(
      generate_parallel_functions(params, options, cloudSearchDomain, callback),
      function (err, data) {
        if (err) return callback(err);
        var result = merge(data);
        callback(null, result);
      }
    );
  } else {
    return execute(params, cloudSearchDomain, callback);
  }
};

function merge (results) {
  return results.reduce(function (previous, current) {
    previous.hits.found = current.hits.found + previous.hits.found;
    previous.hits.hit = previous.hits.hit.concat(current.hits.hit);
    return previous;
  });
}

function generate_parallel_functions (params, options, cloudSearchDomain, callback) {
  var functions = [];
  var max_chunk = options.parallelChunkSize;
  var modulus = params.size % max_chunk;
  var number_of_functions = Math.ceil(params.size / max_chunk);
  for (var i = 0; i < number_of_functions; i++) {
    var size = i === number_of_functions - 1 ? modulus : max_chunk;
    functions.push(generate_parallel_function(params, i * max_chunk, size, cloudSearchDomain, callback));
  }
  return functions;
}

function generate_parallel_function (params, start, size, cloudSearchDomain, callback) {
  return function (next) {
    var p = Object.assign({}, params);
    p.start = start;
    p.size = size;
    execute(p, cloudSearchDomain, next);
  };
}

function execute (params, cloudSearchDomain, callback) {
  console.log('CloudSearchDomain params:', params);
  cloudSearchDomain.search(params, callback);
}
