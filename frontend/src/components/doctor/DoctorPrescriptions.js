import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye } from 'react-icons/fi';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('/api/prescriptions');
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      alert('Error fetching prescriptions');
    }
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Prescriptions</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/doctor/patients')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            View Assigned Patients
          </button>
        </div>
      </div>
      
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No prescriptions created yet.</p>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Prescription for Patient
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Patient: {prescription.patient?.userId?.name || 'Unknown Patient'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString()}
                  </p>
                  {prescription.appointment && (
                    <p className="text-xs text-gray-500 mt-1">
                      Appointment: {new Date(prescription.appointment.appointmentDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {prescription.diagnosis && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {prescription.diagnosis}
                    </span>
                  )}
                  <button
                    onClick={() => handleViewDetails(prescription)}
                    className="text-primary-600 hover:text-primary-800 p-2"
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                </div>
              </div>
              
              {prescription.medications && prescription.medications.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Medications:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {prescription.medications.slice(0, 3).map((med, index) => (
                      <li key={index} className="text-gray-600 text-sm">
                        {med.name} - {med.dosage} ({med.frequency}) for {med.duration}
                      </li>
                    ))}
                    {prescription.medications.length > 3 && (
                      <li className="text-gray-500 text-sm italic">
                        +{prescription.medications.length - 3} more medications
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {prescription.treatmentNotes && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    <span className="font-semibold">Notes: </span>
                    {prescription.treatmentNotes}
                  </p>
                </div>
              )}

              {prescription.followUpDate && (
                <div className="mt-2 text-sm">
                  <span className="font-semibold text-gray-700">Follow-up: </span>
                  <span className="text-gray-600">
                    {new Date(prescription.followUpDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prescription Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPrescription(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-semibold">{selectedPrescription.patient?.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedPrescription.prescriptionDate || selectedPrescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
                <p className="font-semibold text-lg">{selectedPrescription.diagnosis || 'N/A'}</p>
              </div>

              {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medications</p>
                  <div className="space-y-2">
                    {selectedPrescription.medications.map((med, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-500 mt-1">Instructions: {med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPrescription.treatmentNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Treatment Notes</p>
                  <p className="text-gray-800">{selectedPrescription.treatmentNotes}</p>
                </div>
              )}

              {selectedPrescription.additionalNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                  <p className="text-gray-800">{selectedPrescription.additionalNotes}</p>
                </div>
              )}

              {selectedPrescription.followUpDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Follow-up Date</p>
                  <p className="font-semibold">
                    {new Date(selectedPrescription.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
