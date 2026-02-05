import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import PatientAppointments from '../components/patient/PatientAppointments';
import PatientPredictions from '../components/patient/PatientPredictions';
import PatientPrescriptions from '../components/patient/PatientPrescriptions';
import PatientRecords from '../components/patient/PatientRecords';
import PatientBilling from '../components/patient/PatientBilling';

const PatientDashboard = () => {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    prescriptions: 0,
    medicalRecords: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, recordsRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/prescriptions'),
        axios.get('/api/medical-records')
      ]);

      const upcoming = appointmentsRes.data.filter(
        apt => apt.status === 'pending' || apt.status === 'confirmed'
      );

      setStats({
        upcomingAppointments: upcoming.length,
        prescriptions: prescriptionsRes.data.length,
        medicalRecords: recordsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const DashboardHome = () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Upcoming Appointments</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.upcomingAppointments}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Prescriptions</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.prescriptions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Medical Records</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.medicalRecords}</p>
        </div>
      </div>
    </div>
  );

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
  );
};

export default PatientDashboard;
