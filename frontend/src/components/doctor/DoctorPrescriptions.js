import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiEye, FiSearch } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const prescriptionsPerPage = 5
  const navigate = useNavigate()

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('/api/prescriptions')
      setPrescriptions(res.data)
      toast.success('Prescriptions loaded successfully')
    } catch (error) {
      toast.error('Error fetching prescriptions')
    }
  }

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription)
    setShowDetailsModal(true)
  }

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(p =>
      p.patient?.userId?.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [prescriptions, search])

  const indexOfLast = currentPage * prescriptionsPerPage
  const indexOfFirst = indexOfLast - prescriptionsPerPage
  const currentPrescriptions = filteredPrescriptions.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredPrescriptions.length / prescriptionsPerPage)

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
          My Prescriptions
        </h1>
        <button
          onClick={() => navigate('/doctor/patients')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold shadow-md hover:scale-105 transition"
        >
          View Patients
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {currentPrescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <p className="text-gray-500 text-lg">No prescriptions found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {currentPrescriptions.map((prescription) => (
            <motion.div
              key={prescription._id}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {prescription.patient?.userId?.name || 'Unknown Patient'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      prescription.prescriptionDate || prescription.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleViewDetails(prescription)}
                  className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition"
                >
                  <FiEye size={18} />
                </button>
              </div>

              {prescription.diagnosis && (
                <div className="mt-4 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {prescription.diagnosis}
                </div>
              )}

              {prescription.medications?.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-semibold">
                    {prescription.medications.length}
                  </span>{' '}
                  medications prescribed
                </div>
              )}

              {prescription.followUpDate && (
                <div className="mt-2 text-sm text-gray-500">
                  Follow-up:{' '}
                  {new Date(prescription.followUpDate).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentPage === index + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showDetailsModal && selectedPrescription && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  Prescription Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedPrescription(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-semibold text-lg">
                    {selectedPrescription.patient?.userId?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Diagnosis</p>
                  <p className="font-semibold text-blue-600 text-lg">
                    {selectedPrescription.diagnosis || 'N/A'}
                  </p>
                </div>

                {selectedPrescription.medications?.map((med, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-gray-600">
                      {med.dosage} • {med.frequency} • {med.duration}
                    </p>
                    {med.instructions && (
                      <p className="text-xs text-gray-500 mt-1">
                        {med.instructions}
                      </p>
                    )}
                  </div>
                ))}

                {selectedPrescription.treatmentNotes && (
                  <div>
                    <p className="text-sm text-gray-500">Treatment Notes</p>
                    <p className="text-gray-700">
                      {selectedPrescription.treatmentNotes}
                    </p>
                  </div>
                )}

                {selectedPrescription.additionalNotes && (
                  <div>
                    <p className="text-sm text-gray-500">Additional Notes</p>
                    <p className="text-gray-700">
                      {selectedPrescription.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DoctorPrescriptions