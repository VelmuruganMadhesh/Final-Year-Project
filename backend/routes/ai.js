const express = require('express');
const router = express.Router();
const axios = require('axios');
const AIPrediction = require('../models/AIPrediction');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// @route   POST /api/ai/predict
// @desc    Get AI disease prediction
// @access  Private
router.post('/predict', protect, async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    // Call AI service
    let prediction;
    try {
      const response = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/predict`, {
        symptoms,
        age: age || 30,
        gender: gender || 'male',
        medicalHistory: medicalHistory || []
      });
      prediction = response.data;
    } catch (error) {
      console.error('AI service error:', error.message);
      return res.status(500).json({ message: 'AI service unavailable' });
    }

    // Save prediction if patient is logged in
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        await AIPrediction.create({
          patient: patient._id,
          symptoms,
          age: age || 30,
          gender: gender || 'male',
          predictedDisease: prediction.disease,
          riskLevel: prediction.riskLevel,
          confidence: prediction.confidence,
          recommendations: prediction.recommendations || [],
          medicalHistory: medicalHistory || []
        });
      }
    }

    res.json(prediction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai/predictions
// @desc    Get all AI predictions for current user
// @access  Private
router.get('/predictions', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        query.patient = patient._id;
      }
    }

    const predictions = await AIPrediction.find(query)
      .populate('patient', 'userId')
      .sort({ createdAt: -1 });

    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai/stats
// @desc    Get AI statistics (Admin only)
// @access  Private/Admin
const { authorize } = require('../middleware/auth');
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalPredictions = await AIPrediction.countDocuments();

    const diseaseStats = await AIPrediction.aggregate([
      {
        $group: {
          _id: '$predictedDisease',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const riskLevelStats = await AIPrediction.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const aiScheduledAppointments = await Appointment.countDocuments({ aiScheduled: true });

    res.json({
      totalPredictions,
      diseaseStats,
      riskLevelStats,
      aiScheduledAppointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
