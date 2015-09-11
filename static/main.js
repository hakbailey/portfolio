// custom javascript

var sponsors = get_sponsors(data);

var w = $('.viz').width(),
	h = 800 - 180,
	x = d3.scale.linear().range([0, w]),
	y = d3.scale.linear().range([0, h]),
	cw = $('.container').width(),
	color = d3.scale.category10(),
	root,
	node;

var treemap = d3.layout.treemap()
	.round(false)
	.size([w, h])
	.sticky(true)
	.value(function(d) { return d.size * d.size; })
	.padding(null);

var chart = d3.select(".viz")
	.append("div")
	.attr("class", "chart")
	.style("width", w + "px")
	.style("height", h + "px")
	.append("svg:svg")
	.attr("width", w)
	.attr("height", h)
	.append("svg:g");
	// .attr("transform", "translate(.5,.5)");

var legend = d3.select(".legend")
	.append("div")
	.attr("class", "legend")
	.style("width", cw/6 + "px")
	.style("height", h + "px")
	.append("svg:svg")
	.attr("width", cw/6)
	.attr("height", function() {
		return 20*sponsors.length;
	})
	.append("svg:g");

var info = d3.select(".info")
	.append("div")
	.attr("class", "info")
	.style("width", cw/6 + "px")
	.style("height", h + "px")
	.append("svg:svg")
	.attr("width", cw/6)
	.attr("height", h)
	.append("svg:g");

function get_sponsors(data) {
	d = JSON.parse(data);
	RESULTS = []
	for (i in d.children) {
		if (RESULTS.indexOf(d.children[i].sponsor) == -1) {
			RESULTS.push(d.children[i].sponsor);
		}
	}
	return RESULTS.sort();
}

d3.json("static/data.json", function(data) {
	node = root = data;

	var nodes = treemap.nodes(root);

	var cell = chart.selectAll("g")
		.data(nodes)
		.enter().append("svg:g")
		.attr("class", "cell")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	cell.append("a")
		.attr("xlink:href", function(d) {
			return d.url;
		})
		.attr("show", "new")
		.append("svg:rect")
		.attr("width", function(d) { return d.dx - 2; })
		.attr("height", function(d) { return d.dy - 2; })
		.style("fill", function(d) { 
			if (d.children) {
				return "white";
			} else {
				return color(d.sponsor); 
			}
		})
		.style("stroke", "white")
		.style("stroke-width", 1)
		.on("mouseover", function() {
			d3.select(this)
				.style("stroke", "black");
		})
		.on("mouseout", function() {
			d3.select(this)
				.style("stroke", "white");
		});

	cell.append("svg:text")
		.attr("x", function(d) { return d.dx / 2; })
		.attr("y", function(d) { return d.dy / 2; })
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; });

	var legend_item = legend.selectAll("g")
		.data(sponsors)
		.enter()
		.append("svg:g")
		.attr("class", "legend_item")
		.attr("transform", function(d, i) {
			return "translate(" + 10 + "," + 20*i + ")";
		});

	legend_item.append("svg:rect")
		.attr("width", 15)
		.attr("height", 15)
		.style("fill", function(d) {
			return color(d);
		});

	legend_item.append("svg:text")
		.attr("x", 20)
		.attr("y", 15)
		.attr("text-anchor", "left")
		.text(function(d) { return d; })
		.style("font-size", "0.8em");

	});