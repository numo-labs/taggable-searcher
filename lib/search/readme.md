# Search
We use _search_ to query relations between our nodes.

# API
## search.hotel([params], callback)
Returns a list of hotels that matches the params.
### usage
```js
taggy.search.hotel({
  has: ['amenity:ne.lolloandbernie'],
  locatedIn: ['geo:geonames.4930956'],
  limit: 1
}, callback)
```
### params
#### has
Type: `array` or `string` <br/>
Default: empty

This is a list of _amenities_ the hotel you are looking for must have. <br />
This is an **and** operation. The hotel must have all the _amenities_ in this list.

#### locatedIn
Type: `array` <br/>
Default: taggy

This is a unique identifier to differentiate different _markets_ and _languages_. <br/>
E.g. a Danish context may look like this: `dk:da`

#### fastQuery
Type: `boolean` <br/>
Default: false

By default all queries will run as a verbose query, this returns all information 
needed to understand how the query has devised its results. When set to `true`
This information is not requested resulting in faster queries.

### result
```json
{
  "queries": [
    "MATCH path = (:geo {id:\"geo:geonames.2643743\"})<-[:LOCATED_IN*..10]-(:hotel)<-[:IS]-(hotel:hotel),(hotel)-[:HAS]->(:amenity {id:\"amenity:ne.wifi\"}),(hotel)-[:HAS]->(:amenity {id:\"amenity:ne.allinclusive\"}) RETURN hotel,nodes(path) as nodes,relationships(path) as relationships"
  ],
  "data": [
    {
      "hotel": {
        "_id": 4320,
        "labels": [
          "hotel",
          "ne"
        ],
        "properties": {
          "nodeSubType": "ne",
          "name": "H10 London Waterloo, London",
          "id": "hotel:ne.wvid.125933",
          "nodeType": "hotel"
        }
      },
      "nodes": [
        {
          "_id": 516,
          "labels": [
            "geo",
            "geonames"
          ],
          "properties": {
            "nodeSubType": "geonames",
            "name": "London",
            "id": "geo:geonames.2643743",
            "nodeType": "geo"
          }
        }
      ],
      "relationships": [
        {
          "_id": 40911,
          "type": "LOCATED_IN",
          "properties": {
            "active": true,
            "type": "geo"
          },
          "_fromId": 1650,
          "_toId": 516
        }
      ]
    }
  ]
}

```

## search.tile([params], callback)
Returns a list of tiles that matches the params.

### usage
```js
taggy.search.tile({
  includedIn: ['marketing:concept.casacook', 'geo:geonames.390903']
}, callback)
```
### params
#### includedIn
Type: `array` or `string` <br/>
Default: empty

This is a list of ids that _include_ the tile <br />
This is an **or** operation.

#### fastQuery
Type: `boolean` <br/>
Default: false

By default all queries will run as a verbose query, this returns all information 
needed to understand how the query has devised its results. When set to `true`
This information is not requested resulting in faster queries.

### result
```json
{
  "query": "MATCH path = (:geo {id:'geo:geonames.2515271'})-[:LOCATED_IN*..10]->()-[:INCLUDES]->(tile:tile) RETURN tile,nodes(path) as nodes,relationships(path) as relationships UNION MATCH path = (:geo {id:'geo:geonames.2515271'})-[:INCLUDES]->(tile:tile) RETURN tile,nodes(path) as nodes,relationships(path) as relationships LIMIT 2",
  "data": [
    {
      "tile": {
        "_id": 7195,
        "labels": [
          "tile",
          "article"
        ],
        "properties": {
          "nodeSubType": "article",
          "name": "Vandring på Madeira",
          "id": "tile:article.dk.33",
          "nodeType": "tile"
        }
      },
      "nodes": [
        {
          "_id": 335,
          "labels": [
            "geo",
            "geonames"
          ],
          "properties": {
            "nodeSubType": "geonames",
            "name": "Las Palmas",
            "id": "geo:geonames.2515271",
            "nodeType": "geo"
          }
        },
        {
          "_id": 309,
          "labels": [
            "geo",
            "geonames"
          ],
          "properties": {
            "nodeSubType": "geonames",
            "name": "Canary Islands",
            "id": "geo:geonames.2593110",
            "nodeType": "geo"
          }
        },
        {
          "_id": 7195,
          "labels": [
            "tile",
            "article"
          ],
          "properties": {
            "nodeSubType": "article",
            "name": "Vandring på Madeira",
            "id": "tile:article.dk.33",
            "nodeType": "tile"
          }
        }
      ],
      "relationships": [
        {
          "_id": 47073,
          "type": "LOCATED_IN",
          "properties": {
            "active": true,
            "type": "geo"
          },
          "_fromId": 335,
          "_toId": 309
        },
        {
          "_id": 47485,
          "type": "INCLUDES",
          "properties": {
            "active": true,
            "type": "tile"
          },
          "_fromId": 309,
          "_toId": 7195
        }
      ]
    }
  ]
}

```

