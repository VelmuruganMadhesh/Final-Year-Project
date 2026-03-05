import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import axios from 'axios'
import { motion } from 'framer-motion'
import { FiUsers, FiCalendar, FiFileText } from 'react-icons/fi'
import DoctorPatients from '../components/doctor/DoctorPatients'
import DoctorAppointments from '../components/doctor/DoctorAppointments'
import DoctorPrescriptions from '../components/doctor/DoctorPrescriptions'
import DoctorAvailability from '../components/doctor/DoctorAvailability'

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        axios.get('/api/doctors/me/patients'),
        axios.get('/api/appointments')
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayAppts = appointmentsRes.data.filter(
        apt => apt.appointmentDate?.split('T')[0] === today
      )

      setStats({
        totalPatients: patientsRes.data.length,
        todayAppointments: todayAppts.length,
        pendingPrescriptions: 0
      })
    } catch (error) {}
  }

  const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl p-6 shadow-xl bg-gradient-to-br ${gradient} text-white`}
    >
      <div className="absolute -right-6 -top-6 opacity-20 text-9xl">
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-sm font-semibold tracking-wide uppercase opacity-80">
          {title}
        </h3>
        <p className="text-4xl font-extrabold mt-2">{value}</p>
      </div>
    </motion.div>
  )

  const DashboardHome = () => (
    <div className="space-y-10">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-blue-600 via-primary-600 to-indigo-600 p-10 text-white shadow-2xl"
      >
        <h1 className="text-4xl font-extrabold mb-2">
          Welcome Back, Doctor 👨‍⚕️
        </h1>
        <p className="opacity-90 text-lg">
          Here’s your performance overview for today
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<FiUsers />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<FiCalendar />}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Pending Prescriptions"
          value={stats.pendingPrescriptions}
          icon={<FiFileText />}
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Quick Overview
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex justify-between">
              <span>Patients Managed</span>
              <span className="font-semibold text-gray-800">
                {stats.totalPatients}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Appointments Today</span>
              <span className="font-semibold text-gray-800">
                {stats.todayAppointments}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Prescriptions Pending</span>
              <span className="font-semibold text-gray-800">
                {stats.pendingPrescriptions}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Productivity
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-primary-500 to-blue-600 h-4 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  stats.todayAppointments * 10
                )}%`
              }}
            ></div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Based on today's appointment activity
          </p>
        </div>
      </motion.div>

    </div>
  )

  return (
    <Layout role="doctor">
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </Layout>
  )
}

export default DoctorDashboard