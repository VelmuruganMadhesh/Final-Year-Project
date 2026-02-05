import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    revenue: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, revenueRes] = await Promise.all([
        axios.get('/api/patients'),
        axios.get('/api/doctors'),
        axios.get('/api/appointments'),
        axios.get('/api/billing/stats/revenue')
      ]);

      setStats({
        totalPatients: patientsRes.data.length,
        totalDoctors: doctorsRes.data.length,
        totalAppointments: appointmentsRes.data.length,
        revenue: revenueRes.data.monthlyRevenue || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hospital Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Patients</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Doctors</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalDoctors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalAppointments}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
        <LineChart width={800} height={300} data={stats.revenue}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#0ea5e9" name="Revenue ($)" />
        </LineChart>
      </div>
    </div>
  );
};

export default AdminReports;
