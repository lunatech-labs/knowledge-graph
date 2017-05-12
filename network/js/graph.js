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

        var parsed = vis.network.gephiParser.parseGephi(JSON.parse(xhr.responseText), parserOptions);


        // provide data in the normal fashion
        var data = {
          edges: parsed.edges,
          nodes: parsed.nodes
        }


        var container = document.getElementById("mynetwork");
        var options = {
          layout: {
            hierarchical: {
              direction: "UD",
              sortMethod: "directed",
              nodeSpacing: 200
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
            dragNodes: false
          },
          edges: {
            smooth: true,
            arrows: {to: true}
          },
          physics: false
        };

        // create a network
        var network = new vis.Network(container, data, options);


        network.on("selectNode", function (params) {

          var node = data.nodes.filter(function (n) {
            return n.id == params.nodes[0]
          })[0];

          var title = node.label;
          var level = node.attributes.Difficulty;
          var info = node.attributes.Info;
          var refs = node.attributes.References.split(',');

          $("#attributepane").show();

          $("#attributepane #headertext").text(title);
          $("#attributepane #data").text(info);
          $("#attributepane #level").text(level);

          var refsEl = $("#attributepane #refs");

          refsEl.empty();

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


var gephiJSON = loadJSON("fp_data.json"); // code in importing_from_gephi.