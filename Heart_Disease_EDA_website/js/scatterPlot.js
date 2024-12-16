class scatterPlot {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = data;
        this.highlightMode = false;
        this.brushMode = false;
        this.selectedPoints = [];
        this.initVis();
    }

    initVis() {
        let vis = this
        vis.margin = {top: 80, right: 100, bottom: 100, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        vis.svg.append('g')
            .attr('class', 'title scatter-title')
            .append('text')
            .text("Scatter Plot")
            .attr("font-size", 30)
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');
        vis.xScale = d3.scalePoint()
            .range([0, vis.width])
            .padding(0.5);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        vis.colorScale = d3.scaleOrdinal()
            .domain(["No", "Yes"])
            .range(["blue", "red"]);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`);
        vis.yAxisGroup = vis.svg.append("g")
        vis.svg.append("text")
            .attr("class", "x-axis-title")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom -65)
            .attr("text-anchor", "middle")
        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 65)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width}, 10)`);
        legend.append("text")
            .attr("class", "legend-title")
            .attr("x", 0)
            .attr("y", -10)
            .text("Heart Disease")
            .style("font-size", "14px")
            .attr("text-anchor", "start");
        const legendData = vis.colorScale.domain();
        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .each(function(d, i) {
                d3.select(this)
                    .append("circle")
                    .attr("cy", i * 3 + 7)
                    .attr("r", 7)
                    .attr("fill", vis.colorScale(d));
                d3.select(this)
                    .append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .text(d)
                    .style("font-size", "12px");
            });
        const legendBox = legend.node().getBBox();
        legend.insert("rect", ":first-child")
            .attr("x", legendBox.x - 10)
            .attr("y", legendBox.y - 10)
            .attr("width", legendBox.width + 20)
            .attr("height", legendBox.height + 20)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("rx", 5);

        vis.tooltip = d3.select("body").append("div")
            .attr("id", "scatter-tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("display", "none")
            .style("pointer-events", "none");

        vis.brush = d3.brush()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("start brush end", function(event) {
                if (vis.highlightMode && vis.brushMode) {
                    const selection = event.selection;

                    if (selection) {
                        const [[x0, y0], [x1, y1]] = selection;

                        vis.filteredData.forEach(d => {
                            const cx = vis.xScale(d.x) + d.cxOffset;
                            const cy = vis.yScale(d.y);

                            // Check if the point is inside the brushed area
                            if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                                // Check if the point already exists in vis.selectedPoints
                                const alreadySelected = vis.selectedPoints.some(point => point.id === d.id);
                                const originalData = vis.data.find(dataPoint => dataPoint.id === d.id);

                                if (!alreadySelected) {
                                    vis.selectedPoints.push(originalData); // Add to selected points if not already there
                                }
                            }
                        });
                        vis.updateVis()
                        vis.updateHistogram()

                    }

                    if (event.type === "end") {
                        // Clear the brush after selection
                        vis.clearBrush();
                    }
                }
            });

        // Add brush container
        vis.brushContainer = vis.svg.append("g")
            .attr("class", "brush")
            .style("pointer-events", "none") // Disable interactions by default
            .call(vis.brush);



    }

    clearBrush() {
        let vis = this;
        vis.brushContainer.call(vis.brush.move, null);
    }

    wrangleData(xAxis, yAxis) {
        let vis = this
        const jitterAmount = 150;
        vis.filteredData = this.data.map(d => ({
            id: d.id,
            x: dataMapping[xAxis] ? dataMapping[xAxis][d[xAxis]] : d[xAxis],
            y: +d[yAxis],
            heartDisease: dataMapping["HeartDisease"][d["HeartDisease"]],
            cxOffset: (Math.random() - 0.5) * jitterAmount,
        }));
        if (xAxis === "NumMajorVessels") {
            vis.xScale.domain(["0", "1", "2", "3"]);
        } else {
            vis.xScale.domain([...new Set(vis.filteredData.map(d => d.x))]);
        }
        vis.svg.select(".x-axis-title").text(xAxis);
        vis.svg.select(".y-axis-title").text(yAxis);
        vis.updateVis();

    }

    updateVis() {

        let vis = this;
        vis.yScale.domain(d3.extent(vis.filteredData, d => d.y));


        vis.xAxisGroup.call(d3.axisBottom(vis.xScale));
        vis.yAxisGroup.call(d3.axisLeft(vis.yScale));
        const circles = vis.svg.selectAll(".dot")
            .data(vis.filteredData);

        circles.enter()
            .append("circle")
            .attr("class", "dot")

            .merge(circles)
            .on("mouseover", function(event, d) {
                if (!vis.highlightMode) {
                    const rawDataPoint = vis.data.find(dataPoint => dataPoint.id === d.id);

                    // Generate tooltip
                    const tooltipContent = Object.entries(rawDataPoint)
                        .map(([key, value]) => `<b>${key}:</b> ${value}`)
                        .join("<br>");

                    vis.tooltip
                        .style("display", "block")
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`)
                        .html(tooltipContent);

                    // Dynamically adjust tooltip position
                    const tooltipWidth = vis.tooltip.node().offsetWidth;
                    const tooltipHeight = vis.tooltip.node().offsetHeight;
                    const pageWidth = window.innerWidth;
                    const pageHeight = window.innerHeight;

                    let tooltipX = event.pageX + 10;
                    let tooltipY = event.pageY + 10;

                    // Adjust for right overflow
                    if (tooltipX + tooltipWidth > pageWidth) {
                        tooltipX = event.pageX - tooltipWidth - 10;
                    }

                    // Adjust for bottom overflow
                    if (tooltipY + tooltipHeight > pageHeight) {
                        tooltipY = event.pageY - tooltipHeight - 10;
                    }

                    vis.tooltip
                        .style("left", `${tooltipX}px`)
                        .style("top", `${tooltipY}px`);
                }
            })
            .on("mouseout", function() {
                vis.tooltip.style("display", "none");
            })

            .on("click", function(event, d) {
                if (vis.highlightMode) {
                    const originalData = vis.data.find(dataPoint => dataPoint.id === d.id);

                    const index = vis.selectedPoints.findIndex(point => point.id === originalData.id);

                    if (index === -1) {
                        vis.selectedPoints.push(originalData);
                    } else {
                        vis.selectedPoints.splice(index, 1);
                    }

                    d3.select(this)
                        .attr("fill", index === -1 ? "green" : d => vis.colorScale(d.heartDisease))
                    vis.updateHistogram(); // Update histogram when points are selected
                }
            })

            .transition()
            .duration(200)
            .attr("cx", d => vis.xScale(d.x) + d.cxOffset)
            .attr("cy", d => vis.yScale(d.y))
            .attr("r", 5)
            .attr("fill", d => {
                const isSelected = vis.selectedPoints.some(point => point.id === d.id);
                return isSelected ? "green" : vis.colorScale(d.heartDisease);})
            .attr("opacity", 0.7)
            .attr("stroke", "black");

        circles.exit()
            .transition()
            .duration(200)
            .attr("opacity", 0)
            .remove();

        if (!(vis.highlightMode && vis.brushMode)) {
            vis.svg.on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, this);
                const distances = vis.filteredData.map(d => {
                    const circleX = vis.xScale(d.x) + d.cxOffset;
                    const circleY = vis.yScale(d.y);
                    const distance = Math.sqrt(
                        Math.pow(circleX - mouseX, 2) + Math.pow(circleY - mouseY, 2)
                    );
                    return { d, distance };
                });
                distances.sort((a, b) => a.distance - b.distance);
                const closestCircles = distances.slice(0, 5).map(obj => obj.d);
                circles.each(function (d) {
                    const circle = d3.select(this);
                    const circleX = vis.xScale(d.x) + d.cxOffset;
                    const circleY = vis.yScale(d.y);
                    if (closestCircles.includes(d)) {
                        circle
                            .transition()
                            .duration(100)
                            .attr("opacity", 1)
                            .attr("r", d === distances[0].d ? 10 : 8)
                            .attr("stroke-width", d === distances[0].d ? 2 : 1.5);
                    } else {
                        // Skip animations entirely if highlightMode && brushMode
                        if (!(vis.highlightMode && vis.brushMode)) {
                            const dx = circleX - mouseX;
                            const dy = circleY - mouseY;
                            const angle = Math.atan2(dy, dx);
                            circle
                                .transition()
                                .duration(2)
                                .attr("cx", circleX + Math.cos(angle) * 10)
                                .attr("cy", circleY + Math.sin(angle) * 10)
                                .attr("opacity", 0.3)
                                .attr("r", 5)
                                .attr("stroke-width", 1);
                        }
                    }
                });
            });

            vis.svg.on("mouseleave", function () {
                circles
                    .transition()
                    .duration(1000)
                    .attr("cx", d => vis.xScale(d.x) + d.cxOffset)
                    .attr("cy", d => vis.yScale(d.y))
                    .attr("opacity", 0.7)
                    .attr("r", 5)
                    .attr("stroke-width", 1);
            });
        } else {

            vis.svg.on("mousemove", null);
            vis.svg.on("mouseleave", null);
        }

        // Enable or disable brushing
        if (vis.highlightMode && vis.brushMode) {
            vis.brushContainer.style("pointer-events", "all");
            vis.svg.select(".brush").call(vis.brush); // Enable brush with event listeners
        } else {
            vis.brushContainer.style("pointer-events", "none");
            vis.svg.select(".brush").on(".brush", null); // Remove brush event listeners
            vis.svg.select(".brush").call(vis.brush.move, null); // Clear any existing brush rectangle
        }
    }

    updateHistogram() {
        const category = document.getElementById("histogramCategory").value;
        const messageElement = document.getElementById("histogramErrorMessage");

        // Keep track of the previous number of selected points
        if (!this.previousSelectedCount) this.previousSelectedCount = 0;

        if (this.selectedPoints.length === 0) {
            // Show the helpful message if no points are selected
            messageElement.style.display = "block";

            // Clear the histogram only if it exists
            if (this.previousSelectedCount > 0) {
                d3.select("#histogram").select("svg").remove();
            }

            this.previousSelectedCount = 0;
            return;
        }

        // Hide the message if points are selected
        messageElement.style.display = "none";

        // Initialize or update the histogram only if transitioning from 0 to 1+ points
        if (this.previousSelectedCount === 0) {
            d3.select("#histogram").select("svg").remove(); // Clear any existing histogram
            this.histogram = new Histogram("histogram", this.data);

        }
        this.histogram.updateVis(this.selectedPoints, category);
        this.previousSelectedCount = this.selectedPoints.length;
    }
}