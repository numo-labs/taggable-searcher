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
Type: `array <br/>
Default: taggy

This is a unique identifier to differentiate different _markets_ and _languages_. <br/>
E.g. a Danish context may look like this: `dk:da`

#### limit
Type: `int` <br />
Default: all

Specifies the maximum number of search hits to include in the response.

### result
```json
[
  {
    "node": {
      "_id": 19397,
      "labels": [
        "ne",
        "hotel"
      ],
      "properties": {
        "id": "hotel:ne.wvid.197679",
        "name": "Fifteen Beacon, Boston",
        "nodeSubType": "ne",
        "nodeType": "hotel"
      }
    }
  }
]
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