## search.node(id).incoming([params], callback)
Returns a list of incoming relations and their corresponding nodes.
### Usage
```js
index.search.node('amenity:ne.outdoorpool').incoming({
  label: ':hotel',
  limit: 1
}, callback);
```

### id
Type: `string` <br/>

This is the unique identifier of the node you want to operate on.

### params
#### label
Type: `string` <br/>

This restricts the type of nodes you want to return, based on the label.

#### limit
Type: `int` <br />
Default: all

Specifies the maximum number of search hits to include in the response.

### result
```json
[
  {
    "relationship": {
      "_id": 638710,
      "type": "HAS",
      "properties": {
        "active": true,
        "type": "amenity"
      },
      "_fromId": 19753,
      "_toId": 19367
    },
    "node": {
      "_id": 19753,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.192158",
        "name": "SunConnect Evita, Faliraki",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  }
]
```

## search.node(id).outgoing([params], callback)
Returns a list of outgoing relations and their corresponding nodes.
### Usage
```js
index.search.node('amenity:ne.outdoorpool').outgoing({
  label: ':hotel',
  limit: 1
}, callback);
```

### id
Type: `string` <br/>

This is the unique identifier of the node you want to operate on.

### params
#### label
Type: `string` <br/>

This restricts the type of nodes you want to return, based on the label.

#### limit
Type: `int` <br />
Default: all

Specifies the maximum number of search hits to include in the response.

### result
```json
[
  {
    "relationship": {
      "_id": 638710,
      "type": "HAS",
      "properties": {
        "active": true,
        "type": "amenity"
      },
      "_fromId": 19753,
      "_toId": 19367
    },
    "node": {
      "_id": 19753,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.192158",
        "name": "SunConnect Evita, Faliraki",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  }
]
```

## search.node(id).links([params], callback)
Returns a list of incoming and outgoing relations and their corresponding nodes.
### usage
```js
index.search.node('amenity:ne.outdoorpool').links({
  label: ':hotel',
  limit: 1
}, callback);
```

### id
Type: `string` <br/>

This is the unique identifier of the node you want to operate on.

### params
#### label
Type: `string` <br/>

This restricts the type of nodes you want to return, based on the label.

#### limit
Type: `int` <br />
Default: all

Specifies the maximum number of search hits to include in the response.

### result
```json
[
  {
    "relationship": {
      "_id": 638710,
      "type": "HAS",
      "properties": {
        "active": true,
        "type": "amenity"
      },
      "_fromId": 19753,
      "_toId": 19367
    },
    "node": {
      "_id": 19753,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.192158",
        "name": "SunConnect Evita, Faliraki",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  }
]
```

## search.node(id).find(callback)
Returns the node specified by the _id_
### usage
```js
index.search.node('amenity:ne.outdoorpool').find(callback);
```

### id
Type: `string`

This is the unique identifier of the node you want to operate on.

### result
```json
{
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
```

# Environment variables
In order for this to work we need to set up 1 environment variable _or_ initialize it manually before we use any function.

## variables
**NEO4J_ENDPOINT** The neo4j endpoint

## manually
```js
taggy.search.init('neo4j endpoint');
