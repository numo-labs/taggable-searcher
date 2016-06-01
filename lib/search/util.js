function toD3Format (data) {
  var nodes = [];
  var nodeMapper = {};
  var links = [];

  data.forEach(function (row) {
    row.nodes.forEach(function (node) {
      if (!getIndex(nodes, nodeMapper, node._id)) {
        nodes.push({
          id: node._id,
          label: node.labels[0] || '',
          title: node.properties.name
        });
        nodeMapper[node._id] = nodes.length - 1;
      }
    });
    links = links.concat(row.relationships.map(function (relationship) {
      var start = getIndex(nodes, nodeMapper, relationship._fromId);
      var end = getIndex(nodes, nodeMapper, relationship._toId);
      if (Boolean(start) && Boolean(end)) {
        return {
          source: start,
          target: end,
          type: relationship.type
        };
      }
    })).filter(function (link) { if (link) return true; });
  });
  console.log(JSON.stringify({nodes: nodes, links: links}, null, 2));
}

function getIndex (nodes, mapper, id) {
  return mapper[id] || null;
}

module.exports.toD3Format = toD3Format;
