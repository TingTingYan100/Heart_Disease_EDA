class PieChart {
    constructor(parentElement, categorical_selection, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.categorical_selection = categorical_selection;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 60, left: 10 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.flexContainer = d3.select("#" + vis.parentElement)
            .append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "flex-start");

        vis.svg = vis.flexContainer.append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text(vis.categorical_selection)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')
            .attr('font-size', 24);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "8px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

        vis.pie = d3.pie().value(d => d.percentage);

        vis.outerRadius = vis.height / 3;
        vis.innerRadius = 0;

        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        const counts = vis.data;
        const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

        // Create a sequential color scale from 0 to 100%
        const colorScale = d3.scaleSequential()
            .domain([0, 100]) // Fixed domain for percentage range
            .interpolator(d3.interpolateBlues);

        vis.displayData = {
            category: vis.categorical_selection,
            total,
            details: Object.entries(counts).map(([key, count]) => {
                const percentage = (count / total) * 100;
                return {
                    key,
                    count,
                    percentage: percentage.toFixed(2),
                    color: colorScale(percentage)
                };
            })
        };

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        let arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData['details']));

        // ENTER
        arcs.enter()
            .append("path")
            .attr("class", "arc")
            .attr("d", vis.arc)
            .merge(arcs)
            .style("fill", d => d.data.color)
            .on('mouseover', function (event, d) {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div>
                            <h3>${d.data.key}</h3>
                            <h5>Percentage: ${d.data.percentage}%</h5>
                            <h5>Count: ${d.data.count}</h5>
                        </div>`);
            })
            .on('mouseout', function () {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // EXIT
        arcs.exit().remove();

        vis.createLegend(vis.flexContainer);
        vis.createColorScaleLegend();
    }

    createLegend(container) {
        let vis = this;

        // Append the legend container
        const legendContainer = container.append("div")
            .attr("class", "legend");

        // Populate legend
        vis.displayData['details'].forEach(item => {
            const legendItem = legendContainer
                .append("div")
                .attr("class", "legend-item")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "5px");

            // Add color box
            legendItem.append("span")
                .style("background-color", item.color)
                .style("display", "inline-block")
                .style("width", "15px")
                .style("height", "15px")
                .style("margin-right", "8px");

            legendItem.append("span")
                .text(`${item.key}: ${item.percentage}% (Count: ${item.count})`);
        });
    }

    createColorScaleLegend() {
        let vis = this;

        const colorScaleWidth = vis.width * 0.5;
        const colorScaleHeight = 15;

        const colorScaleLegend = vis.svg.append("g")
            .attr("class", "color-scale-legend")
            .attr("transform", `translate(${(vis.width - colorScaleWidth) / 2}, ${vis.height + vis.margin.bottom - 80})`);

        const defs = vis.svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "color-gradient");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d3.interpolateBlues(0));

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d3.interpolateBlues(1));

        colorScaleLegend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", colorScaleWidth)
            .attr("height", colorScaleHeight)
            .style("fill", "url(#color-gradient)");

        colorScaleLegend.append("text")
            .attr("x", 0)
            .attr("y", colorScaleHeight + 15)
            .text("0%")
            .style("font-size", "10px");

        colorScaleLegend.append("text")
            .attr("x", colorScaleWidth)
            .attr("y", colorScaleHeight + 15)
            .text("100%")
            .style("font-size", "10px")
            .attr("text-anchor", "end");

        colorScaleLegend.append("text")
            .attr("x", colorScaleWidth / 2)
            .attr("y", colorScaleHeight + 30)
            .attr("text-anchor", "middle")
            .text("Percentage Contribution")
            .style("font-size", "12px")
            .style("font-weight", "bold");
    }
}
