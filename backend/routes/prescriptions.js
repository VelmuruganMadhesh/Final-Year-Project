const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

const validatePrescription = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('diagnosis').notEmpty().trim().withMessage('Diagnosis is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').notEmpty().trim().withMessage('Medicine name is required'),
  body('medications.*.dosage').notEmpty().trim().withMessage('Dosage is required'),
  body('medications.*.frequency').notEmpty().trim().withMessage('Frequency is required'),
  body('medications.*.duration').notEmpty().trim().withMessage('Duration is required'),
  body('prescriptionDate').optional().isISO8601().withMessage('Invalid date format')
];

router.post('/', protect, authorize('doctor'), validatePrescription, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { patientId, appointmentId, medications, diagnosis, treatmentNotes, additionalNotes, prescriptionDate, followUpDate } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.assignedDoctor) {
      return res.status(403).json({ 
        message: 'Patient is not assigned to any doctor. Please assign the patient first.' 
      });
    }

    if (patient.assignedDoctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only create prescriptions for patients assigned to you' 
      });
    }

    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: 'At least one medication is required' });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId,
      medications: medications,
      diagnosis: diagnosis.trim(),
      treatmentNotes: treatmentNotes?.trim(),
      additionalNotes: additionalNotes?.trim(),
      prescriptionDate: prescriptionDate ? new Date(prescriptionDate) : new Date(),
      followUpDate: followUpDate ? new Date(followUpDate) : undefined
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'userId')
      .populate('doctor', 'userId specialization')
      .populate('appointment');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: populatedPrescription
    });
  } catch (error) {
    console.error('Prescription creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      query.doctor = doctor._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: 'name email gender dateOfBirth' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('appointment')
      .sort({ prescriptionDate: -1, createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== patientId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      if (!patient.assignedDoctor || patient.assignedDoctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Patient is not assigned to you' });
      }
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: 'name email gender dateOfBirth' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('appointment')
      .sort({ prescriptionDate: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: 'name email gender dateOfBirth' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== prescription.patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this prescription' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || doctor._id.toString() !== prescription.doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this prescription' });
      }
    }

    res.json(prescription);
  } catch (error) {
    console.error('Prescription fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', protect, authorize('doctor'), [
  body('diagnosis').optional().notEmpty().trim().withMessage('Diagnosis cannot be empty'),
  body('medications').optional().isArray({ min: 1 }).withMessage('At least one medication is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (prescription.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only update prescriptions created by you' 
      });
    }

    const patient = await Patient.findById(prescription.patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (!patient.assignedDoctor || patient.assignedDoctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ 
        message: 'Patient is no longer assigned to you. Cannot update prescription.' 
      });
    }

    const { medications, diagnosis, treatmentNotes, additionalNotes, prescriptionDate, followUpDate } = req.body;
    
    if (medications) {
      if (medications.length === 0) {
        return res.status(400).json({ message: 'At least one medication is required' });
      }
      prescription.medications = medications;
    }
    if (diagnosis) prescription.diagnosis = diagnosis.trim();
    if (treatmentNotes !== undefined) prescription.treatmentNotes = treatmentNotes?.trim();
    if (additionalNotes !== undefined) prescription.additionalNotes = additionalNotes?.trim();
    if (prescriptionDate) prescription.prescriptionDate = new Date(prescriptionDate);
    if (followUpDate) prescription.followUpDate = new Date(followUpDate);

    await prescription.save();
    
    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: 'name email gender dateOfBirth' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('appointment');

    res.json({
      message: 'Prescription updated successfully',
      prescription: updatedPrescription
    });
  } catch (error) {
    console.error('Prescription update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
