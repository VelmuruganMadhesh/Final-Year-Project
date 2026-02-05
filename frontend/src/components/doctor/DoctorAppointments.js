import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/api/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      alert('Error updating appointment');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Prediction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((apt) => (
              <tr key={apt._id}>
                <td className="px-6 py-4 whitespace-nowrap">{apt.patient?.userId?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{apt.appointmentTime || 'N/A'}</td>
                <td className="px-6 py-4">{apt.reason || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={apt.status}
                    onChange={(e) => updateStatus(apt._id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {apt.aiPrediction ? (
                    <div className="text-sm">
                      <div className="font-semibold">{apt.aiPrediction.predictedDisease}</div>
                      <div className={`text-xs ${
                        apt.aiPrediction.riskLevel === 'high' ? 'text-red-600' :
                        apt.aiPrediction.riskLevel === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        Risk: {apt.aiPrediction.riskLevel}
                      </div>
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {apt.aiScheduled && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      AI Scheduled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorAppointments;
