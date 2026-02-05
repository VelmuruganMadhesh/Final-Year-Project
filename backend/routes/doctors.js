const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/doctors
// @desc    Add a new doctor (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, specialization, departmentId, licenseNumber, experience, qualifications, consultationFee } = req.body;

    // Check if user exists and is a doctor
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid user or user is not a doctor' });
    }

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ userId });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }

    const doctor = await Doctor.create({
      userId,
      specialization,
      department: departmentId,
      licenseNumber,
      experience: experience || 0,
      qualifications: qualifications || [],
      consultationFee: consultationFee || 0
    });

    // Update department doctor count
    department.totalDoctors += 1;
    await department.save();

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone')
      .populate('department');

    res.status(201).json(populatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phone gender dateOfBirth')
      .populate('department')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone gender dateOfBirth address')
      .populate('department');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/me/patients
// @desc    Get assigned patients for logged-in doctor
// @access  Private/Doctor
router.get('/me/patients', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const Patient = require('../models/Patient');
    const patients = await Patient.find({ assignedDoctor: doctor._id })
      .populate('userId', 'name email phone gender dateOfBirth');

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doctors/:id/availability
// @desc    Update doctor availability
// @access  Private/Doctor
router.put('/:id/availability', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor owns this profile
    if (doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.availability) {
      doctor.availability = { ...doctor.availability, ...req.body.availability };
    }

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
// @access  Private/Doctor or Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check authorization
    if (doctor.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { specialization, experience, qualifications, consultationFee } = req.body;
    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (qualifications) doctor.qualifications = qualifications;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;

    await doctor.save();
    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone')
      .populate('department');

    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/doctors/:id
// @desc    Remove doctor (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update department doctor count
    const department = await Department.findById(doctor.department);
    if (department) {
      department.totalDoctors = Math.max(0, department.totalDoctors - 1);
      await department.save();
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
