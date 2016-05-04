var AWS = require('aws-sdk');
var util = require('util');
var s3 = new AWS.S3();
var bucketName = 'numo-taggy';
var environment = 'ci';

function init (bucket, env) {
  if (!bucketName) bucketName = bucket || process.env.S3_TAGGY_BUCKET || 'numo-taggy';
  if (!environment) environment = env || process.env.ENVIRONMENT || 'ci';
}

function get (id, callback) {
  init();
  var params = {
    Bucket: bucketName,
    Key: computeKey(id)
  };
  s3.getObject(params, function (err, data) {
    if (err) return callback(err);
    return callback(null, data.Body.toString());
  });
}

// function update (id, doc, callback) {
//   var params = {
//     ACL: 'public-read',
//     Bucket: bucketName,
//     Key: computeKey(id),
//     Body: new Buffer(typeof doc === 'object' ? JSON.stringify(doc, null, 2) : doc)
//   };
//   s3.upload(params, callback);
// }

function computeKey (id) {
  var matches = id.match(/(\w*):(\w*)\.(\w*)/);
  var key = util.format('%s/%s/%s/%s.json', environment, matches[1], matches[2], id);
  console.log('Key for S3 document:', key);
  return key;
}

module.exports.init = init;
module.exports.get = get;
// module.exports.update = update;
