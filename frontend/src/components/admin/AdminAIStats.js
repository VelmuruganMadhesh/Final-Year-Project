import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
      const res = await api.get('/api/ai/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total AI Predictions</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPredictions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Scheduled Appointments</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.aiScheduledAppointments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Disease Predictions</h3>
          <BarChart width={400} height={300} data={stats.diseaseStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Risk Level Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={stats.riskLevelStats}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ _id, count }) => `${_id}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {stats.riskLevelStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default AdminAIStats;
