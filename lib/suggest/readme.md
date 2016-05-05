# Suggest
We use _suggest_ for the auto-completion input fields in isearch-ui and taggy-ui.

# Usage
```js
var taggy = require('taggable-searcher');

taggy.suggest({
  text: 'Spa',
  context: 'dk:da',
  include: 'hotel',
  exclude: 'geo',
  start: 0,
  size: 10
}, callback)
```
# API
## suggest([params], callback)
### params
#### text
Type: `string`

This is the text that is used to suggest auto-completion possibilities. <br/> This is a **mandatory** field.

#### context
Type: `string` <br/>
Default: taggy

This is a unique identifier to differentiate different _markets_ and _languages_. <br/>
E.g. a Danish context may look like this: `dk:da`

#### include
Type: `array` or `string` <br />
Default: empty

You can provide an _include_ parameter to only suggest options that have the **tagid** prefix provided. <br/>
E.g. When I search for **Spa** I only want suggestions related to a geo-location. Then I will have to add `geo` to the include parameter.

**_Note_:** Use include _or_ exclude, but not both.

#### exclude
Type: `array` or `string` <br/>
Default: empty

This is the opposite of _include_. <br />
E.g. When I search for **Spa** I want suggestions that are _not_ related to a geo-location. Then I will have to add `geo` to the exclude parameter.

**_Note_:** Use include _or_ exclude, but not both.

#### start
Type: `int` <br/>
Default: 0

Specifies the offset of the first search hit you want to return. Note that the result set is zero-based; the first result is at index 0. You can specify either the start or cursor parameter in a request, they are mutually exclusive.

#### size
Type: `int` <br/>
default: 10

Specifies the maximum number of search hits to include in the response.

## Result
```json
{
    "status": {
        "timems": 0,
        "rid": "8uWhicgq4FwKUJQt"
    },
    "hits": {
        "found": 1,
        "start": 0,
        "hit": [{
            "id": "taggy:geo:geonames.2510769",
            "fields": {
                "name": ["Spain"],
                "tagid": ["geo:geonames.2510769"],
                "label": ["Spain"],
                "context": ["taggy"],
                "active": ["true"],
                "boost": ["1"]
            }
        }]
    }
}
```

# Environment variables
In order for this to work we need to set up 1 environment variable _or_ initialize it manually before we use any function.

## variables
**CLOUDSEARCH_ENDPOINT** The cloudsearch endpoint

## manually
```js
taggy.suggest.init('cloud search endpoint');
