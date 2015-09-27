var sponsors = get_sponsors(data);
var mover;

var dates = JSON.parse(dates);
var today_date = new Date();

// var drag = d3.behavior.drag()
//     .on("drag", dragmove);

var color = d3.scale.ordinal()
    .range(['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(128,177,211)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(188,128,189)','rgb(204,235,197)','rgb(255,237,111)']);

var colors = set_colors();

var margin = {top: 0, right: 30, bottom: 80, left: 30},
    width = document.getElementsByClassName('viz')[0].offsetWidth - 30 - margin.left - margin.right,
    height = 615 - margin.top - margin.bottom,
    rw = document.getElementsByClassName('info')[0].offsetWidth;

var format = d3.time.format("%Y-%m-%d");
var scale_start = format.parse(dates[0]);
var scale_end = format.parse(dates[dates.length-1]);
var midpoint = new Date((scale_start.getTime() + scale_end.getTime()) / 2);

var sd = moment(dates[0]);
var ed = moment(dates[dates.length-1]);
var td = ed.diff(sd, 'days');

var x = d3.time.scale()
    .range([0, width])
    .domain([scale_start, scale_end]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.months, 3)
    .tickSize(4)
    .tickFormat(d3.time.format("%b %Y"))
    .orient("bottom");

var svgContainer = d3.select(".viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class", "graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var project_info = d3.select(".info")
    .append("div")
    .attr("class", "project-info")
    .style("width", rw+ "px")
    .style("height", height + margin.top + margin.bottom + 5 - 20 + "px");

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

function get_sponsors(data) {
    d = JSON.parse(data);
    RESULTS = []
    for (i in d.projects) {
        if (RESULTS.indexOf(d.projects[i].sponsor) == -1) {
            RESULTS.push(d.projects[i].sponsor);
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

d3.json("static/data_time.json", function(error, data) {

    var rectangle = svgContainer.selectAll(".graph")
        .data(data.projects)
        .enter()
        .append("g");

    mover = svgContainer.append("g")
        .attr("class", "mover")
        .attr("x", "0")
        .attr("y", "0");
        // .call(drag);

    rectangle.append("rect")
        .attr("x", function(d,i) {
            var date = format.parse(d.start);
            return x(date);
        })
        .attr("y", function(d, i) {
            return 1 + height/dates.length * i * 2;
        })
        .attr("width", function(d) {
            var sDate = x(format.parse(d.start));
            var eDate = x(format.parse(d.target));
            return (eDate - sDate);
        })
        .attr("height", height/dates.length * 1.5)
        .style("fill", function(d) { 
            return colors[d.sponsor];
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .style("stroke-width", 2)
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
        })
        .on("mouseout", function() {
            d3.select(this)
            .style("stroke-width", 0)
        });

    rectangle.append("text")
        .attr("x", function(d, i) {
            var eDate = moment(d.target);
            var sDate = moment(d.start);
            var difference = eDate.diff(sDate, 'days')
            if (td - difference < d.name.length * 4) {
                return x(sDate) + 5;
            }
            if (midpoint - sDate > eDate - midpoint) {
                return x(eDate) + 5;
            }
            else {
                return x(sDate) - 5;
            }
        })
        .attr("y", function(d, i) {
            return height/dates.length * i * 2 + 20 + margin.top - 1;
             // - ((height/dates.length * 1.3) - 10)/2;
        })
        .attr("text-anchor", function(d, i) {
            if (midpoint - format.parse(d.start) > format.parse(d.target) - midpoint) {
                return "start";
            }
            else {
                return "end"
            }
        })
        .attr("font-size", "1em")
        .style("fill", "black")
        .text(function(d) { 
            return d.name; 
        });

    var ruler = mover.append("line")
        .attr("x1", function() {
            return x(today_date);
        })
        .attr("y1", height)
        .attr("x2", function() {
            return x(today_date);
        })
        .attr("y2", "0")
        .attr("stroke", "black")
        .attr("stroke-width", "1px");

    // var today = mover.append("text")
    //     .attr("x", function() {
    //         return x(today_date)+3;
    //     })
    //     .attr("y", 0)
    //     .text("Today");

    // var ball = mover.append("circle")
    //     .attr("cx", "0")
    //     .attr("cy", height - 20)
    //     .attr("r", "15")
    //     .attr("fill", "red");

    svgContainer.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(60)")
        .style("text-anchor", "start");

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
        .text(function(d) { return d; });

    });

    var info_text = project_info.append("div")
            .attr("class", "info-text")
            .append("p")
                .text("Hover over a project for more information");

function get_date(date) {
    var y = date.slice(0, 4);
    var m = parseInt(date.slice(5, 7)) - 1;
    var d = parseInt(date.slice(8,10));
    new_date = new Date(y, m, d);
    return new_date;
}

function dragmove(d) {
    var mx = Math.max(0, Math.min(width, d3.event.x));

    d3.select(this)
        .attr("transform", "translate(" + mx + ", 0)");

    d3.selectAll("rect")
        .style("fill", function(d) {
            var sd = format.parse(d.start);
            var ed = format.parse(d.target);
            if (mx > x(sd) && mx < x(ed)) {
                return "red";
            }
            else {
                return colors[d.sponsor];
            }
        })
}