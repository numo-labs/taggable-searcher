![Tag-e logo](logo.png)

# Install
```
$ npm install --save taggable-searcher
```

# Suggest
We use _suggest_ for the auto-completion input fields in isearch-ui and taggy-ui.<br/>
[Read the documentation here](lib/suggest/readme.md)

# Search
We use _search_ to query relations between our nodes.<br/>
[Read the documentation here](lib/search/readme.md)

# Store
We use _store_ to retrieve the document for a given id. <br/>
[Read the documentation here](lib/store/readme.md)

# Todo
### Spatial searching!

Create London Transport Museum<br/>
`create (:geo {id:"LTM", name:'London Transport Museum', latitude: 51.51195, longitude: -0.12128})`

Create Covent Garden<br />
`create (:geo {id:"CG", name:'Covent Garden', latitude: 51.51424, longitude: -0.12471})`

Create Saint Pauls Cathedral <br />
`create (:geo {id:"SPC", name:'St Pauls Cathedral', latitude: 51.51386, longitude: -0.0983})`

Get all locations within 400 metres of Covent Garden
```
MATCH (cg:geo {id:'CG'})
MATCH (g:geo)
WHERE (distance(point(cg), point(g)) < 400)
return *
```
