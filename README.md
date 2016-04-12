# taggable-searcher
Helper library to query the tag system

## What?
Taggable searcher is a custom and easy to use helper library to query our taggable system.

## Why?
#### 1) Complexity
Initially we  created a lambda to execute this functionality. This meant we needed to call the lambda each time we wanted to invoke a query to cloudsearch, our create a more 'complex' mechanism to chain queries together in 1 call.

This worked but was proven to become difficult to use.

#### 2) Speed
Some of the queries we invoke take a while to come back with results. An example here is  the query where we want to fetch all hotels tagged with 'Spain'. Various testing showed that results would only return after a second, which is too long.

## How?
### Installation:

`npm install --save-dev git+ssh://git@github.com:numo-labs/taggable-searcher.git`

### Queries
#### 1) Getting tags by id
This query will return all tags based on a given list of ids.

```js
var taggy = require('taggable-searcher');
...
taggy.searchById(['geo:geonames:123'], {...options}, function (err, result) {
  // Handle result
});
...
```

#### 2) Getting tags by display name
This query will return all tags based on a given display name

```js
var taggy = require('taggable-searcher');
...
taggy.searchByName(['Spain'], {...options}, function (err, result) {
  // Handle result
});
...
```

#### 3) Getting tags that are tagged by a gives list of tag ids
This query will return all tags tagged by a given list of tag ids

```js
var taggy = require('taggable-searcher');
...
taggy.searchByTags(['geo:geonames:123', 'amenity:general:pool'], {...options}, function (err, result) {
  // Handle result
});
...
```

**Complex example**
Let's say you want to search for all tags tagged by _geo:geonames:greece_ **OR** _geo:geonames:spain_ but with _amenity:wifi_ **AND** _amenity:pool_.

```js
var taggy = require('taggable-searcher');
...
taggy.searchByTags([['geo:geonames:greece', 'geo.geonames.spain'], 'amenity:wifi', 'amenity:pool'], { operator: 'and'}, function (err, result) {
  // Handle result
});
...
```
As you can see you can wrap all the 'or' groups in sub-array. You can nest this as deep as you want to.

#### 3) Getting tags based on data in the doc field.
This query will return all tags with the given data in the doc field

```js
var taggy = require('taggable-searcher');
...
taggy.searchByDoc(['"_id":"geo:geonames.2267057"'], {...options}, function (err, result) {
  // Handle result
});
...
```

#### options
Following is a list of options you can pass in the functions.

| key | type | default | description |
| --- | ---- | ------- | ----------- |
| size | Integer | 1000 | The amount our results you want back. |
| start | Integer | 0 | Specifies the offset of the first search hit you want to return. Note that the result set is zero-based; the first result is at index 0. |
| operator | String | or | The query operator |
| idPrefix | String | empty | E.g 'hotel', 'hotel:mhid', 'geo' |

### Suggestions

#### 1) Getting suggestions for id
This will return suggestions based on part of an id.

```js
taggy.suggestId('hotel:mhid', {...options}, function (err, result) {
  // Handle result
});
```

#### 2) Getting suggestions for displayname
This will return suggestions based on part of a display name.

```js
taggy.suggestName('spa', {...options}, function (err, result) {
  // Handle result
});
```
#### options
Following is a list of options you can pass in the functions.

| key | type | default | description |
| --- | ---- | ------- | ----------- |
| size | Integer | 10 | The amount our suggestions you want back. |
| minLetters | Integer | empty | The min length of your word before it hits cloudsearch |
