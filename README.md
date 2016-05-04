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

## Initialize
You can initialize taggable-searcher with environment variables. [See env2](https://github.com/dwyl/env2).

Each section gives you the opportunity to initialize it manually if needed. Please see the different sections to see the required initialization variables.

## Queries

### Initialization
**Environment Variable:** NEO4J_ENDPOINT

**Manual init:** `taggy.search.init(neo4J_endpoint)`

### Hotel
How to search for a list of hotels based on location and/or amenities?
```js
taggy.search.hotel()
  .has('amenity:ne.lolloandbernie')
  .locatedIn('geo:geonames.146615')
  .limit(2)
  .find(callback)
```

#### Result
```json
[
  {
    "node": {
      "_id": 23138,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.5442",
        "name": "Caribe, Playa de las Américas",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  },
  {
    "node": {
      "_id": 23136,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.6530",
        "name": "Hotel Su, Antalya",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  }
]
```

This is a declarative way to search for hotels.

| function | type | default | description |
| --- | ---- | ------- | ----------- |
| has | Array/String | empty | The amenities the hotel needs to have. This is an **and** operation.|
| locatedIn | Array/String | empty | The locations the hotel can be in. This is an **or** operation.|
| limit | Int | 1000 | The max results we want to retrieve.|

### Node
How to search for the outgoing, incoming or all links?

#### Outgoing

```js
taggy.search.node('amenity:ne.lolloandbernie')
  .outgoing() // accepts a label if you only want children nodes of a specific type
  .limit(2)
  .find(callback)
```

#### Incoming

```js
taggy.search.node('amenity:ne.lolloandbernie')
  .incoming() // accepts a label if you only want children nodes of a specific type
  .limit(2)
  .find(callback)
```

#### Links

```js
taggy.search.node('amenity:ne.lolloandbernie')
  .links() // accepts a label if you only want children nodes of a specific type
  .limit(2)
  .find(callback)
```

#### Result
The result object looks like this:

```json
[
  {
    "relationship": {
      "_id": 635056,
      "type": "HAS",
      "properties": {
        "active": true,
        "type": "amenity"
      },
      "_fromId": 23138,
      "_toId": 19367
    },
    "node": {
      "_id": 23138,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.5442",
        "name": "Caribe, Playa de las Américas",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  },
  {
    "relationship": {
      "_id": 635028,
      "type": "HAS",
      "properties": {
        "active": true,
        "type": "amenity"
      },
      "_fromId": 23136,
      "_toId": 19367
    },
    "node": {
      "_id": 23136,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.6530",
        "name": "Hotel Su, Antalya",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  }
]
```
#### Options

| function | type | default | description |
| --- | ---- | ------- | ----------- |
| limit | Int | 1000 | The max results we want to retrieve.|

### Suggestions

### Initialization
**Environment Variable:** CLOUDSEARCH_ENDPOINT

**Manual init:** `taggy.suggest.init(cloudsearch_endpoint)`

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
  "context": "dk:da",
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
| context | String | empty | Usually the market/language identifier. |
| include | Array | empty | The tag types you want to include (use this or exclude)|
| exclude | Array | empty | The tag types you want to exclude (use this or include)|
| operator | String | AND | - |
| size | Integer | 10 | The amount our suggestions you want back. |
| start | Integer | 0 | Used for pagination |

### Store
How to retrieve the document for a node in S3?

### Initialization
**Environment Variables:** S3_TAGGY_BUCKET, ENVIRONMENT

**Manual init:** `taggy.store.init(s3_taggy_bucket, environment)`

```js
taggy.store.get('geo:geonames.10062607', callback);
```

#### Result
```json
{
  "_id": "geo:geonames.10062607",
  "displayName": "Naujamiestis",
  "location": {
    "lat": "54.67951",
    "lon": "25.26855"
  },
  "tags": [
    {
      "node": "geo:geonames.864485",
      "edge": "LOCATED_IN",
      "displayName": "Vilnius County",
      "source": "geonames",
      "active": true
    }
  ]
}
```
