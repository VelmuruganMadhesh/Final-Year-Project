import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiFileText, FiEdit } from 'react-icons/fi';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    diagnosis: '',
    treatmentNotes: '',
    additionalNotes: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    followUpDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/doctors/me/patients');
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Error fetching patients');
    }
  };

  const handleAddMedication = () => {
    setPrescriptionData({
      ...prescriptionData,
      medications: [...prescriptionData.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const handleRemoveMedication = (index) => {
    const newMeds = prescriptionData.medications.filter((_, i) => i !== index);
    setPrescriptionData({ ...prescriptionData, medications: newMeds });
  };

  const handleMedicationChange = (index, field, value) => {
    const newMeds = [...prescriptionData.medications];
    newMeds[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medications: newMeds });
  };

  const resetForm = () => {
    setPrescriptionData({
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      diagnosis: '',
      treatmentNotes: '',
      additionalNotes: '',
      prescriptionDate: new Date().toISOString().split('T')[0],
      followUpDate: ''
    });
    setSelectedPatient(null);
    setEditingPrescription(null);
    setError('');
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!prescriptionData.diagnosis.trim()) {
      setError('Diagnosis is required');
      setLoading(false);
      return;
    }

    // Filter out empty medications and validate
    const validMedications = prescriptionData.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedications.length === 0) {
      setError('At least one medication with all fields (name, dosage, frequency, duration) is required');
      setLoading(false);
      return;
    }

    // Check if there are incomplete medications
    const incompleteMeds = prescriptionData.medications.filter(med => 
      med.name.trim() || med.dosage.trim() || med.frequency.trim() || med.duration.trim()
    ).filter(med => 
      !med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()
    );

    if (incompleteMeds.length > 0) {
      setError('Please complete all fields for each medication or remove incomplete entries');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patientId: selectedPatient._id,
        diagnosis: prescriptionData.diagnosis.trim(),
        medications: validMedications,
        treatmentNotes: prescriptionData.treatmentNotes?.trim() || '',
        additionalNotes: prescriptionData.additionalNotes?.trim() || '',
        prescriptionDate: prescriptionData.prescriptionDate || new Date().toISOString().split('T')[0],
        followUpDate: prescriptionData.followUpDate || undefined
      };

      if (editingPrescription) {
        const response = await axios.put(`/api/prescriptions/${editingPrescription._id}`, payload);
        alert('Prescription updated successfully');
      } else {
        const response = await axios.post('/api/prescriptions', payload);
        alert('Prescription created successfully');
      }
      
      setShowPrescriptionModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('Error saving prescription:', error);
      let errorMsg = 'Error saving prescription';
      
      if (error.response) {
        if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.map(e => e.msg || e.message || e).join(', ');
        } else if (error.response.data?.error) {
          errorMsg = error.response.data.error;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (patient, prescription) => {
    setSelectedPatient(patient);
    setEditingPrescription(prescription);
    setPrescriptionData({
      medications: prescription.medications.length > 0 
        ? prescription.medications 
        : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      diagnosis: prescription.diagnosis || '',
      treatmentNotes: prescription.treatmentNotes || '',
      additionalNotes: prescription.additionalNotes || '',
      prescriptionDate: prescription.prescriptionDate 
        ? new Date(prescription.prescriptionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      followUpDate: prescription.followUpDate 
        ? new Date(prescription.followUpDate).toISOString().split('T')[0]
        : ''
    });
    setShowPrescriptionModal(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Patients</h1>
      
      {patients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No patients assigned to you yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.userId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.userId?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.userId?.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.bloodGroup || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        resetForm();
                        setSelectedPatient(patient);
                        setShowPrescriptionModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-800 flex items-center mr-4"
                      title="Add Prescription"
                    >
                      <FiPlus className="mr-1" />
                      Add Prescription
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPrescriptionModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingPrescription ? 'Edit' : 'Create'} Prescription for {selectedPatient.userId?.name}
              </h2>
              <button
                onClick={() => {
                  setShowPrescriptionModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreatePrescription} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.prescriptionDate}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, prescriptionDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={prescriptionData.diagnosis}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter diagnosis"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medications <span className="text-red-500">*</span>
                </label>
                {prescriptionData.medications.map((med, index) => (
                  <div key={index} className="mb-3 p-4 border border-gray-300 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Medication {index + 1}</span>
                      {prescriptionData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Medicine name *"
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Dosage *"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Frequency *"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., 2 times daily"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Duration *"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Additional instructions (optional)"
                        value={med.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="mt-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  + Add Another Medication
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Notes
                </label>
                <textarea
                  value={prescriptionData.treatmentNotes}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, treatmentNotes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Enter treatment notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={prescriptionData.additionalNotes}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, additionalNotes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="2"
                  placeholder="Enter any additional notes"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingPrescription ? 'Update Prescription' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
