'use strict';

// ------------------------------------------------
// How big are dem circles?
//
var influenceFactor = 6;

// ------------------------------------------------
// Cache some nodes
//
var infoName = d3.select('#info-name');
var infoBio = d3.select('#info-bio');
var audio = document.getElementById('audio');
var mp3 = document.getElementById('mp3');

var colors = ['#fd9467', '#72c0f0', '#ee81aa', '#97c16d', '#fcfa83', '#7ec7da', '#fd9467', '#72c0f0', '#ee81aa', '#97c16d', '#fcfa83', '#7ec7da', '#fd9467', '#72c0f0', '#ee81aa', '#97c16d', '#fcfa83', '#7ec7da', '#fd9467', '#72c0f0', '#ee81aa', '#97c16d', '#fcfa83', '#7ec7da', '#fd9467', '#72c0f0', '#ee81aa', '#97c16d', '#fcfa83', '#7ec7da'];



// -------------------------------------------------
//
// Start Force
// 
// -------------------------------------------------
function createForceLayout(nodes, edges){

	// ------------------------------------------------
	// Add SVG
	//
	var svg = d3.select('#viz').append('svg')
		.attr('class', 'svg-container')
		.attr('width', window.innerWidth)
		.attr('height', window.innerHeight);
	
	var nodeHash = {};
	
	for (var x in nodes){
		nodeHash[nodes[x].id] = nodes[x];
	}

	for (var x in edges){
		edges[x].weight = parseInt(edges[x].weight);
		edges[x].source = nodeHash[edges[x].source];
		edges[x].target = nodeHash[edges[x].target];
	}

	var weightscale = d3.scale.linear().domain(d3.extent(edges, function(d){
		return d.weight
	})).range([.1, 1]);

	var force = d3.layout.force()
		.charge(function(d){
			return d.weight * -500
		})
		.gravity(.3)
		.size([window.innerWidth,window.innerHeight])
		.nodes(nodes)
		.links(edges)
		.on('tick', forceTick);

	d3.select('svg')
		.selectAll('line.link')
		.data(edges, function(d){
			return d.source.id + '-' + d.target.id
		})
		.enter()
		.append('line')
		.attr('class', 'link')
		.style('opacity', 0.5)
		.style('stroke-width', function(d){
			return d.weight;
		});

	function fixNode(d){
		d3.select(this).select('circle')
			.style('stroke-width', 4);
		d3.fixed = true;
	}

	function highlightNode(d, i){
		d3.select(this).attr('class', 'node active');
		var text = d.id;
		var coloredText = '';

		for (var i = 0; i < text.length; i++ ){
			var span = '<span style="color:' + colors[i] + ';">' + text[i] + '</span>';
			coloredText = coloredText + span;
		}
		infoName.html(coloredText);
		infoBio.text(d.bio);
		this.parentElement.appendChild(this);
	}

	function unHighlightNode(){
		d3.select(this).attr('class', 'node');
		infoName.text('');
		infoBio.text('');
	}

	function startAudio(d, i){
		console.log(d);
		mp3.src = 'audio/' + d.audio;
		audio.load();
		audio.play();
	}

	function stopAudio(){
		audio.pause();
		audio.currentTime = 0;
		unHighlightNode();
	}

	var nodeEnter = d3.select('svg')
		.selectAll('g.node')
		.data(nodes, function(d){
			return d.id
		})
		.enter()
		.append('g')
		.attr('class', 'node')
		.call(force.drag())
		.on('click', fixNode)
		.on('mouseover', highlightNode)
		.on('mousedown', startAudio)
		.on('mouseup', stopAudio)
		.on('mouseout', unHighlightNode);


	nodeEnter.append('circle')
		.attr('r', function(d){
			return parseInt(d.influence * influenceFactor);
		})
		.style('fill', 'rgba(255,0,255,1');

	// nodeEnter.append('text')
	// 	.style('text-anchor', 'middle')
	// 	.style('font', '10px sans-serif')
	// 	.attr('y', 25)
	// 	.text(function(d){
	// 		return d.id;
	// 	});

	nodeEnter.append('image')
		.attr('xlink:href', function(d){
			return 'images/' + d.image + '.png';
		})
		.attr('x', function(d){
			return -(d.influence * influenceFactor) + 'px';
		})
		.attr('y', function(d){
			return -(d.influence * influenceFactor) + 'px';
		})
		.attr('width', function(d){
			return (d.influence * influenceFactor) * 2 + 'px';
		})
		.attr('height', function(d){
			return (d.influence * influenceFactor) * 2 + 'px';
		})
		.on('mouseenter', function(d){

			d3.select(this)
				.transition()
				.duration(500)
				.attr('width', '250px')
				.attr('height', '250px')
				.attr('x', '-125px')
				.attr('y', '-125px');
		})
		.on('mouseout', function(d){
			d3.select(this)
				.transition()
				.duration(500)
				.attr('x', function(d){
					return -(d.influence * influenceFactor) + 'px';
				})
				.attr('y', function(d){
					return -(d.influence * influenceFactor) + 'px';
				})
				.attr('width', function(d){
					return (d.influence * influenceFactor) * 2 + 'px';
				})
				.attr('height', function(d){
					return (d.influence * influenceFactor) * 2 + 'px';
				})
		});



	force.start();


	function forceTick(){
		d3.selectAll('line.link')
			.attr('x1', function(d){
				return d.source.x;
			})
			.attr('x2', function(d){
				return d.target.x;
			})
			.attr('y1', function(d){
				return d.source.y;
			})
			.attr('y2', function(d){
				return d.target.y;
			});

		d3.selectAll('g.node')
			.attr('transform', function(d){
				return 'translate(' + d.x + ',' + d.y + ')'
			});
	}



}



// -------------------------------------------------
//
// Fetch data
// 
// -------------------------------------------------

queue()
	.defer(d3.json, 'nodelist.json')
	.defer(d3.csv, 'edgelist.csv')
	.await(function(err, file1, file2){
		createForceLayout(file1, file2);
	});
