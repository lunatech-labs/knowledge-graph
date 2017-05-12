function loadJSON(path) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // you can customize the result like with these options. These are explained below.
        // These are the default options.
        var parserOptions = {
          edges: {
            inheritColors: false
          },
          nodes: {
            fixed: false,
            parseColor: false
          }
        }

        // parse the gephi file to receive an object
        // containing nodes and edges in vis format.

        var parsed = parseGephi(JSON.parse(xhr.responseText), parserOptions);

        var nodes = new vis.DataSet(parsed.nodes);

        // provide data in the normal fashion
        var data = {
          edges: parsed.edges,
          nodes: nodes
        }


        var container = document.getElementById("mynetwork");
        var options = {
          layout: {
            hierarchical: {
              direction: "RL",
              sortMethod: "directed",
              nodeSpacing: 150
            }
          },
          nodes: {
            color: {
              border: '#2B7CE9',
              background: '#97C2FC',
              highlight: {
                border: '#2B7CE9',
                background: '#D2E5FF'
              },
              hover: {
                border: '#2B7CE9',
                background: '#D2E5FF'
              }
            }
          },
          interaction: {
            dragNodes: true
          },
          edges: {
            smooth: true,
            arrows: {to: true}
          },
          physics: true
        };

        var seen = [];

        if(Cookies.get('name') != undefined) {
            seen = JSON.parse(Cookies.get('name'));
        }

        _.each(_.values(nodes._data), function(n) {

            if(_.contains(seen, n.id)) {
                n.color = { background: '#e0e57e' };
            }
        });


        // create a network
        var network = new vis.Network(container, data, options);



        $("#confirm").click(function(e) {
            var alreadySeen = [];

            if(Cookies.get('name') != undefined) {
                alreadySeen = JSON.parse(Cookies.get('name'));
            }

            var node = $(e.target).data('node');

            alreadySeen.push(node.id);
            var newContents = JSON.stringify(alreadySeen);
            Cookies.set('name', newContents);


            node.color = { background: '#e0e57e' }

            nodes.update(node);
        })


        network.on("selectNode", function (params) {

            var node = null;

          for(var k in data.nodes._data) {
            if(data.nodes._data[k].id == params.nodes[0]) {
                node = data.nodes._data[k];
            }
          }


          var title = node.label;
          var level = node.attributes.Difficulty;
          var info = node.attributes.Info != undefined ? node.attributes.Info : "";
          var refs = node.attributes.References != undefined && node.attributes.References.trim() != "" ? node.attributes.References.split(',') : [];

          $("#attributepane").show();

          $("#attributepane #headertext").text(title);
          $("#attributepane #data").text(info);
          $("#attributepane #level").text(level);

          var levelEl = $("#attributepane #level");

          if (level === 'Hard') {
            levelEl.show();
            levelEl.attr('class', 'label label-danger');
          } else if (level === 'Intermediate') {
            levelEl.show();
            levelEl.attr('class', 'label label-warning');
          } else if (level === 'Easy') {
            levelEl.show();
            levelEl.attr('class', 'label label-success');
          } else {
            levelEl.hide();
          }

          var refsEl = $("#attributepane #refs");

          refsEl.empty();

          $("#confirm").data('node', node);

          if (refs.length > 0) {
            $("#attributepane #refscontainer").show();

            $.each(refs, function (n, str) {

              var li = $("<li></li>");
              var anchor = $("<a></a>");

              anchor.attr("href", str);
              anchor.attr("target", "_blank");
              anchor.text(str);

              li.append(anchor);

              refsEl.append(li);
            });
          } else {
            $("#attributepane #refscontainer").hide();
          }

        });
      }
      else {
        console.log("troubles");
      }
    }
  };
  xhr.open('GET', path, true);
  xhr.send();
}

function parseGephi(gephiJSON, optionsObj) {
  var edges = [];
  var nodes = [];
  var options = {
    edges: {
      inheritColor: false
    },
    nodes: {
      fixed: false,
      parseColor: false
    }
  };

  if (optionsObj !== undefined) {
    if (optionsObj.fixed !== undefined)        {options.nodes.fixed = optionsObj.fixed}
    if (optionsObj.parseColor !== undefined)   {options.nodes.parseColor = optionsObj.parseColor}
    if (optionsObj.inheritColor !== undefined) {options.edges.inheritColor = optionsObj.inheritColor}
  }

  var gEdges = gephiJSON.edges;
  var gNodes = gephiJSON.nodes;
  for (var i = 0; i < gEdges.length; i++) {
    var edge = {};
    var gEdge = gEdges[i];
    edge['id'] = gEdge.id;
    edge['from'] = gEdge.source;
    edge['to'] = gEdge.target;
    edge['attributes'] = gEdge.attributes;
    edge['label'] = gEdge.label;
    edge['title'] = gEdge.attributes !== undefined ? gEdge.attributes.title : undefined;
    if (gEdge['type'] === 'Directed') {
      edge['arrows'] = 'to';
    }
//    edge['value'] = gEdge.attributes !== undefined ? gEdge.attributes.Weight : undefined;
//    edge['width'] = edge['value'] !== undefined ? undefined : edgegEdge.size;
    if (gEdge.color && options.inheritColor === false) {
      edge['color'] = gEdge.color;
    }
    edges.push(edge);
  }

  for (var i = 0; i < gNodes.length; i++) {
    var node = {};
    var gNode = gNodes[i];
    node['id'] = gNode.id;
    node['attributes'] = gNode.attributes;
    node['title'] = gNode.title;
    node['x'] = gNode.x;
    node['y'] = gNode.y;
    node['label'] = gNode.label;
    node['title'] = gNode.attributes !== undefined ? gNode.attributes.title : undefined;
    node['size'] = gNode.size;
    node['fixed'] = options.nodes.fixed && gNode.x !== undefined && gNode.y !== undefined;
    nodes.push(node);
  }

  return {nodes:nodes, edges:edges};
}



var gephiJSON = loadJSON("freestyle.json"); // code in importing_from_gephi.