from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime, timedelta
import logging
import difflib

app = Flask(__name__)
CORS(app)

MODEL_PATH = "disease_model.pkl"

logging.basicConfig(level=logging.INFO)

# -----------------------------
# Disease-Symptom Knowledge Base
# -----------------------------
DISEASE_SYMPTOMS = {
    'Common Cold': ['fever', 'cough', 'sneezing', 'runny nose', 'sore throat'],
    'Flu': ['fever', 'cough', 'body ache', 'fatigue', 'headache'],
    'Migraine': ['headache', 'nausea', 'sensitivity to light', 'dizziness'],
    'Diabetes': ['frequent urination', 'excessive thirst', 'fatigue', 'blurred vision'],
    'Hypertension': ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
    'Asthma': ['cough', 'shortness of breath', 'wheezing', 'chest tightness'],
    'Pneumonia': ['fever', 'cough', 'chest pain', 'shortness of breath', 'fatigue'],
    'Bronchitis': ['cough', 'mucus', 'fatigue', 'shortness of breath', 'chest discomfort'],
    'Gastritis': ['stomach pain', 'nausea', 'vomiting', 'bloating', 'loss of appetite'],
    'Arthritis': ['joint pain', 'stiffness', 'swelling', 'reduced range of motion']
}

model = None
symptom_index = {}
disease_encoder = None


# -----------------------------
# Initialize / Load Model
# -----------------------------
def initialize_model():
    global model, symptom_index, disease_encoder

    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model, symptom_index, disease_encoder = pickle.load(f)
        logging.info("Model loaded from file.")
        return

    symptoms_list = []
    diseases_list = []

    for disease, symptoms in DISEASE_SYMPTOMS.items():
        for _ in range(100):
            symptoms_list.append(symptoms)
            diseases_list.append(disease)

    all_symptoms = sorted({s for sublist in symptoms_list for s in sublist})
    symptom_index = {symptom: idx for idx, symptom in enumerate(all_symptoms)}

    X = []
    for symptoms in symptoms_list:
        vector = [1 if s in symptoms else 0 for s in all_symptoms]
        X.append(vector)

    X = np.array(X)

    disease_encoder = LabelEncoder()
    y = disease_encoder.fit_transform(diseases_list)

    model = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestClassifier(n_estimators=200, random_state=42))
    ])

    model.fit(X, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump((model, symptom_index, disease_encoder), f)

    logging.info("Model trained and saved.")


# -----------------------------
# Fuzzy Symptom Matching
# -----------------------------
def normalize_symptom(symptom):
    symptom = symptom.lower().strip()
    matches = difflib.get_close_matches(symptom, symptom_index.keys(), n=1, cutoff=0.7)
    return matches[0] if matches else None


# -----------------------------
# Risk Scoring Algorithm
# -----------------------------
def calculate_risk(disease, age, medical_history, confidence):
    risk_score = 0

    high_risk_diseases = ['Diabetes', 'Hypertension', 'Pneumonia', 'Asthma']

    if disease in high_risk_diseases:
        risk_score += 3

    if age > 60:
        risk_score += 2
    elif age > 40:
        risk_score += 1

    risk_score += min(len(medical_history), 3)

    if confidence < 50:
        risk_score -= 1

    if risk_score >= 5:
        return "critical"
    elif risk_score >= 3:
        return "high"
    elif risk_score >= 2:
        return "medium"
    return "low"


# -----------------------------
# Disease Prediction
# -----------------------------
def predict_disease(symptoms, age, gender, medical_history):
    global model, symptom_index, disease_encoder

    if model is None:
        initialize_model()

    vector = np.zeros(len(symptom_index))

    for s in symptoms:
        normalized = normalize_symptom(s)
        if normalized:
            vector[symptom_index[normalized]] = 1

    probabilities = model.predict_proba([vector])[0]
    idx = np.argmax(probabilities)

    disease = disease_encoder.inverse_transform([idx])[0]
    confidence = round(probabilities[idx] * 100, 2)

    risk_level = calculate_risk(disease, age, medical_history, confidence)

    recommendations = [
        f"Consult a doctor regarding possible {disease}.",
        "Stay hydrated and monitor symptoms.",
        "Follow prescribed medication if any."
    ]

    if risk_level in ["high", "critical"]:
        recommendations.append("Immediate medical consultation recommended.")

    return {
        "disease": disease,
        "confidence": confidence,
        "riskLevel": risk_level,
        "recommendations": recommendations
    }


# -----------------------------
# AI Smart Scheduling
# -----------------------------
def schedule_appointment(risk_level, preferred_date):
    priority_map = {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 3
    }

    base_times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

    priority = priority_map.get(risk_level, 2)

    today = datetime.now().date()
    pref_date = datetime.strptime(preferred_date, '%Y-%m-%d').date()

    if risk_level == "critical":
        pref_date = today

    suggested_times = base_times[:3] if priority <= 1 else base_times[3:]

    return {
        "priority": risk_level,
        "suggestedDate": pref_date.strftime('%Y-%m-%d'),
        "suggestedTime": suggested_times[0],
        "availableSlots": suggested_times
    }


# -----------------------------
# Routes
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        symptoms = data.get("symptoms")
        age = int(data.get("age", 30))
        gender = data.get("gender", "male")
        medical_history = data.get("medicalHistory", [])

        if not symptoms or not isinstance(symptoms, list):
            return jsonify({"error": "Symptoms list required"}), 400

        result = predict_disease(symptoms, age, gender, medical_history)
        return jsonify(result)

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": "Prediction failed"}), 500


@app.route("/schedule", methods=["POST"])
def schedule():
    try:
        data = request.json
        risk_level = data.get("riskLevel", "medium")
        preferred_date = data.get("preferredDate", datetime.now().strftime('%Y-%m-%d'))

        result = schedule_appointment(risk_level, preferred_date)
        return jsonify(result)

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": "Scheduling failed"}), 500


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
    app.run(host="0.0.0.0", port=port)
