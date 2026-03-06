import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FiCpu, FiActivity, FiCalendar } from 'react-icons/fi';

const AdminAIStats = () => {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    diseaseStats: [],
    riskLevelStats: [],
    aiScheduledAppointments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/ai/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', '#0369a1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-sky-700">
          AI Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Monitor AI disease predictions and risk insights
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <FiCpu className="text-sky-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total AI Predictions</p>
              <h2 className="text-3xl font-bold text-sky-700">
                {stats.totalPredictions}
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
              <p className="text-gray-500 text-sm">AI Scheduled Appointments</p>
              <h2 className="text-3xl font-bold text-sky-700">
                {stats.aiScheduledAppointments}
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Disease Prediction Bar Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-100 p-8">

          <h3 className="text-2xl font-semibold text-sky-700 mb-6">
            Disease Prediction Analysis
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.diseaseStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#0369a1" />
              <YAxis stroke="#0369a1" />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#0ea5e9"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* Risk Level Pie Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-100 p-8">

          <h3 className="text-2xl font-semibold text-sky-700 mb-6">
            Risk Level Distribution
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={stats.riskLevelStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats.riskLevelStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
};

export default AdminAIStats;