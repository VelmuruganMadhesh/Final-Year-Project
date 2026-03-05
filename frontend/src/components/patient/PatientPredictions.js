import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiX, FiActivity, FiClock } from 'react-icons/fi'

const PatientPredictions = () => {
  const [predictions, setPredictions] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [symptomInput, setSymptomInput] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchPredictions()
    fetchUserInfo()
  }, [])

  const fetchPredictions = async () => {
    try {
      const res = await axios.get('/api/ai/predictions')
      setPredictions(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get('/api/auth/me')
      setUserInfo(res.data.user)
      setUserProfile(res.data.profile)
    } catch (error) {
      console.error(error)
    }
  }

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput('')
    }
  }

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const handlePredict = async () => {
    if (symptoms.length === 0) return

    setLoading(true)
    try {
      const age = userInfo?.dateOfBirth
        ? new Date().getFullYear() - new Date(userInfo.dateOfBirth).getFullYear()
        : 30

      const res = await axios.post('/api/ai/predict', {
        symptoms,
        age,
        gender: userInfo?.gender || 'male',
        medicalHistory: userProfile?.medicalHistory?.map(h => h.condition) || []
      })

      setPrediction(res.data)
      fetchPredictions()
    } catch (error) {
      alert('Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const getRiskStyle = (level) => {
    if (level === 'high') return 'bg-red-100 text-red-700'
    if (level === 'medium') return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <FiActivity className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI Disease Prediction</h1>
            <p className="text-gray-500 text-sm">Smart health risk analysis based on symptoms</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Symptoms</h2>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
              placeholder="Type symptom and press Enter"
              className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              onClick={addSymptom}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiPlus />
              Add
            </button>
          </div>

          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {symptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {symptom}
                  <FiX
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => removeSymptom(index)}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handlePredict}
            disabled={loading || symptoms.length === 0}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Get AI Prediction'}
          </button>
        </div>

        {prediction && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-blue-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Prediction Result</h2>

            <div className="space-y-3">
              <div className="text-lg">
                <span className="font-semibold">Disease: </span>
                <span className="text-blue-600 font-bold">{prediction.disease}</span>
              </div>

              <div>
                <span className="font-semibold">Risk Level: </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskStyle(prediction.riskLevel)}`}>
                  {prediction.riskLevel.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="font-semibold">Confidence: </span>
                {prediction.confidence}%
              </div>

              {prediction.recommendations?.length > 0 && (
                <div>
                  <span className="font-semibold">Recommendations:</span>
                  <ul className="list-disc list-inside mt-2 text-gray-600">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiClock />
            Previous Predictions
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {predictions.map((pred) => (
              <div
                key={pred._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {pred.predictedDisease}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(pred.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskStyle(pred.riskLevel)}`}>
                    {pred.riskLevel}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Confidence: {pred.confidence}%</p>
                  <p>Symptoms: {pred.symptoms.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default PatientPredictions