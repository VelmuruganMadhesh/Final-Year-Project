const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const axios = require('axios');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, symptoms } = req.body;

    // Get patient
    let patient;
    if (req.user.role === 'patient') {
      patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
    } else {
      patient = await Patient.findById(req.body.patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
    }

    // Get doctor
    const doctor = await Doctor.findById(doctorId).populate('department');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get AI prediction if symptoms provided
    let aiPrediction = null;
    if (symptoms && symptoms.length > 0) {
      try {
        const user = await require('../models/User').findById(patient.userId);
        const predictionResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/predict`, {
          symptoms,
          age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 30,
          gender: user.gender || 'male',
          medicalHistory: patient.medicalHistory.map(mh => mh.condition)
        });

        aiPrediction = predictionResponse.data;
      } catch (error) {
        console.error('AI prediction error:', error.message);
      }
    }

    // Get AI scheduling if enabled
    let priority = 'medium';
    let scheduledTime = appointmentTime;
    if (aiPrediction) {
      try {
        const schedulingResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/schedule`, {
          riskLevel: aiPrediction.riskLevel,
          doctorId: doctorId,
          preferredDate: appointmentDate
        });

        if (schedulingResponse.data) {
          priority = schedulingResponse.data.priority || priority;
          scheduledTime = schedulingResponse.data.suggestedTime || scheduledTime;
        }
      } catch (error) {
        console.error('AI scheduling error:', error.message);
      }
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      department: doctor.department._id,
      appointmentDate,
      appointmentTime: scheduledTime,
      reason,
      symptoms: symptoms || [],
      aiPrediction: aiPrediction ? {
        predictedDisease: aiPrediction.disease,
        riskLevel: aiPrediction.riskLevel,
        confidence: aiPrediction.confidence
      } : null,
      priority,
      aiScheduled: !!aiPrediction
    });

    // Auto-assign doctor if patient doesn't have one
    if (!patient.assignedDoctor) {
      patient.assignedDoctor = doctor._id;
      await patient.save();
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'userId')
      .populate('doctor')
      .populate('department');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        query.patient = patient._id;
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) {
        query.doctor = doctor._id;
      }
    }
    const appointments = await Appointment.find(query)
  .populate({
    path: "doctor",
    populate: {
      path: "userId",
      select: "name email phone gender dateOfBirth"
    }
  })
  .populate({
    path: "patient",
    populate: {
      path: "userId",
      select: "name email phone"
    }
  })
  .populate("department", "departmentName")
  .sort({ appointmentDate: -1, appointmentTime: -1 });

res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'userId')
      .populate('doctor')
      .populate('department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { status, notes, appointmentDate, appointmentTime } = req.body;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime) appointment.appointmentTime = appointmentTime;

    await appointment.save();
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'userId')
      .populate('doctor')
      .populate('department');

    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
