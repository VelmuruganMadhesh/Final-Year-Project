from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pickle
import os
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

MODEL_PATH = "disease_model.pkl"
DATASET_PATH = "disease_prediction.csv"

logging.basicConfig(level=logging.INFO)

model = None
label_encoder = None
symptom_columns = None


def initialize_model():
    global model, label_encoder, symptom_columns

    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model, label_encoder, symptom_columns = pickle.load(f)
        logging.info("Model loaded from file.")
        return

    data = pd.read_csv(DATASET_PATH)

    X = data.drop("prognosis", axis=1)
    y = data["prognosis"]

    symptom_columns = X.columns.tolist()

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=1000,
        max_depth=30,
        random_state=42
    )

    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    logging.info(f"Model trained. Accuracy: {accuracy}")

    with open(MODEL_PATH, "wb") as f:
        pickle.dump((model, label_encoder, symptom_columns), f)


def prepare_input(symptoms):

    vector = [0] * len(symptom_columns)

    for symptom in symptoms:
        symptom = symptom.lower().replace(" ", "_")

        if symptom in symptom_columns:
            index = symptom_columns.index(symptom)
            vector[index] = 1

    return np.array(vector).reshape(1, -1)


def predict_disease(symptoms, age, medical_history):

    vector = prepare_input(symptoms)

    prediction = model.predict(vector)[0]
    probabilities = model.predict_proba(vector)[0]

    confidence = round(max(probabilities) * 100, 2)

    disease = label_encoder.inverse_transform([prediction])[0]

    risk_level = "low"

    if age > 60 or confidence < 50:
        risk_level = "high"
    elif age > 40:
        risk_level = "medium"

    recommendations = [
        f"Possible disease detected: {disease}",
        "Consult a doctor for confirmation",
        "Drink fluids and monitor symptoms"
    ]

    if risk_level == "high":
        recommendations.append("Immediate medical consultation recommended")

    return {
        "disease": disease,
        "confidence": confidence,
        "riskLevel": risk_level,
        "recommendations": recommendations
    }


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.json

        symptoms = data.get("symptoms", [])
        age = int(data.get("age", 30))
        medical_history = data.get("medicalHistory", [])

        if not symptoms:
            return jsonify({"error": "Symptoms required"}), 400

        result = predict_disease(symptoms, age, medical_history)

        return jsonify(result)

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": "Prediction failed"}), 500


@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "modelLoaded": model is not None,
        "timestamp": datetime.now().isoformat()
    })


if __name__ == "__main__":

    initialize_model()

    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)