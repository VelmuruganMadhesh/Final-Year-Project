import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import DoctorPatients from '../components/doctor/DoctorPatients';
import DoctorAppointments from '../components/doctor/DoctorAppointments';
import DoctorPrescriptions from '../components/doctor/DoctorPrescriptions';
import DoctorAvailability from '../components/doctor/DoctorAvailability';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        axios.get('/api/doctors/me/patients'),
        axios.get('/api/appointments')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsRes.data.filter(
        apt => apt.appointmentDate?.split('T')[0] === today
      );

      setStats({
        totalPatients: patientsRes.data.length,
        todayAppointments: todayAppts.length,
        pendingPrescriptions: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const DashboardHome = () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">My Patients</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPatients}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Appointments</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.todayAppointments}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Prescriptions</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.pendingPrescriptions}</p>
        </div>
      </div>
    </div>
  );

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
  );
};

export default DoctorDashboard;
