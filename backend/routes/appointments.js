const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, symptoms } = req.body;

    let patient;

    if (req.user.role === 'patient') {
      patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    } else {
      patient = await Patient.findById(req.body.patientId);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
    }

    const doctor = await Doctor.findById(doctorId).populate('department');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    let aiPrediction = null;

    if (symptoms && symptoms.length > 0) {
      try {
        const user = await User.findById(patient.userId);

        const predictionResponse = await axios.post(
          `${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/predict`,
          {
            symptoms,
            age: user.dateOfBirth
              ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()
              : 30,
            gender: user.gender || 'male',
            medicalHistory: patient.medicalHistory?.map(mh => mh.condition) || []
          }
        );

        aiPrediction = predictionResponse.data;
      } catch (err) {
        console.error('AI prediction error:', err.message);
      }
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      department: doctor.department._id,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms: symptoms || [],
      status: 'pending',
      aiPrediction: aiPrediction
        ? {
            predictedDisease: aiPrediction.disease,
            riskLevel: aiPrediction.riskLevel,
            confidence: aiPrediction.confidence
          }
        : null
    });

    if (!patient.assignedDoctor) {
      patient.assignedDoctor = doctor._id;
      await patient.save();
    }

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email phone gender dateOfBirth' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('department', 'departmentName');

    res.status(201).json(populated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'appointmentDate',
      sortOrder = 'desc',
      searchTerm = '',
      filters
    } = req.query;

    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patient = patient._id;
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) query.doctor = doctor._id;
    }

    if (filters) {
      const parsed = JSON.parse(filters);
      if (parsed.status) query.status = parsed.status;
    }

    if (searchTerm) {
      const patients = await Patient.find()
        .populate('userId', 'name')
        .then(results =>
          results.filter(p =>
            p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

      query.patient = { $in: patients.map(p => p._id) };
    }

    const skip = (Number(pageNumber) - 1) * Number(pageSize);

    const totalRecords = await Appointment.countDocuments(query);

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email phone gender dateOfBirth' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('department', 'departmentName')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(pageSize));

    res.json({
      totalRecords,
      filteredRecords: totalRecords,
      data: appointments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role !== 'doctor')
      return res.status(403).json({ message: 'Only doctor can update status' });

    const currentStatus = appointment.status;

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[currentStatus].includes(status))
      return res.status(400).json({ message: 'Invalid status transition' });

    appointment.status = status;
    await appointment.save();

    res.json({ message: 'Status updated successfully', appointment });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;