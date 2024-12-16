class BarChart {
    constructor(parentElement, data, highlightedFeature) {
        this.parentElement = parentElement;

        // Normalize importance values to percentages
        const totalImportance = data.reduce((sum, d) => sum + d.Importance, 0);
        this.data = data.map(d => ({ ...d, Importance: (d.Importance / totalImportance) * 100 }));
        this.highlightedFeature = highlightedFeature;
        this.initVis();
    }

    // Initialize visualization
    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 200, bottom: 150, left: 300 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Initialize scales and axes
        vis.x = d3.scaleLinear().range([0, vis.width]);
        vis.y = d3.scaleBand().range([0, vis.height]).padding(0.2);
        vis.xAxisGroup = vis.svg.append("g").attr("transform", `translate(0,${vis.height})`);
        vis.yAxisGroup = vis.svg.append("g");

        // Add axis labels
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 50)
            .attr("text-anchor", "middle")
            .text("Feature Importance (%)")
            .style("font-size", "30px");

        vis.svg.append("text")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 100)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Features")
            .style("font-size", "30px");

        // Add tooltip
        vis.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "8px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);
        // Add footnote and source
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 75)
            .attr("text-anchor", "middle")
            .attr("fill", "#666")
            .style("font-size", "10px")
            .text("*Feature Importance from Random Forest Classifier (Random State = 109)");


        vis.svg.append("text")
            .attr("x", vis.width / 2 - 180)
            .attr("y", vis.height + 120)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .style("font-size", "20px")
            .text("Source: All Visualizations Generated Using Data From ");


        vis.svg.append("a")
            .attr("xlink:href", "https://archive.ics.uci.edu/dataset/45/heart+disease") // Link to UC Irvine Machine Learning Repository
            .attr("target", "_blank")
            .append("text")
            .attr("x", vis.width / 2 + 172)
            .attr("y", vis.height + 120)
            .attr("text-anchor", "middle")
            .attr("fill", "blue")
            .style("font-size", "20px")
            .text("UC Irvine Machine Learning Repository");

        // Add heart visualization
        const scaleFactor = 3; // Scaling factor for the heart shape
        const heart = (t) => {
            const x = 16 * Math.sin(t) ** 3;
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return [x * scaleFactor, y * scaleFactor];
        };

        const totalSegments = 1000; // Number of heart shape segments
        const heartPoints = d3.range(0, Math.PI * 2, (Math.PI * 2) / totalSegments).map(heart);

        let totalArea = 0;
        for (let i = 1; i < heartPoints.length; i++) {
            const [x1, y1] = heartPoints[i - 1];
            const [x2, y2] = heartPoints[i];
            totalArea += (x1 * y2 - x2 * y1) / 2;
        }
        totalArea = Math.abs(totalArea);

        vis.heartPaths = [];
        let currentIndex = 0;

        vis.data.forEach((d, i) => {
            const targetArea = (d.Importance * totalArea) / 100;
            let areaCovered = 0;
            const points = [heartPoints[currentIndex]];

            while (areaCovered < targetArea && currentIndex < heartPoints.length - 1) {
                const [x1, y1] = heartPoints[currentIndex];
                const [x2, y2] = heartPoints[currentIndex + 1];
                areaCovered += Math.abs((x1 * y2 - x2 * y1) / 2);
                points.push(heartPoints[++currentIndex]);
            }

            points.push([0, 0]); // Close the shape

            vis.heartPaths.push(
                vis.svg.append("path")
                    .datum(points)
                    .attr("d", d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveLinearClosed))
                    .attr("fill", d.Feature === vis.highlightedFeature ? "green" : "lightpink")
                    .attr("opacity", 0.9)
                    .attr("transform", `translate(${vis.width - 100}, ${vis.height - 100})`)
            );
        });

        vis.updateVis();
    }

    // Sort descending
    wrangleData() {
        this.displayData = [...this.data].sort((a, b) => b.Importance - a.Importance);
    }


    updateVis() {
        let vis = this;

        vis.wrangleData();

        vis.x.domain([0, d3.max(vis.displayData, d => d.Importance)]);
        vis.y.domain(vis.displayData.map(d => d.Feature));
        vis.xAxisGroup.call(d3.axisBottom(vis.x).ticks(6).tickFormat(d => `${d}%`));
        vis.yAxisGroup.call(d3.axisLeft(vis.y));

        let bars = vis.svg.selectAll(".bar").data(vis.displayData, d => d.Feature);


        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => vis.y(d.Feature))
            .attr("height", vis.y.bandwidth())
            .attr("width", 0)
            .attr("fill", d => d.Feature === vis.highlightedFeature ? "green" : "cornflowerblue")
            .merge(bars)
            .each(function (d) {
                if (d.Feature === vis.highlightedFeature) {
                    vis.svg.append("text")
                        .attr("class", "highlight-text")
                        .attr("x", vis.x(d.Importance) / 2)
                        .attr("y", vis.y(d.Feature) + vis.y.bandwidth() / 2)
                        .attr("text-anchor", "middle")
                        .attr("dy", ".35em")
                        .attr("fill", "white")
                        .style("font-size", "12px")
                        .text("You guessed");
                }
            })
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "orange");
                        // Highlight corresponding heart path
                vis.heartPaths[vis.displayData.findIndex(item => item.Feature === d.Feature)]
                    .attr("fill", "orange");

                vis.tooltip.style("opacity", 1)
                    .html(`<strong>Feature:</strong> ${d.Feature}<br><strong>Percentage:</strong> ${d3.format(".2f")(d.Importance)}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mousemove", function (event) {
                vis.tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("fill", d.Feature === vis.highlightedFeature ? "green" : "cornflowerblue");

                // Reset heart path color
                vis.heartPaths[vis.displayData.findIndex(item => item.Feature === d.Feature)]
                    .attr("fill", d.Feature === vis.highlightedFeature ? "green" : "lightpink");

                vis.tooltip.style("opacity", 0);
            })
            .transition()
            .duration(800)
            .attr("width", d => vis.x(d.Importance));

        // Add/update value labels
        let labels = vis.svg.selectAll(".value-label").data(vis.displayData, d => d.Feature);

        labels.enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", 0)
            .attr("y", d => vis.y(d.Feature) + vis.y.bandwidth() / 2)
            .attr("dy", ".35em")
            .merge(labels)
            .transition()
            .duration(800)
            .attr("x", d => vis.x(d.Importance) + 5)
            .text(d => `${d3.format(".2f")(d.Importance)}%`);

    }
}
