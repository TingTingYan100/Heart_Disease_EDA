class Histogram {
    constructor(parentElement, rawData) {
        this.parentElement = parentElement;
        this.rawData = rawData;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 100, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Initialize axes groups
        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`);
        vis.yAxisGroup = vis.svg.append("g");

        // Add axis labels
        vis.svg.append("text")
            .attr("class", "x-axis-title")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 5)
            .attr("text-anchor", "middle")
            .text("Sex");

        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 10)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Count");
    }

    updateVis(data, category) {
        let vis = this;

        // Update axis titles
        vis.svg.select(".x-axis-title").text(category);

        if (categoryTypes[category] === "numerical") {
            const bins = d3.bin()
                .domain(d3.extent(vis.rawData, d => +d[category]))
                .thresholds(9)
                .value(d => +d[category])(data);

            vis.processedData = bins.map(bin => {
                const counts = d3.rollup(
                    bin,
                    v => v.length,
                    d => d.HeartDisease
                );

                return {
                    key: `${bin.x0.toFixed(1)} - ${bin.x1.toFixed(1)}`,
                    values: [
                        { status: "No", count: counts.get("0") || 0 },
                        { status: "Yes", count: counts.get("1") || 0 }
                    ]
                };
            });
        } else {
            const mappedData = data.map(d => ({
                ...d,
                [category]: mapToWord(category, d[category])
            }));

            const groupedData = d3.group(mappedData, d => d[category], d => d.HeartDisease);

            vis.processedData = Array.from(groupedData, ([key, subgroups]) => ({
                key,
                values: [
                    { status: "No", count: subgroups.get("0")?.length || 0 },
                    { status: "Yes", count: subgroups.get("1")?.length || 0 }
                ]
            }));
        }

        // Scales
        vis.xScale = d3.scaleBand()
            .domain(vis.processedData.map(d => d.key))
            .range([0, vis.width])
            .paddingInner(0.2)
            .paddingOuter(0.1);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.processedData, d => d.values.reduce((sum, v) => sum + v.count, 0))])
            .nice()
            .range([vis.height, 0]);

        // Axes
        vis.xAxisGroup.call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        vis.yAxisGroup.call(d3.axisLeft(vis.yScale));

        // Bars
        const bars = vis.svg.selectAll(".bar-group")
            .data(vis.processedData);

        const colorScale = d3.scaleOrdinal()
            .domain(["No", "Yes"])
            .range(["blue", "red"]);

        bars.exit().remove();

        const stackedBars = bars.enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(${vis.xScale(d.key)}, 0)`);

        stackedBars.selectAll("rect")
            .data(d => d.values)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", vis.height)
            .attr("width", vis.xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", d => colorScale(d.status))
            .transition()
            .duration(500)
            .attr("y", (d, i, nodes) => {
                const previousCounts = d3.sum(nodes.slice(0, i).map(node => +node.__data__.count));
                return vis.yScale(previousCounts + d.count);
            })
            .attr("height", d => vis.height - vis.yScale(d.count));

        bars.merge(stackedBars)
            .attr("transform", d => `translate(${vis.xScale(d.key)}, 0)`)
            .selectAll("rect")
            .data(d => d.values)
            .transition()
            .duration(500)
            .attr("width", vis.xScale.bandwidth())
            .attr("y", (d, i, nodes) => {
                const previousCounts = d3.sum(nodes.slice(0, i).map(node => +node.__data__.count));
                return vis.yScale(previousCounts + d.count);
            })
            .attr("height", d => vis.height - vis.yScale(d.count))
            .attr("fill", d => colorScale(d.status));
    }
}