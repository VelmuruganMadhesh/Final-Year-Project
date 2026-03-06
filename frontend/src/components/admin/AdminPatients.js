import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiPhone, FiMail, FiDroplet } from 'react-icons/fi';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/patients');
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 p-6">

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-sky-700">
          Patients Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          View and manage all registered patients
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <FiUsers className="text-sky-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <h2 className="text-2xl font-bold text-sky-700">
                {patients.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div>
            <p className="text-gray-500 text-sm">Most Common Blood Group</p>
            <h2 className="text-xl font-bold text-sky-700 mt-2">
              {patients[0]?.bloodGroup || 'N/A'}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
          <div>
            <p className="text-gray-500 text-sm">Assigned Doctors</p>
            <h2 className="text-xl font-bold text-sky-700 mt-2">
              {
                new Set(
                  patients
                    .map(p => p.assignedDoctor?.userId?.name)
                    .filter(Boolean)
                ).size
              }
            </h2>
          </div>
        </div>

      </div>

      {/* Patients Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden">

        <div className="bg-sky-600 px-6 py-4">
          <h2 className="text-white text-lg font-semibold">
            Patient Records
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-6 py-4 text-left text-sky-700 font-semibold">Patient</th>
                <th className="px-6 py-4 text-left text-sky-700 font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-sky-700 font-semibold">Blood Group</th>
                <th className="px-6 py-4 text-left text-sky-700 font-semibold">Assigned Doctor</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient._id}
                  className="border-b hover:bg-sky-50 transition duration-200"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">
                      {patient.userId?.name || 'N/A'}
                    </p>
                  </td>

                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FiMail className="text-sky-500" />
                      {patient.userId?.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FiPhone className="text-sky-500" />
                      {patient.userId?.phone || 'N/A'}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
                      <FiDroplet size={14} />
                      {patient.bloodGroup || 'N/A'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {patient.assignedDoctor?.userId?.name ? (
                      <span className="text-sky-700 font-medium">
                        Dr. {patient.assignedDoctor.userId.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        Not Assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {patients.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No patients available.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminPatients;