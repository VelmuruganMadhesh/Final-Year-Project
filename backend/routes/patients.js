const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/patients
// @desc    Get all patients (Admin and Doctor)
// @access  Private
router.get('/', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    let query = {};
    
    // If doctor, only show assigned patients
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) {
        query.assignedDoctor = doctor._id;
      }
    }

    const patients = await Patient.find(query)
      .populate('userId', 'name email phone gender dateOfBirth address')
      .populate({
  path: 'assignedDoctor',
  populate: {
    path: 'userId',
    select: 'name email email phone specialization'
  }
})
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', 'name email phone gender dateOfBirth address')
      .populate({
  path: 'assignedDoctor',
  populate: {
    path: 'userId',
    select: 'name email email phone specialization'
  }
});
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && patient.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If doctor, only allow if assigned
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || !patient.assignedDoctor || patient.assignedDoctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this patient details' });
      }
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/me/profile
// @desc    Get current patient profile
// @access  Private/Patient
router.get('/me/profile', protect, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone gender dateOfBirth address')
      .populate({
  path: 'assignedDoctor',
  populate: {
    path: 'userId',
    select: 'name email email phone specialization'
  }
});
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient profile
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && patient.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { bloodGroup, allergies, medicalHistory, emergencyContact, insuranceInfo, assignedDoctor } = req.body;
    
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (allergies) patient.allergies = allergies;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (insuranceInfo) patient.insuranceInfo = insuranceInfo;
    if (assignedDoctor && (req.user.role === 'admin' || req.user.role === 'patient')) {
      patient.assignedDoctor = assignedDoctor;
    }

    await patient.save();
    const updatedPatient = await Patient.findById(patient._id)
      .populate('userId', 'name email phone')
      .populate({
  path: 'assignedDoctor',
  populate: {
    path: 'userId',
    select: 'name email email phone specialization'
  }
});

    res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
