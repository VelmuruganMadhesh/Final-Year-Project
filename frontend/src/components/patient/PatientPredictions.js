import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchPredictions();
    fetchUserInfo();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await axios.get('/api/ai/predictions');
      setPredictions(res.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUserInfo(res.data.user);
      setUserProfile(res.data.profile);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handlePredict = async () => {
    if (symptoms.length === 0) {
      alert('Please add at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const age = userInfo?.dateOfBirth
        ? new Date().getFullYear() - new Date(userInfo.dateOfBirth).getFullYear()
        : 30;

      const res = await axios.post('/api/ai/predict', {
        symptoms,
        age,
        gender: userInfo?.gender || 'male',
        medicalHistory: userProfile?.medicalHistory?.map(h => h.condition) || []
      });

      setPrediction(res.data);
      fetchPredictions();
    } catch (error) {
      alert('Error getting prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Disease Prediction</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Enter Symptoms</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
            placeholder="Enter symptom and press Enter"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={addSymptom}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Add
          </button>
        </div>
        
        {symptoms.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {symptom}
                  <button
                    onClick={() => setSymptoms(symptoms.filter((_, i) => i !== index))}
                    className="ml-2"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={loading || symptoms.length === 0}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Predicting...' : 'Get AI Prediction'}
        </button>
      </div>

      {prediction && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prediction Result</h2>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Predicted Disease: </span>
              <span className="text-primary-600">{prediction.disease}</span>
            </div>
            <div>
              <span className="font-semibold">Risk Level: </span>
              <span className={`${
                prediction.riskLevel === 'high' ? 'text-red-600' :
                prediction.riskLevel === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {prediction.riskLevel.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-semibold">Confidence: </span>
              <span>{prediction.confidence}%</span>
            </div>
            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <div>
                <span className="font-semibold">Recommendations: </span>
                <ul className="list-disc list-inside mt-2">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Predictions</h2>
        <div className="space-y-4">
          {predictions.map((pred) => (
            <div key={pred._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{pred.predictedDisease}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(pred.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pred.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  pred.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {pred.riskLevel}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Confidence: {pred.confidence}%</p>
                <p className="mt-2">Symptoms: {pred.symptoms.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientPredictions;
