'use strict';


var influenceFactor = 6;


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
		.style('stroke', 'black')
		.style('opacity', 0.5)
		.style('stroke-width', function(d){
			return d.weight;
		});

	function fixNode(d){
		d3.select(this).select('circle')
			.style('stroke-width', 4);
		d3.fixed = true;
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
		.on('click', fixNode);


	nodeEnter.append('circle')
		.attr('r', function(d){
			console.log(d);
			return parseInt(d.influence * influenceFactor);
		})
		.style('fill', 'rgba(255,0,255,1');

	nodeEnter.append('text')
		.style('text-anchor', 'middle')
		.style('font', '10px sans-serif')
		.attr('y', 25)
		.text(function(d){
			return d.id;
		});

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
	.defer(d3.csv, 'nodelist.csv')
	.defer(d3.csv, 'edgelist.csv')
	.await(function(err, file1, file2){
		createForceLayout(file1, file2);
	});
