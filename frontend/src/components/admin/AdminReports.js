import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FiUsers, FiUserCheck, FiCalendar, FiTrendingUp } from 'react-icons/fi';

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
      const [patientsRes, doctorsRes, appointmentsRes, revenueRes] =
        await Promise.all([
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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 p-6">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-sky-700">
          Hospital Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Overview of hospital performance and revenue insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <FiUsers className="text-sky-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <h2 className="text-2xl font-bold text-sky-700">
                {stats.totalPatients}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <FiUserCheck className="text-sky-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Doctors</p>
              <h2 className="text-2xl font-bold text-sky-700">
                {stats.totalDoctors}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <FiCalendar className="text-sky-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Appointments</p>
              <h2 className="text-2xl font-bold text-sky-700">
                {stats.totalAppointments}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <FiTrendingUp className="text-sky-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Revenue Months</p>
              <h2 className="text-2xl font-bold text-sky-700">
                {stats.revenue.length}
              </h2>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-100 p-8">

        <h3 className="text-2xl font-semibold text-sky-700 mb-6">
          Monthly Revenue Analysis
        </h3>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" stroke="#0369a1" />
            <YAxis stroke="#0369a1" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-sky-100 p-8 mt-10">

        <h3 className="text-2xl font-semibold text-sky-700 mb-6">
          Revenue Comparison
        </h3>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stats.revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" stroke="#0369a1" />
            <YAxis stroke="#0369a1" />
            <Tooltip />
            <Bar dataKey="total" fill="#38bdf8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default AdminReports;