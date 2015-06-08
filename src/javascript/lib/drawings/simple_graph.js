/**
 @author David Piegza

 Implements a simple graph drawing with force-directed placement in 2D and 3D.

 It uses the force-directed-layout implemented in:
 https://github.com/davidpiegza/Graph-Visualization/blob/master/layouts/force-directed-layout.js

 Drawing is done with Three.js: http://github.com/mrdoob/three.js

 To use this drawing, include the graph-min.js file and create a SimpleGraph object:

 <!DOCTYPE html>
 <html>
 <head>
 <title>Graph Visualization</title>
 <script type="text/javascript" src="path/to/graph-min.js"></script>
 </head>
 <body onload="new Drawing.SimpleGraph({layout: '3d', showStats: true, showInfo: true})">
 </bod>
 </html>

 Parameters:
 options = {
    layout: "2d" or "3d"

    showStats: <bool>, displays FPS box
    showInfo: <bool>, displays some info on the graph and layout
              The info box is created as <div id="graph-info">, it must be
              styled and positioned with CSS.


    selection: <bool>, enables selection of nodes on mouse over (it displays some info
               when the showInfo flag is set)


    limit: <int>, maximum number of nodes

    numNodes: <int> - sets the number of nodes to create.
    numEdges: <int> - sets the maximum number of edges for a node. A node will have
              1 to numEdges edges, this is set randomly.
  }


 Feel free to contribute a new drawing!

 */


var Graph = require('./Graph.js').graph;
var Node = require('./Graph.js').node;
var Edge = require('./Graph.js').edge;
var Stats = require('../utils/Stats.js')
require('../utils/TrackballControls.js')
require('../utils/Label.js')
require('../utils/ObjectSelection.js')
var Layout = require('../layouts/force-directed-layout.js')


var nodes = [
    {
        id: 1,
        title: "PATI",
        color:0xff0000
    },
    {
        id: 2,
        title: "RMC"
        ,
        color:0x00ff00
    },
    {
        id: 3,
        title: "CORE",
        color:0x00ff00
    },
    {
        id: 4,
        title: "CORE1",
        color:0x00ff00
    },
    {
        id: 5,
        title: "CORE2",
        color:0x00ff00
    },
    {
        id: 6,
        title: "CORE3",
        color:0x00ff00
    },
]
var edges = [
    {
        id: 1,
        title: "test",
        src: 1,
        dst: 2
    },
    {
        id: 1,
        title: "test",
        src: 1,
        dst: 3
    },
    {
        id: 1,
        title: "test",
        src: 1,
        dst: 4
    },
    {
        id: 1,
        title: "test",
        src: 1,
        dst: 5
    },
    {
        id: 1,
        title: "test",
        src: 1,
        dst: 6
    }
]

var Drawing = Drawing || {};

