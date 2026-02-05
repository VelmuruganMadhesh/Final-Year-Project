import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiPrinter } from 'react-icons/fi';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleDownload = (prescription) => {
    setLoading(true);
    try {
      // Create a printable/downloadable version
      const content = generatePrescriptionContent(prescription);
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Prescription_${prescription._id}_${new Date(prescription.prescriptionDate || prescription.createdAt).toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading prescription:', error);
      alert('Error downloading prescription');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (prescription) => {
    const content = generatePrescriptionContent(prescription);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generatePrescriptionContent = (prescription) => {
    const date = new Date(prescription.prescriptionDate || prescription.createdAt);
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Prescription - ${prescription._id}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #0ea5e9;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .medications {
      margin-top: 20px;
    }
    .medication-item {
      background: #f5f5f5;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #0ea5e9;
    }
    .medication-name {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 5px;
    }
    .notes {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    .footer {
      margin-top: 40px;
      text-align: right;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HOSPITAL PRESCRIPTION</h1>
    <p>Smart Hospital Management System</p>
  </div>

  <div class="info-section">
    <div class="info-row">
      <span class="label">Patient Name:</span>
      <span>${prescription.patient?.userId?.name || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="label">Doctor:</span>
      <span>Dr. ${prescription.doctor?.userId?.name || 'N/A'} (${prescription.doctor?.specialization || 'N/A'})</span>
    </div>
    <div class="info-row">
      <span class="label">Prescription Date:</span>
      <span>${date.toLocaleDateString()}</span>
    </div>
    ${prescription.followUpDate ? `
    <div class="info-row">
      <span class="label">Follow-up Date:</span>
      <span>${new Date(prescription.followUpDate).toLocaleDateString()}</span>
    </div>
    ` : ''}
  </div>

  <div class="info-section">
    <h2 style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 5px;">Diagnosis</h2>
    <p style="font-size: 18px; font-weight: bold;">${prescription.diagnosis || 'N/A'}</p>
  </div>

  ${prescription.medications && prescription.medications.length > 0 ? `
  <div class="medications">
    <h2 style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 5px;">Prescribed Medications</h2>
    ${prescription.medications.map((med, index) => `
      <div class="medication-item">
        <div class="medication-name">${index + 1}. ${med.name}</div>
        <div>Dosage: ${med.dosage}</div>
        <div>Frequency: ${med.frequency}</div>
        <div>Duration: ${med.duration}</div>
        ${med.instructions ? `<div style="margin-top: 5px; font-style: italic;">Instructions: ${med.instructions}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${prescription.treatmentNotes || prescription.additionalNotes ? `
  <div class="notes">
    <h3 style="color: #0ea5e9; margin-top: 0;">Notes</h3>
    ${prescription.treatmentNotes ? `<p><strong>Treatment Notes:</strong> ${prescription.treatmentNotes}</p>` : ''}
    ${prescription.additionalNotes ? `<p><strong>Additional Notes:</strong> ${prescription.additionalNotes}</p>` : ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <p style="font-size: 12px; color: #666;">This is a system-generated prescription. Please consult your doctor for any questions.</p>
  </div>
</body>
</html>
    `;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Prescriptions</h1>
      
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No prescriptions available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Dr. {prescription.doctor?.userId?.name || 'N/A'}
                    {prescription.doctor?.specialization && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({prescription.doctor.specialization})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString()}
                  </p>
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
                  <button
                    onClick={() => handleDownload(prescription)}
                    className="text-green-600 hover:text-green-800 p-2"
                    title="Download"
                    disabled={loading}
                  >
                    <FiDownload />
                  </button>
                  <button
                    onClick={() => handlePrint(prescription)}
                    className="text-gray-600 hover:text-gray-800 p-2"
                    title="Print"
                  >
                    <FiPrinter />
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
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(selectedPrescription)}
                  className="text-green-600 hover:text-green-800 p-2"
                  title="Download"
                >
                  <FiDownload />
                </button>
                <button
                  onClick={() => handlePrint(selectedPrescription)}
                  className="text-gray-600 hover:text-gray-800 p-2"
                  title="Print"
                >
                  <FiPrinter />
                </button>
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
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold">
                    Dr. {selectedPrescription.doctor?.userId?.name || 'N/A'}
                    {selectedPrescription.doctor?.specialization && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({selectedPrescription.doctor.specialization})
                      </span>
                    )}
                  </p>
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

export default PatientPrescriptions;
