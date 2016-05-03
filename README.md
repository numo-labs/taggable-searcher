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

`npm install --save taggable-searcher`

### Queries
#### Hotel
How to search for a list of hotels based on location and/or amenities?
```js
taggy.search.hotel()
  .has('amenity:ne.lolloandbernie')
  .locatedIn('geo:geonames.146615')
  .limit(2)
  .find(callback)
```

This is a declarative way to search for hotels.

| function | type | default | description |
| --- | ---- | ------- | ----------- |
| has | Array/String | empty | The amenities the hotel needs to have. This is an **and** operation.|
| locatedIn | Array/String | empty | The locations the hotel can be in. This is an **or** operation.|
| limit | Int | 1000 | The max results we want to retrieve.|

### Suggestions

#### Getting suggestions
This will return suggestions based on part of a display name.

```js
taggy.suggest('spa', {...options}, function (err, result) {
  // Handle result
});
```

#### Example options
```js
{
  "text": "Spa",
  "start": 15,
  "size": 125,
  "operator": "or",
  "include": "hotel",
  "exclude": "geo"
}
```

#### options
Following is a list of options you can pass in the functions.

| key | type | default | description |
| --- | ---- | ------- | ----------- |
| text | String | empty | The text you want suggestions for. |
| include | Array | empty | The tag types you want to include (use this or exclude)|
| exclude | Array | empty | The tag types you want to exclude (use this or include)|
| operator | String | AND | - |
| size | Integer | 10 | The amount our suggestions you want back. |
| start | Integer | 0 | Used for pagination |
