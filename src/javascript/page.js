// Browserify entry point for the page.js bundle (yay JavaScript!)

var $ = require('jquery');
var _ = require('underscore');
var Drawing = require('./lib/drawings/simple_graph.js')

console.log('page.js loaded!');

var drawing;
drawing = new Drawing.SimpleGraph({layout: '3d', selection: true, numNodes: 50, graphLayout:{attraction: 5, repulsion: 0.5}, showStats: true, showInfo: true});
drawing.show_labels=true;

console.log("logged")