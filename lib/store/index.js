var AWS = require('aws-sdk');
var util = require('util');
var bucketName = 'numo-taggy';
var environment = 'ci';

function init (bucket, env) {
  if (bucket) bucketName = bucket;
  if (env) environment = env;
}

function get (id, callback) {
  var params = {
    Bucket: bucketName,
    Key: computeKey(id)
  };
  var s3 = new AWS.S3();
  s3.getObject(params, function (err, data) {
    if (err) return callback(err);
    return callback(null, data.Body.toString());
  });

  return params;
}

function computeKey (id) {
  var matches = id.match(/(\w*):(\w*)\.(\w*)/);
  var key = util.format('%s/%s/%s/%s.json', environment, matches[1], matches[2], id);
  return key;
}

module.exports.init = init;
module.exports.get = get;
