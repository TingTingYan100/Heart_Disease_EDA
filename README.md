
# **Multivariate Analysis and Prediction of Heart Disease**

## **Dataset**
The project uses the **Heart Disease Dataset** from the UC Irvine Machine Learning Repository.  
[Link to Dataset](https://archive.ics.uci.edu/datasets)

---

## **Files**
| File Name                                                  | Description                                                                                          |
|------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| **`index.html`**                                           | Main HTML file for the project.                                                                     |
| **`css/styles.css`**                                       | Contains styles for the visualizations, animations, and layout.                                     |
| **`js/scatterPlot.js`**                                    | JavaScript for the scatter plot visualization with zoom and brush modes.                            |
| **`js/pieChart.js`**                                       | JavaScript for creating pie charts with tooltips for categorical features.                          |
| **`js/barchart.js`**                                       | JavaScript for generating bar charts to display feature importance.                                 |
| **`js/main.js`**                                           | Handles application initialization, reads data, event listeners, and facilitates interactions between visualizations. |
| **`js/processData.js`**                                    | Contains functions to preprocess, clean, and structure the dataset for use in visualizations.       |
| **`js/histogram.js`**                                      | JavaScript for creating histograms to display distributions of selected categories from scatterplot. |
| **`data/final_dataset_heart_disease.csv`**                 | The dataset containing heart disease data used in the visualizations.                               |
| **`data/feature_importance.csv`**                          | Feature importance scores used in bar chart visualizations.                                         |
| **`fields_description.txt`**                              | Description of the dataset fields, including types and explanations for each column.                |
| **`CS171 Final Project Process Book.pdf`**                | Documentation of the project process, including motivation, design choices, and testing.            |

---

## **Data Field Descriptions**

### **Data Fields in Raw Dataset**
| Field Name             | Description                                                                                   |
|------------------------|-----------------------------------------------------------------------------------------------|
| `age`                 | Age of the patient (in years) - Quantitative                                                  |
| `sex`                 | Gender of the patient (`Male/Female`) - Categorical                                           |
| `cp`                  | Chest pain type (`typical angina, atypical angina, non-anginal, asymptomatic`) - Categorical   |
| `trestbps`            | Resting blood pressure (in mm Hg on admission to the hospital) - Quantitative                 |
| `chol`                | Serum cholesterol in mg/dl - Quantitative                                                     |
| `fbs`                 | Fasting blood sugar (`>120 mg/dl`: yes/no) - Categorical                                      |
| `restecg`             | Resting electrocardiographic results (`normal, ST abnormality, LV hypertrophy`) - Categorical |
| `thalach`             | Maximum heart rate achieved - Quantitative                                                   |
| `exang`               | Exercise-induced angina (`True/False`) - Categorical                                          |
| `oldpeak`             | ST depression induced by exercise relative to rest - Quantitative                             |
| `slope`               | Slope of the peak exercise ST segment (`upsloping, flat, downsloping`) - Categorical          |
| `ca`                  | Number of major vessels (0-3) colored by fluoroscopy - Ordinal                                |
| `num`                 | Predicted attribute (`0`: no heart disease, `1-4`: increasing severity) - Ordinal             |

### **Data Field Names in Code (Mapped to Raw Fields)**
| Field in Code                   | Corresponding Raw Field                    |
|---------------------------------|--------------------------------------------|
| `Age`                           | `age`                                      |
| `Gender`                        | `sex`                                      |
| `ChestPain`                     | `cp`                                       |
| `RestingBP`                     | `trestbps`                                 |
| `Chol`                          | `chol`                                     |
| `FastingBloodSugar`             | `fbs`                                      |
| `RestingECGResults`             | `restecg`                                  |
| `MaxHRAchieved`                 | `thalach`                                  |
| `Exercise-InducedAngina`        | `exang`                                    |
| `Exercise_Induced_ST_Depression`| `oldpeak`                                  |
| `SlopeofPeakExercise`           | `slope`                                    |
| `NumMajorVessels`               | `ca`                                       |
| `HeartDisease`                  | `num`                                      |
| `id`                            | Added Unique ID for each patient (`1-920`) |

---

## **Attributions**
- **Dataset:** [UC Irvine Machine Learning Repository](https://archive.ics.uci.edu/dataset/45/heart+disease)
- **D3.js:** [D3.js Library](https://d3js.org/)

---