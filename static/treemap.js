var sponsors = get_sponsors(data);
var today_date = new Date();

var w = $('.viz').width(),
	h = 800 - 180,
	x = d3.scale.linear().range([0, w]),
	y = d3.scale.linear().range([0, h]),
	rw = $('.info').width(),
	color = d3.scale.ordinal()
		.range(['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(128,177,211)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(188,128,189)','rgb(204,235,197)','rgb(255,237,111)']),
	root,
	node;

var colors = set_colors();

var treemap = d3.layout.treemap()
	.round(false)
	.size([w, h-20])
	.sticky(true)
	.value(function(d) { return d.size * d.size; })
	.padding(null);

var chart = d3.select(".viz")
	.append("div")
	.attr("class", "chart")
	.style("width", w + "px")
	.style("height", h + "px")
	.append("svg:svg")
	.attr("width", w - 2)
	.attr("height", h - 2)
	.append("svg:g")
	.attr("transform", "translate(1,1)");

var project_info = d3.select(".info")
	.append("div")
	.attr("class", "project-info")
	.style("width", rw+ "px")
	.style("height", h-20 + "px");

var legend = d3.select(".info")
	.append("div")
	.attr("class", "legend")
	.style("width", rw + "px")
	.style("height", function() {
		return (20*sponsors.length + 35) + "px";
	})

legend.append("h5")
	.text("Sponsoring Departments:");

legend.append("svg:svg")
	.attr("width", rw)
	.attr("height", function() {
		return 20*sponsors.length;
	});

var footer = d3.select("#footer")
	.append("p")
	.text(function() {
		return "Project data last updated on " + moment(today_date).format('MMMM Do, YYYY');
	});

function get_date(date) {
	var y = date.slice(0, 4);
	var m = parseInt(date.slice(5, 7)) - 1;
	var d = parseInt(date.slice(8,10));
	new_date = new Date(y, m, d);
	return new_date;
}

function get_sponsors(data) {
	d = JSON.parse(data);
	RESULTS = []
	for (i in d.children) {
		if ('children' in d.children[i]) {
			if (RESULTS.indexOf(d.children[i].name) == -1) {
				RESULTS.push(d.children[i].name);
			}
		} else if (RESULTS.indexOf(d.children[i].sponsor) == -1) {
			RESULTS.push(d.children[i].sponsor);
		}
	}
	return RESULTS.sort();
}

function set_colors() {
	RESULTS = {}
	for (s in sponsors) {
		RESULTS[sponsors[s]] = color(s);
	}
	return RESULTS;
}

d3.json("static/data_tree.json", function(data) {
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
		.attr("width", function(d) { return d.dx - 4; })
		.attr("height", function(d) { return d.dy - 4; })
		.style("fill", function(d) { 
			if (d.children) {
				return "white";
			} else {
				return colors[d.sponsor]; 
			}
		})
		// // Add red border around projects that are overdue
		// .style("stroke", function(d) {
		// 	if (!d.children) {
		// 		if (get_date(d.target) < today_date) {
		// 			return "red";
		// 		} else {
		// 			return "white";
		// 		}
		// 	}
		// })
		.style("stroke", "white")
		.style("stroke-width", 2)
		.on("mouseover", function(d) {
			if (!d.children) {
				d3.select(this)
					.style("stroke", "black");

				d3.selectAll(".info-text").remove();

				var info_text = project_info.append("div")
					.attr("class", "info-text")

				info_text.append("h4")
					.text(function() {
						return d.name;
					});

				info_text.append("h5")
					.text("Contributors:");
				
				var cList = info_text.append("ul")
					.attr("class", "contributors");

				cList.selectAll("li")
					.data(d.contributors)
					.enter()
					.append("li")
					.text(function(d) {
						return d.name + " (" + d.role + ")";
					});

                info_text.append("p")
                    .attr("class", "text-danger bg-danger")
                    .text(function() {
                        if (d.complete == null) {
                            if (get_date(d.target) < today_date) {
                                s = "This project is past its target end date of "
                                date = moment(get_date(d.target)).format('MMMM Do, YYYY');
                                return s + date;
                            }
                        }
                    });
			}
		})
		.on("mouseout", function() {
			d3.select(this)
				// // Add red border around projects that are overdue
				// .style("stroke", function(d) {
				// 	if (get_date(d.target) < today_date) {
				// 		return "red";
				// 	} else {
				// 		return "white";
				// 	}
				// });
				.style("stroke", "white");
		})

	cell.append("text")
		.text(function(d) {
			if (!d.children) {
				return d.name;
			}
	 	})
	 	.each(function(d){
	 		if (!d.children) {
		 		var w = d.dx;
		 		var h = d.dy;
	        	d3plus.textwrap()
	        		.container(d3.select(this))
	        		.width(w - 10)
	        		.height(h)
	        		.x(2.5)
	        		.align('middle')
	        		.valign('middle')
	        		.resize(true)
	        		.size([10,12])
	        		.draw();
	        }
    	});

	var legend_item = legend.select("svg")
		.selectAll("g")
		.data(sponsors)
		.enter()
		.append("svg:g")
		.attr("class", "legend_item")
		.attr("transform", function(d, i) {
			return "translate(" + 20 + "," + 20*i + ")";
		});

	legend_item.append("svg:rect")
		.attr("width", 15)
		.attr("height", 15)
		.style("fill", function(d) {
			return colors[d];
		});

	legend_item.append("svg:text")
		.attr("x", 20)
		.attr("y", 15)
		.attr("class", "small")
		// .attr("text-anchor", "left")
		.text(function(d) { return d; });
	
	var info_text = project_info.append("div")
		.attr("class", "info-text")
		.append("p")
			.text("Hover over a project for more information")

	});