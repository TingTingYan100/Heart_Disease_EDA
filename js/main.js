let buttonsRemoved = false; // Track whether buttons have been removed

d3.csv("data/final_dataset_heart_disease.csv")
    .then(data => {
        data.forEach((d, i) => {
            d.id = i; // Assign a unique ID to each data point
            d.Age = +d.Age;
            d.RestingBP = +d.RestingBP;
            d.chol = +d.chol;
            d.MaxHRAchieved = +d.MaxHRAchieved;
            d.Exercise_Induced_ST_Depression = +d.Exercise_Induced_ST_Depression;
            d.NumMajorVessels = +d.NumMajorVessels;
        });

        const PieChartFields = [
            "Gender",
            "ChestPain",
            "FastingBloodSugar",
            "RestingECGResults",
            "Exercise-InducedAngina",
            "SlopeofPeakExercise"
        ];

        //Preprocessing for PIECHARTS
        const PieChartData = {};

        PieChartFields.forEach(field => {
            PieChartData[field] = {};

            data.forEach(d => {
                const value = d[field];
                PieChartData[field][value] = (PieChartData[field][value] || 0) + 1; // Count occurrences
            });
        });



        const mappedData = {};
        Object.keys(PieChartData).forEach(category => {
            mappedData[category] = {};
            Object.entries(PieChartData[category]).forEach(([key, count]) => {
                const mappedKey = mapToWord(category, key);
                mappedData[category][mappedKey] = count;
            });
        });

        document.getElementById('showAllButton').addEventListener('click', () => {
            document.getElementById("pieChartContainer").innerHTML = "";
            document.getElementById("button-container").style.display = "none";
            // Create six small pie charts
            Object.keys(mappedData).forEach((category, index) => {

                let pieChartContainer = document.createElement("div");
                pieChartContainer.setAttribute("id", `pieChart-${category}`);
                pieChartContainer.setAttribute("class", "small-pie-chart");
                document.getElementById("pieChartContainer").appendChild(pieChartContainer);

                smallPieChart = new PieChart(`pieChart-${category}`, category, mappedData[category]);
            })
        })





        newScatterPlot = new scatterPlot("scatterPlot", data);
        // Initial plot
        let xAxis = "Gender";
        let yAxis = "Age";
        newScatterPlot.wrangleData(xAxis, yAxis);
        newScatterPlot.updateVis();

        // Update on dropdown change
        d3.select("#xAxis").on("change", function() {
            xAxis = this.value;
            newScatterPlot.wrangleData(xAxis, yAxis);
        });
        d3.select("#yAxis").on("change", function() {
            yAxis = this.value;
            newScatterPlot.wrangleData(xAxis, yAxis);
        });
    })
    .catch(error => {
        console.error("Error reading CSV:", error);
    });

document.getElementById("toggleMode").addEventListener("click", function () {
    newScatterPlot.highlightMode = !newScatterPlot.highlightMode;

    // Update button text
    this.innerText = newScatterPlot.highlightMode
        ? "Switch to Tooltip Mode"
        : "Switch to Highlight Mode";

    // Update the visualization to reflect the configurations
    newScatterPlot.updateVis();
});

document.getElementById("resetButton").addEventListener("click", function () {
    newScatterPlot.selectedPoints = [];
    d3.select("#histogram").select("svg").remove();
    newScatterPlot.updateVis()
    newScatterPlot.updateHistogram()
})

document.getElementById("enableBrushMode").addEventListener("click", function() {
    newScatterPlot.brushMode = !newScatterPlot.brushMode;
    this.textContent = newScatterPlot.brushMode ? "Disable Dragging for Point Selection" : "Enable Dragging for Point Selection";
    newScatterPlot.updateVis();
});

document.getElementById("histogramCategory").addEventListener("change", function() {
    if (newScatterPlot.highlightMode) {
        newScatterPlot.updateHistogram();
    }
});





let featureImportanceData = [];

d3.csv("data/feature_importance.csv")
    .then(data => {
        featureImportanceData = data.map(d => ({
            Feature: d.Feature,
            Importance: +d.Importance
        }));

    })
    .catch(error => {
        console.error("Error reading CSV:", error);
    });

// Initial call to render the buttons
const container = document.querySelector("#heart-container");
const pulsatingHeartContainer = document.querySelector("#pulsating-heart");
createHeartButtons(container, pulsatingHeartContainer, 12);

window.addEventListener("resize", () => {
    createHeartButtons(container, pulsatingHeartContainer, 12);
});

function createHeartButtons(container, pulsatingHeartContainer, numButtons = 12) {
    // Heart shape equations
    const heartX = (t) => 16 * Math.pow(Math.sin(t), 3);
    const heartY = (t) =>
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    // Remove only buttons
    Array.from(container.children).forEach((child) => {
        if (child.tagName === "BUTTON") {
            child.remove();
        }
    });

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Scale and center calculations
    const scaleX = width / 40;
    const scaleY = height / 40;
    const centerX = width / 2;
    const centerY = height / 2;

    const featureNames = [
        "ChestPain",
        "MaxHRAchieved",
        "Exercise_Induced_ST_Depression",
        "Cholesterol",
        "Age",
        "RestingBP",
        "Exercise-InducedAngina",
        "NumMajorVessels",
        "Gender",
        "RestingECGResults",
        "SlopeofPeakExercise",
        "FastingBloodSugar",
    ];


// Generate button positions and create buttons if not already removed
    if (!buttonsRemoved) {
        for (let i = 0; i < numButtons; i++) {
            const t = (Math.PI * 2 * i) / numButtons;
            const x = heartX(t);
            const y = heartY(t);

            const button = document.createElement("button");
            button.innerText = featureNames[i];
            button.className = "heart_button";
            button.style.position = "absolute";
            button.style.left = `${centerX + x * scaleX - 15}px`;
            button.style.top = `${centerY - y * scaleY - 15}px`;

            container.appendChild(button);

            // Add click event listener
            button.addEventListener("click", () => {
                const buttonName = button.innerText;

                // Remove all buttons
                container.innerHTML = "";
                buttonsRemoved = true; // Mark buttons as removed

                // Show pulsating heart and update the chart
                pulsatingHeartContainer.style.display = "block";
                pulsatingHeartContainer.style.visibility = "visible";

                document.querySelector(".center-text").innerHTML =
                    `You Guessed: <b>${buttonName.toUpperCase()}</b>!`;

                setTimeout(() => {
                    pulsatingHeartContainer.style.display = "none";
                    featureImportanceBarChart = new BarChart("heart-container", featureImportanceData, buttonName);
                }, 1500);
            });
        }
    }
}






//Heartbeat animation for the first page
const hearts = [
    document.getElementById("heart1"),
    document.getElementById("heart2"),
    document.getElementById("heart3"),
    document.getElementById("heart4"),
];

// Heart Beating Speed
const durations = [400, 600, 800, 1200];

// Sequentially play animations
function animateHearts() {
    let currentIndex = 0;

    function playNextHeart() {
        if (currentIndex < hearts.length) {
            const heart = hearts[currentIndex];
            const duration = durations[currentIndex];

            heart.style.animation = `pulsate ${duration}ms infinite ease-in-out`;
            setTimeout(() => {
                heart.style.animation = '';
                currentIndex++;
                playNextHeart();
            }, 2000);
        } else {

            currentIndex = 0;
            setTimeout(() => {
                playNextHeart();
            }, 100);
        }
    }
    playNextHeart();
}
animateHearts();