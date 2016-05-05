# Store
We use _store_ to retrieve the document for a given id.

# Usage
```js
var taggy = require('taggable-searcher');

taggy.store.get('geo:geonames.10062607', callback);
```
# API
## store.get(id, callback)
### params
#### id
Type: `string`

This is the _tag id_ to retrieve the document.

## result
It will return the content of the queried document.

# Environment variables
In order for this to work we need to set up 2 environment variables _or_ initialize it manually before we use any function.

## variables
**S3_TAGGY_BUCKET** The name of the bucket <br/>
**ENVIRONMENT** The environment we are in. (e.g. _ci_).

## manually
```js
taggy.store.init('bucket_name', 'ci');
```
