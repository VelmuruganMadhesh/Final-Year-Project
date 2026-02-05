const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [{
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    }
  }],
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  treatmentNotes: {
    type: String,
    trim: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  prescriptionDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
prescriptionSchema.index({ patient: 1, doctor: 1 });
prescriptionSchema.index({ prescriptionDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
