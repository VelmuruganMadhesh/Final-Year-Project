import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiSearch } from 'react-icons/fi'
import toast, { Toaster } from 'react-hot-toast'

const DoctorPatients = () => {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const patientsPerPage = 5

  const [prescriptionData, setPrescriptionData] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    diagnosis: '',
    treatmentNotes: '',
    additionalNotes: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    followUpDate: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/doctors/me/patients')
      setPatients(res.data)
    } catch {
      toast.error('Error fetching patients')
    }
  }

  const filteredPatients = patients.filter(p =>
    p.userId?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)
  const indexOfLast = currentPage * patientsPerPage
  const indexOfFirst = indexOfLast - patientsPerPage
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast)

  const resetForm = () => {
    setPrescriptionData({
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      diagnosis: '',
      treatmentNotes: '',
      additionalNotes: '',
      prescriptionDate: new Date().toISOString().split('T')[0],
      followUpDate: ''
    })
    setSelectedPatient(null)
    setEditingPrescription(null)
    setError('')
  }

  const handleAddMedication = () => {
    setPrescriptionData({
      ...prescriptionData,
      medications: [...prescriptionData.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    })
  }

  const handleRemoveMedication = index => {
    const meds = prescriptionData.medications.filter((_, i) => i !== index)
    setPrescriptionData({ ...prescriptionData, medications: meds })
  }

  const handleMedicationChange = (index, field, value) => {
    const meds = [...prescriptionData.medications]
    meds[index][field] = value
    setPrescriptionData({ ...prescriptionData, medications: meds })
  }

  const handleCreatePrescription = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!prescriptionData.diagnosis.trim()) {
      setError('Diagnosis is required')
      setLoading(false)
      return
    }

    const validMedications = prescriptionData.medications.filter(
      med => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    )

    if (validMedications.length === 0) {
      setError('At least one complete medication is required')
      setLoading(false)
      return
    }

    try {
      const payload = {
        patientId: selectedPatient._id,
        diagnosis: prescriptionData.diagnosis.trim(),
        medications: validMedications,
        treatmentNotes: prescriptionData.treatmentNotes,
        additionalNotes: prescriptionData.additionalNotes,
        prescriptionDate: prescriptionData.prescriptionDate,
        followUpDate: prescriptionData.followUpDate || undefined
      }

      if (editingPrescription) {
        await axios.put(`/api/prescriptions/${editingPrescription._id}`, payload)
        toast.success('Prescription updated successfully')
      } else {
        await axios.post('/api/prescriptions', payload)
        toast.success('Prescription created successfully')
      }

      setShowPrescriptionModal(false)
      resetForm()
      fetchPatients()
    } catch (err) {
      toast.error('Error saving prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>

          <div className="relative">
            <FiSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map(patient => (
                <tr key={patient._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{patient.userId?.name}</td>
                  <td className="px-6 py-4">{patient.userId?.email}</td>
                  <td className="px-6 py-4">{patient.userId?.phone}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        resetForm()
                        setSelectedPatient(patient)
                        setShowPrescriptionModal(true)
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <FiPlus />
                      Add Prescription
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {showPrescriptionModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 animate-modal">
              <h2 className="text-2xl font-bold mb-6">
                {editingPrescription ? 'Edit' : 'Create'} Prescription for {selectedPatient.userId?.name}
              </h2>

              <form onSubmit={handleCreatePrescription} className="space-y-5">

                {error && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={prescriptionData.diagnosis}
                  onChange={e => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />

                {prescriptionData.medications.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={e => handleMedicationChange(index, 'name', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={e => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={e => handleMedicationChange(index, 'duration', e.target.value)}
                        className="border rounded px-3 py-2"
                      />
                    </div>
                    {prescriptionData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="text-blue-600 font-medium"
                >
                  + Add Medication
                </button>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="px-5 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {loading ? 'Saving...' : editingPrescription ? 'Update' : 'Create'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>

      <style>
        {`
          @keyframes modal {
            from { opacity:0; transform: scale(0.9); }
            to { opacity:1; transform: scale(1); }
          }
          .animate-modal {
            animation: modal 0.25s ease-out;
          }
        `}
      </style>
    </div>
  )
}

export default DoctorPatients