Drawing.SimpleGraph = function (options) {
    var options = options || {};

    this.layout = options.layout || "2d";
    this.layout_options = options.graphLayout || {};
    this.show_stats = options.showStats || false;
    this.show_info = options.showInfo || false;
    this.show_labels = options.showLabels || false;
    this.selection = options.selection || false;
    this.limit = options.limit || 10;
    this.nodes_count = options.numNodes || 20;
    this.edges_count = options.numEdges || 10;

    var camera, controls, scene, renderer, interaction, geometry, object_selection;
    var stats;
    var info_text = {};
    var graph = new Graph({limit: options.limit});

    var geometries = [];

    var that = this;

    init();
    createGraph();
    animate();

    function init() {
        // Three.js initialization
        renderer = new THREE.WebGLRenderer({alpha: false});
        var width = $("#scene").innerWidth();
        var height = $("#scene").innerHeight();
        renderer.setSize(width, height);

        camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000000);
        camera.position.z = 5000;

        controls = new THREE.TrackballControls(camera);

        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 5.2;
        controls.panSpeed = 1;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = false;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [65, 83, 68];

        controls.addEventListener('change', render);

        scene = new THREE.Scene();

        var light = new THREE.AmbientLight( 0x404040 );
        scene.add(light);

        //var light = new THREE.PointLight( 0xff0000, 1, 1000 );
        //light.position.set( 0,0, 100 );
        //scene.add( light );
        // Node geometry

        //geometry = new THREE.CubeGeometry(300, 300, 300);
        geometry=new THREE.SphereGeometry( 300, 32, 32 );

        // Create node selection, if set
        if (that.selection) {
            object_selection = new THREE.ObjectSelection({
                domElement: renderer.domElement,
                selected: function (obj) {
                    // display info
                    if (obj != null) {
                        info_text.select = "Object " + obj.id;

                    } else {
                        delete info_text.select;
                    }
                },
                clicked: function (obj) {
                    console.log(obj);
                }
            });
        }

        //  document.body.appendChild(renderer.domElement);
        $("#scene").append(renderer.domElement)
        // Stats.js
        if (that.show_stats) {
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            document.body.appendChild(stats.domElement);
        }

        // Create info box
        if (that.show_info) {
            var info = document.createElement("div");
            var id_attr = document.createAttribute("id");
            id_attr.nodeValue = "graph-info";
            info.setAttributeNode(id_attr);
            document.body.appendChild(info);
        }
    }


    /**
     *  Creates a graph with random nodes and edges.
     *  Number of nodes and edges can be set with
     *  numNodes and numEdges.
     */
    function createGraph() {

        var nodesDic = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = new Node(nodes[i].id);
            graph.addNode(node);
            node.data.title = nodes[i].title;
            node.data.color = nodes[i].color;
            drawNode(node);
            nodesDic[nodes[i].id] = node;

        }

        for (var i = 0; i < edges.length; i++) {
            if (graph.addEdge(nodesDic[edges[i].src], nodesDic[edges[i].dst])) {
                drawEdge(nodesDic[edges[i].src], nodesDic[edges[i].dst]);
            }
        }
        //var node = new Node(0);
        //node.data.title = "This is node " + node.id;
        //graph.addNode(node);
        //drawNode(node);
        //
        //var nodes = [];
        //nodes.push(node);
        //
        //var steps = 1;
        //while(nodes.length != 0 && steps < that.nodes_count) {
        //  var node = nodes.shift();
        //
        //  var numEdges = randomFromTo(1, that.edges_count);
        //  for(var i=1; i <= numEdges; i++) {
        //    var target_node = new Node(i*steps);
        //    if(graph.addNode(target_node)) {
        //      target_node.data.title = "This is node " + target_node.id;
        //
        //      drawNode(target_node);
        //      nodes.push(target_node);
        //      if(graph.addEdge(node, target_node)) {
        //        drawEdge(node, target_node);
        //      }
        //    }
        //  }
        //  steps++;
        //}

        that.layout_options.width = that.layout_options.width || 2000;
        that.layout_options.height = that.layout_options.height || 2000;
        that.layout_options.iterations = that.layout_options.iterations || 100000;
        that.layout_options.layout = that.layout_options.layout || that.layout;
        graph.layout = new Layout.ForceDirected(graph, that.layout_options);
        graph.layout.init();
        info_text.nodes = "Nodes " + graph.nodes.length;
        info_text.edges = "Edges " + graph.edges.length;
    }


    /**
     *  Create a node object and add it to the scene.
     */
    function drawNode(node) {
        var draw_object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            color: node.data.color,
            opacity: 0.5
        }));

        //var draw_object = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        //    color: node.data.color,
        //    opacity: 0.8
        //}));

        if (that.show_labels) {
            if (node.data.title != undefined) {
                var label_object = new THREE.Label(node.data.title);
            } else {
                var label_object = new THREE.Label(node.id);
            }
            node.data.label_object = label_object;
            scene.add(node.data.label_object);
        }

        var area = 5000;
        draw_object.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        draw_object.position.y = Math.floor(Math.random() * (area + area + 1) - area);

        if (that.layout === "3d") {
            draw_object.position.z = Math.floor(Math.random() * (area + area + 1) - area);
        }

        draw_object.id = node.id;
        node.data.draw_object = draw_object;
        node.position = draw_object.position;
        scene.add(node.data.draw_object);
    }


    /**
     *  Create an edge object (line) and add it to the scene.
     */
    function drawEdge(source, target) {
        material = new THREE.LineBasicMaterial({color: 0x00f000, opacity: 1, linewidth: 0.5});

        var tmp_geo = new THREE.Geometry();
        tmp_geo.vertices.push(source.data.draw_object.position);
        tmp_geo.vertices.push(target.data.draw_object.position);

        line = new THREE.Line(tmp_geo, material, THREE.LinePieces);
        line.scale.x = line.scale.y = line.scale.z = 1;
        line.originalScale = 1;

        geometries.push(tmp_geo);

        scene.add(line);
    }


    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        render();
        if (that.show_info) {
            printInfo();
        }
    }


    function render() {
        // Generate layout if not finished
        if (!graph.layout.finished) {
            info_text.calc = "<span style='color: red'>Calculating layout...</span>";
            graph.layout.generate();
        } else {
            info_text.calc = "";
        }

        // Update position of lines (edges)
        for (var i = 0; i < geometries.length; i++) {
            geometries[i].verticesNeedUpdate = true;
        }


        // Show labels if set
        // It creates the labels when this options is set during visualization
        if (that.show_labels) {
            var length = graph.nodes.length;
            for (var i = 0; i < length; i++) {
                var node = graph.nodes[i];
                if (node.data.label_object != undefined) {
                    node.data.label_object.position.x = node.data.draw_object.position.x;
                    node.data.label_object.position.y = node.data.draw_object.position.y - 400;
                    node.data.label_object.position.z = node.data.draw_object.position.z;
                    node.data.label_object.lookAt(camera.position);
                } else {
                    if (node.data.title != undefined) {
                        var label_object = new THREE.Label(node.data.title, node.data.draw_object);
                    } else {
                        var label_object = new THREE.Label(node.id, node.data.draw_object);
                    }
                    node.data.label_object = label_object;
                    scene.add(node.data.label_object);
                }
            }
        } else {
            var length = graph.nodes.length;
            for (var i = 0; i < length; i++) {
                var node = graph.nodes[i];
                if (node.data.label_object != undefined) {
                    scene.remove(node.data.label_object);
                    node.data.label_object = undefined;
                }
            }
        }

        // render selection
        if (that.selection) {
            object_selection.render(scene, camera);
        }

        // update stats
        if (that.show_stats) {
            stats.update();
        }

        // render scene
        renderer.render(scene, camera);
    }

    /**
     *  Prints info from the attribute info_text.
     */
    function printInfo(text) {
        var str = '';
        for (var index in info_text) {
            if (str != '' && info_text[index] != '') {
                str += " - ";
            }
            str += info_text[index];
        }
        document.getElementById("graph-info").innerHTML = str;
    }

    // Generate random number
    function randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    // Stop layout calculation
    this.stop_calculating = function () {
        graph.layout.stop_calculating();
    }
}

module.exports = Drawing;
