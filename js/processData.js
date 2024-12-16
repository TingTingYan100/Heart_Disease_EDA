
const dataMapping = {
    "Gender": {
        "1": "Male",
        "0": "Female"
    },
    "ChestPain": {
        "4": "Asymptomatic",
        "3": "Non-Anginal Pain",
        "2": "Atypical Angina",
        "1": "Typical Angina"
    },
    "FastingBloodSugar": {
        "0": "< 120 mg/dl",
        "1": "> 120 mg/dl"
    },
    "RestingECGResults": {
        "0": "Normal",
        "2": "ST-T Abnormality",
        "1": "Left Ventricular Hypertrophy"
    },
    "Exercise-InducedAngina": {
        "0": "No",
        "1": "Yes"
    },
    "SlopeofPeakExercise": {
        "2": "Flat",
        "1": "Upsloping",
        "3": "Downsloping"
    },

    "HeartDisease": {
        "0": "No",
        "1": "Yes"
    },
    "NumMajorVessels": {
        "0": "0",
        "1": "1",
        "2": "2",
        "3": "3",

    }
};

const mapToWord = (category, value) => {
    const categoryMapping = dataMapping[category];
    if (categoryMapping && categoryMapping[value] !== undefined) {
        return categoryMapping[value];
    }
    return "Unknown";
};

const categoryTypes = {
    "Gender": "categorical",
    "ChestPain": "categorical",
    "FastingBloodSugar": "categorical",
    "RestingECGResults": "categorical",
    "Exercise-InducedAngina": "categorical",
    "SlopeofPeakExercise": "categorical",
    "HeartDisease": "categorical",
    "NumMajorVessels": "categorical",
    "Age": "numerical",
    "RestingBP": "numerical",
    "chol": "numerical",
    "MaxHRAchieved": "numerical",
    "Exercise_Induced_ST_Depression": "numerical"
};
