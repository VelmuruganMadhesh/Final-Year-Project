import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import {
  FiUsers, FiActivity, FiCalendar, FiDollarSign,
  FiTrendingUp, FiHeart, FiUserCheck
} from 'react-icons/fi';
import AdminDoctors from '../components/admin/AdminDoctors';
import AdminPatients from '../components/admin/AdminPatients';
import AdminDepartments from '../components/admin/AdminDepartments';
import AdminAppointments from '../components/admin/AdminAppointments';
import AdminBilling from '../components/admin/AdminBilling';
import AdminReports from '../components/admin/AdminReports';
import AdminAIStats from '../components/admin/AdminAIStats';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    pendingBills: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, billingRes] = await Promise.all([
        axios.get('/api/patients'),
        axios.get('/api/doctors'),
        axios.get('/api/appointments'),
        axios.get('/api/billing/stats/revenue')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsRes.data.filter(
        apt => apt.appointmentDate?.split('T')[0] === today
      );

      setStats({
        totalPatients: patientsRes.data.length,
        totalDoctors: doctorsRes.data.length,
        totalAppointments: appointmentsRes.data.length,
        totalRevenue: billingRes.data.totalRevenue || 0,
        todayAppointments: todayAppts.length,
        pendingBills: billingRes.data.pendingBills || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const DashboardHome = () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<FiUsers className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<FiUserCheck className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={<FiCalendar className="w-8 h-8" />}
          color="purple"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<FiActivity className="w-8 h-8" />}
          color="orange"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<FiDollarSign className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          title="Pending Bills"
          value={stats.pendingBills}
          icon={<FiTrendingUp className="w-8 h-8" />}
          color="red"
        />
      </div>
    </div>
  );

  return (
    <Layout role="admin">
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="ai-stats" element={<AdminAIStats />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} text-white p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
