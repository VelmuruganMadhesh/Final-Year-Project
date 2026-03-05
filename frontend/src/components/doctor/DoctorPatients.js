import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiSearch, FiUser } from 'react-icons/fi'
import toast, { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const DoctorPatients = () => {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const patientsPerPage = 6

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
        toast.success('Prescription updated')
      } else {
        await axios.post('/api/prescriptions', payload)
        toast.success('Prescription created')
      }

      setShowPrescriptionModal(false)
      resetForm()
    } catch {
      toast.error('Error saving prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">Patients</h1>
            <p className="text-gray-500 mt-1">Manage and prescribe treatments</p>
          </div>

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
              className="pl-10 pr-4 py-3 rounded-2xl bg-white shadow-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPatients.map(patient => (
            <motion.div
              key={patient._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-3xl shadow-xl p-6 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-20"></div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
                  <FiUser />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {patient.userId?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {patient.userId?.email}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {patient.userId?.phone}
              </p>

              <button
                onClick={() => {
                  resetForm()
                  setSelectedPatient(patient)
                  setShowPrescriptionModal(true)
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold shadow-md hover:scale-105 transition"
              >
                <FiPlus />
                Add Prescription
              </button>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-10 gap-3">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full font-semibold ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white shadow hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showPrescriptionModal && selectedPatient && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Prescription for {selectedPatient.userId?.name}
                </h2>

                <form onSubmit={handleCreatePrescription} className="space-y-5">

                  {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl">
                      {error}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Diagnosis"
                    value={prescriptionData.diagnosis}
                    onChange={e => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />

                  {prescriptionData.medications.map((med, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Medicine Name"
                        value={med.name}
                        onChange={e => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full bg-white rounded-lg px-3 py-2 border"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="rounded-lg px-3 py-2 border"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={e => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="rounded-lg px-3 py-2 border"
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          value={med.duration}
                          onChange={e => handleMedicationChange(index, 'duration', e.target.value)}
                          className="rounded-lg px-3 py-2 border"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="text-blue-600 font-semibold"
                  >
                    + Add Medication
                  </button>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPrescriptionModal(false)}
                      className="px-6 py-2 rounded-xl border"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default DoctorPatients