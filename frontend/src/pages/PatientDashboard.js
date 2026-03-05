import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import axios from 'axios'
import {
  FiCalendar,
  FiFileText,
  FiClipboard,
  FiCreditCard
} from 'react-icons/fi'

import PatientAppointments from '../components/patient/PatientAppointments'
import PatientPredictions from '../components/patient/PatientPredictions'
import PatientPrescriptions from '../components/patient/PatientPrescriptions'
import PatientRecords from '../components/patient/PatientRecords'
import PatientBilling from '../components/patient/PatientBilling'

const PatientDashboard = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    prescriptions: 0,
    medicalRecords: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, recordsRes] =
        await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/prescriptions'),
          axios.get('/api/medical-records')
        ])

      const upcoming = appointmentsRes.data.filter(
        apt => apt.status === 'pending' || apt.status === 'confirmed'
      )

      setStats({
        upcomingAppointments: upcoming.length,
        prescriptions: prescriptionsRes.data.length,
        medicalRecords: recordsRes.data.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const DashboardHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome Back 
        </h1>
        <p className="text-gray-600">
          Here’s your health overview and quick access panel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* Appointments */}
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between items-center mb-4">
            <FiCalendar className="text-blue-600 text-3xl" />
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <h3 className="text-gray-600 text-sm">Upcoming Appointments</h3>
          <p className="text-4xl font-bold text-blue-600">
            {stats.upcomingAppointments}
          </p>
        </div>

        {/* Prescriptions */}
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between items-center mb-4">
            <FiFileText className="text-green-600 text-3xl" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <h3 className="text-gray-600 text-sm">Prescriptions</h3>
          <p className="text-4xl font-bold text-green-600">
            {stats.prescriptions}
          </p>
        </div>

        {/* Records */}
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between items-center mb-4">
            <FiClipboard className="text-purple-600 text-3xl" />
            <span className="text-sm text-gray-400">Stored</span>
          </div>
          <h3 className="text-gray-600 text-sm">Medical Records</h3>
          <p className="text-4xl font-bold text-purple-600">
            {stats.medicalRecords}
          </p>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <button
            onClick={() => navigate('appointments')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:scale-105 transition"
          >
            <FiCalendar className="text-3xl mb-2" />
            Manage Appointments
          </button>

          <button
            onClick={() => navigate('prescriptions')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:scale-105 transition"
          >
            <FiFileText className="text-3xl mb-2" />
            View Prescriptions
          </button>

          <button
            onClick={() => navigate('records')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:scale-105 transition"
          >
            <FiClipboard className="text-3xl mb-2" />
            Medical Records
          </button>

          <button
            onClick={() => navigate('billing')}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-md hover:scale-105 transition"
          >
            <FiCreditCard className="text-3xl mb-2" />
            Billing & Payments
          </button>

        </div>
      </div>
    </div>
  )

  return (
    <Layout role="patient">
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="predictions" element={<PatientPredictions />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="billing" element={<PatientBilling />} />
        <Route path="*" element={<Navigate to="/patient" replace />} />
      </Routes>
    </Layout>
  )
}

export default PatientDashboard