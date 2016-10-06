
    function MultiSeriesChart() {
        /// Chart Attributes
        var width = 850,
            height = 600,
            margin = {top: 50, right: 50, bottom: 50, left: 50};
			minX = 0, maxX = 0;
			minY = 0, maxY = 0;
		
        /// Chart Creation
        function chart(selection) {
			var colors = ['#A17FFF','#0094FF','#FF6A00','#B200FF','#7F593F','#00FF21','#0AD6FF','#7F0037','#737C0B','#3F647F','#0C047C','#FF7F7F','#7FFFFF','#FFFA07'];
			
            selection.each(function(data) {
                // Select the container element and create the svg selection
                var div = d3.select(this),
					svg = div.selectAll('svg').data([data]);
		
                // Initialize the svg element
                svg.enter().append('svg')
                    .call(init);

                // Initialize the svg element
                svg.attr('width', width)
                   .attr('height', height);

                // Parse the data
                data.forEach(function(d) {
					d.forEach(function(d0) {
						d0.direct = +d0.direct;
						d0.indirect = +d0.indirect;
						d0.n = +d0.n;
					});	
                });

                // Create the scales and axis
                var xScale = d3.scale.linear()
                    .domain([minX, maxX])					
                    .range([0, width - margin.left - margin.right]);

                // Create the x axis
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
					.ticks(20)
					.innerTickSize(-height)
					.outerTickSize(0)
					.tickPadding(10);						
  
                // Invoke the xAxis function on the corresponding group
                var xax = svg.select('g.xaxis').call(xAxis);
				
                // Y Axis and Scale
                var yScale = d3.scale.linear()
                    .domain([minY, maxY])
                    .range([height - margin.top - margin.bottom, 0]);

                var yAxis = d3.svg.axis()
                    .scale(yScale)
					.ticks(20)
                    .orient('left')
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(10);					

                // Invoke the yAxis function of the y axis
                var yax = svg.select('g.yaxis').call(yAxis);
				
				// now add titles to the axes
				svg.selectAll("#lbly").remove();
				svg.selectAll("#lblx").remove();	

				xax.append("text")
					.attr("id", "lbly")
					.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
					.attr("transform", "translate("+ (width/2) +","+(margin.bottom-10)+")")  // centre below axis
					.text("Direct Measure - " + $("#type option:selected").text() + " - " + $("#outcome option:selected").text());				

				yax.append("text")
					.attr("id", "lblx")				
					.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
					.attr("transform", "translate(-"+ (margin.left-10) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
					.text("Indirect Measure - " + $("#type option:selected").text() + " - " + $("#outcome option:selected").text());
					
				if(data && data.length > 0) {
					
					// Chart Content
					svg.selectAll("g.cg").remove();
	
					var line = d3.svg.line()
					 .x( function(point) { return point.lx; })
					 .y( function(point) { return point.ly; });
					 
					// Render all the data series
					var cGroup = svg.select('g.chart');
					
					for(var k=0; k<data.length; k++) {
						var cg = cGroup.append('g') // create inner group for the specific data series
							.attr('class', 'cg')
							.attr('transform', 'translate(0,0)');	
							
						var series = data[k];
						var color = (k > colors.length - 1) ? colors[k%colors.length] : colors[k];
						
						cg.selectAll("circle") // render into the inner group the circles						
							.data(series)
							.enter()
							.append("circle")
							.style("fill", color)
							.attr('class', 'cr')
							.attr("r", function(d) { return (d.n==0 ? 5: d.n);  })
							.style("stroke", color)  // colour the line
							.attr("cx", function(d) { return xScale(d.direct);  })
							.attr("cy", function(d) { return yScale(d.indirect); })
							.on('mouseover', function(d, i){ 
								d3.select(this).style("stroke-width", "2");
	
								var dx = +d.direct;
									dy = +d.indirect;

								cg.append("text").attr("id", "tlp")
											.style("font-size", '12px')	
											.style("fill", d3.select(this).style("stroke"))
											.text( function(d) { return "[" + dx + "," + dy +"]"; } )
											.attr("x", function(d) { return (xScale(dx) + 10); } )
											.attr("y", function(d) { return (yScale(dy) + 10); } );										
							})
							.on('mouseout', function(d){ 
								d3.select(this).style("stroke-width", "1");
								d3.selectAll("#tlp").remove();
							})
							
							.each(function (d, i) {
								  var dr = series[i].direct;
								  var idr = series[i].indirect;
								  var pp = series[i].pp;
								  var n = series[i].n;
								  
								  var xval = xScale(dr);
								  var yval = yScale(idr);		
								  
								if (i === series.length-1) {
								  // put all your operations on the second element, e.g.
								  var outer = this;
								  d3.select(this)
									.style("fill", '#FFFFFF')
									.attr("r", function(d) { return (n==0 ? 8: n + 3);  });

								  cg.append("text")
											.attr("id", "cind")
											.style("font-size", '12px')	
											.style("fill", d3.select(this).style("stroke"))
											.text( function (d) { return $("input:checked[value="+pp+"] + span").text(); } )
											.attr("x", function(d) { return xval + 10; } )
											.attr("y", function(d) { return yval + -4; } );
											
								  cg.append("circle")
									.style("fill", color)
									.attr("r", function(d) { return (n==0 ? 5: n);  })
									.attr("cx", function(d) { return xval; })
									.attr("cy", function(d) { return yval; })
									.on('mouseover', function(d){ 
										d3.select(outer).style("stroke-width", "2");

										cg.append("text").attr("id", "tlp")
											.style("font-size", '12px')	
											.style("fill", d3.select(this).style("fill"))
											.text( function (d) { return "[" + dr + "," + idr +"]"; } )
											.attr("x", function(d) { return xval + 10; } )
											.attr("y", function(d) { return yval + 10; } );												
									})
									.on('mouseout', function(d){ 
										d3.select(outer).style("stroke-width", "1");
										d3.selectAll("#tlp").remove();
									})										
								}
								if(i > 0) {
									cg.append("line")          // attach a line
										.style("stroke", color)  // colour the line
										.style("stroke-width", "1")  // colour the line
										.attr('class', 'li')
										.attr("x1", xScale(series[i-1].direct))     // x position of the first end of the line
										.attr("y1", yScale(series[i-1].indirect))      // y position of the first end of the line
										.attr("x2", xScale(dr))     // x position of the second end of the line
										.attr("y2", yScale(idr));    // y position of the second end of the line						
								}
							});
					   }
				   }				   
            });
        }

        // Chart Initialization
        var init = function(selection) {
            selection.each(function(data) {

                // Select the svg element
                var svg = d3.select(this);

                // Create and transform the x axis group
                svg.append('g')
                    .attr('class', 'xaxis axis')
                    .attr('transform', function() {
                        var dx = margin.left,
                            dy = height - margin.top;
                        return 'translate(' + [dx, dy] + ')';
                    });

                // Create and transform the y axis group
                svg.append('g')
                    .attr('class', 'yaxis axis')
                    .attr('transform', function() {
                        var dx = margin.left,
                            dy = margin.top;

                        return 'translate(' + [dx, dy] + ')';
                    });
					
                svg.append('g')
                    .attr('class', 'chart')
                    .attr('transform', function() {
                        var dx = margin.left,
                            dy = margin.top;
                        return 'translate(' + [dx, dy] + ')';
                    });					
					
            });
        };	
        
        /// Width Accessor
        chart.width = function(w) {
            if (!arguments.length) { return width; }
            width = w;
            return chart;
        };

        /// Height Accessor
        chart.height = function(h) {
            if (!arguments.length) { return height; }
            height = h;
            return chart;
        };

        /// Range Value Accessors
        chart.minX = function(x) {
            if (!arguments.length) { return minX; }
            minX = x;
            return chart;
        };		
        chart.maxX = function(x) {
            if (!arguments.length) { return maxX; }
            maxX = x;
            return chart;
        };
        chart.minY = function(y) {
            if (!arguments.length) { return minY; }
            minY = y;
            return chart;
        };		
        chart.maxY = function(y) {
            if (!arguments.length) { return maxY; }
            maxY = y;
            return chart;
        };
		
        return chart;
    }
	
	function SliderControl() {
		// default values
		var width = 600;
		var domain = [0, 100];
		var onSlide = function(selection) { };	
		var label = '';
		var value;
		
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		
		// Charting function.
		function chart(selection) {
			selection.each(function(data) {	
				// Select the container group.
				var group = d3.select(this); 
				
				// Add a line covering the complete width.
				group.selectAll('line')
					.data([data])
					.enter()
					.append('line')
					.call(chart.initLine);
					
                // Append a circle as handler.
                var handle = group.selectAll('circle')
                    .data([data])
                    .enter().append('circle')
                    .call(chart.initHandle);	
					
				group.append('text')
					.attr("id", "lbls")
					.attr("x", function(d) { return -10; })
					.attr("y", 25)
					.attr("dy", ".35em")
					.text(function(d) { return label; });
	
                // Set the position scale.
                var posScale = d3.scale.linear()
                    .domain(domain)
                    .range([0, width]);

                // Set the position of the circle and adds the drag behavior.
                handle.attr('cx', function(d) { 
					var r = posScale(d); 
					return r;
				});

                // Create and configure the drag behavior.
                var drag = d3.behavior.drag()
                    .on('drag', moveHandle);

                handle.call(drag);

                function moveHandle(d) {
                    // Compute the future position of the handle
                    var cx = +d3.select(this).attr('cx') + d3.event.dx;

                    // Update the position if its within its valid range.
                    if ((0 < cx) && (cx < width)) {
                        // Compute the new value and rebind the data
                        d3.select(this)
                            .data([posScale.invert(cx)])
                            .attr('cx', cx)
                            .call(onSlide);
						d3.selectAll('#lbls').attr('x', cx-10);		
                    }
					
                }
				
			});
		}

        // Set the initial attributes of the line.
		chart.initLine = function(selection) {
            selection
                .attr('x1', 2)
                .attr('x2', width - 4)
                .attr('stroke', '#777')
                .attr('stroke-width', 4)
                .attr('stroke-linecap', 'round');
		}

        // Set the initial attributes of the handle.
        chart.initHandle = function(selection) {
            selection
                .attr('cx', function(d) { return width / 2; })
                .attr('r', 6)
                .attr('fill', '#aaa')
                .attr('stroke', '#222')
                .attr('stroke-width', 2);
        };
		
		// accessors
		chart.width = function(value) {
			if(!arguments.length) { return width; }
			width = value;
			return chart;
		};
		
		chart.domain = function(value) {
			if(!arguments.length) { return domain; }
			domain = value;
			return chart;		
		};
		
        chart.onSlide = function(onSlideFunction) {
            if (!arguments.length) { return onSlide; }
            onSlide = onSlideFunction;
            return chart;
        };
		
        chart.currentValue = function(val) {
            if (!arguments.length) { return value; }
			var v = parseInt(val);
			var y = Math.floor(v / 12);
			var m = v % 12;
			if(m == 0) {
				y--;
				m = 12;
			}
			
			value = y + '.' + d3.format("02")(m);
            label = months[m-1] + ' ' + y;
			
			d3.selectAll('#lbls').text(label);
            return chart;
        };
		
		return chart;			
	}	
