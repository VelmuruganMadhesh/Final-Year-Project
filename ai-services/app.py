from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# Disease prediction model
disease_model = None
symptom_encoder = None
disease_encoder = None

# Sample disease-symptom mapping (in production, use trained model)
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

def initialize_model():
    """Initialize or load the disease prediction model"""
    global disease_model, symptom_encoder, disease_encoder
    
    # Create sample training data
    symptoms_list = []
    diseases_list = []
    
    for disease, symptoms in DISEASE_SYMPTOMS.items():
        for _ in range(50):  # Generate 50 samples per disease
            symptoms_list.append(symptoms)
            diseases_list.append(disease)
    
    # Flatten symptoms and create feature vectors
    all_symptoms = set()
    for symptoms in symptoms_list:
        all_symptoms.update(symptoms)
    all_symptoms = sorted(list(all_symptoms))
    
    # Create feature matrix
    X = []
    for symptoms in symptoms_list:
        feature_vector = [1 if symptom in symptoms else 0 for symptom in all_symptoms]
        X.append(feature_vector)
    
    X = np.array(X)
    
    # Encode diseases
    disease_encoder = LabelEncoder()
    y = disease_encoder.fit_transform(diseases_list)
    
    # Train model
    disease_model = RandomForestClassifier(n_estimators=100, random_state=42)
    disease_model.fit(X, y)
    
    symptom_encoder = {symptom: idx for idx, symptom in enumerate(all_symptoms)}
    
    print("Disease prediction model initialized")

def predict_disease(symptoms, age, gender, medical_history):
    """Predict disease based on symptoms"""
    global disease_model, symptom_encoder, disease_encoder
    
    if disease_model is None:
        initialize_model()
    
    # Create feature vector
    feature_vector = np.zeros(len(symptom_encoder))
    for symptom in symptoms:
        symptom_lower = symptom.lower().strip()
        if symptom_lower in symptom_encoder:
            feature_vector[symptom_encoder[symptom_lower]] = 1
    
    # Predict
    probabilities = disease_model.predict_proba([feature_vector])[0]
    predicted_idx = np.argmax(probabilities)
    predicted_disease = disease_encoder.inverse_transform([predicted_idx])[0]
    confidence = probabilities[predicted_idx] * 100
    
    # Determine risk level based on disease, age, and medical history
    high_risk_diseases = ['Diabetes', 'Hypertension', 'Pneumonia', 'Asthma']
    risk_level = 'low'
    
    if predicted_disease in high_risk_diseases:
        risk_level = 'high'
    elif age > 60 or len(medical_history) > 2:
        risk_level = 'high'
    elif age > 40 or len(medical_history) > 0:
        risk_level = 'medium'
    
    if confidence < 50:
        risk_level = 'low'
    
    # Generate recommendations
    recommendations = [
        f"Consult a doctor for {predicted_disease}",
        "Monitor your symptoms closely",
        "Get adequate rest and stay hydrated"
    ]
    
    if risk_level in ['high', 'critical']:
        recommendations.append("Seek immediate medical attention if symptoms worsen")
    
    return {
        'disease': predicted_disease,
        'riskLevel': risk_level,
        'confidence': round(confidence, 2),
        'recommendations': recommendations
    }

def schedule_appointment(risk_level, doctor_id, preferred_date):
    """AI-based appointment scheduling"""
    # Determine priority based on risk level
    priority_map = {
        'critical': 'urgent',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
    }
    priority = priority_map.get(risk_level, 'medium')
    
    # Suggest time slots based on priority
    time_slots = {
        'urgent': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'high': ['10:00', '11:00', '14:00', '15:00', '16:00'],
        'medium': ['11:00', '14:00', '15:00', '16:00', '17:00'],
        'low': ['14:00', '15:00', '16:00', '17:00']
    }
    
    suggested_times = time_slots.get(priority, time_slots['medium'])
    
    # If urgent, suggest today or tomorrow
    suggested_date = preferred_date
    if priority == 'urgent':
        try:
            pref_date = datetime.strptime(preferred_date, '%Y-%m-%d')
            today = datetime.now().date()
            if pref_date.date() > today + timedelta(days=1):
                suggested_date = (today + timedelta(days=1)).strftime('%Y-%m-%d')
        except:
            pass
    
    return {
        'priority': priority,
        'suggestedDate': suggested_date,
        'suggestedTime': suggested_times[0] if suggested_times else '10:00',
        'availableSlots': suggested_times
    }

@app.route('/predict', methods=['POST'])
def predict():
    """Disease prediction endpoint"""
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        age = data.get('age', 30)
        gender = data.get('gender', 'male')
        medical_history = data.get('medicalHistory', [])
        
        if not symptoms:
            return jsonify({'error': 'Symptoms are required'}), 400
        
        result = predict_disease(symptoms, age, gender, medical_history)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/schedule', methods=['POST'])
def schedule():
    """Appointment scheduling endpoint"""
    try:
        data = request.json
        risk_level = data.get('riskLevel', 'medium')
        doctor_id = data.get('doctorId')
        preferred_date = data.get('preferredDate', datetime.now().strftime('%Y-%m-%d'))
        
        result = schedule_appointment(risk_level, doctor_id, preferred_date)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AI Prediction Service'})

if __name__ == '__main__':
    initialize_model()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
