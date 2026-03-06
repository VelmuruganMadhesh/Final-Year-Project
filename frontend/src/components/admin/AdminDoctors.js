import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiUser } from 'react-icons/fi';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    specialization: '',
    departmentId: '',
    licenseNumber: '',
    experience: 0,
    qualifications: '',
    consultationFee: 0
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length >= 0) {
      fetchUsers();
      fetchDepartments();
    }
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      const filtered = res.data.filter(
        u => u.role === 'doctor' && !doctors.find(d => d.userId?._id === u._id)
      );
      setUsers(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/doctors', {
        ...formData,
        qualifications: formData.qualifications.split(',').map(q => q.trim())
      });

      setShowModal(false);
      setFormData({
        userId: '',
        specialization: '',
        departmentId: '',
        licenseNumber: '',
        experience: 0,
        qualifications: '',
        consultationFee: 0
      });

      fetchDoctors();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding doctor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      try {
        await axios.delete(`/api/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        alert('Error removing doctor');
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-sky-100 to-white min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-sky-700">
            Doctors Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage hospital doctors and their details
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl shadow-lg transition duration-300"
        >
          <FiPlus size={18} />
          Add Doctor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-sky-100">
        <table className="min-w-full">
          <thead className="bg-sky-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Doctor</th>
              <th className="px-6 py-4 text-left">Specialization</th>
              <th className="px-6 py-4 text-left">Department</th>
              <th className="px-6 py-4 text-left">Experience</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((doctor) => (
              <tr
                key={doctor._id}
                className="border-b hover:bg-sky-50 transition duration-200"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="bg-sky-100 p-2 rounded-full">
                    <FiUser className="text-sky-600" />
                  </div>
                  {doctor.userId?.name || 'N/A'}
                </td>

                <td className="px-6 py-4">{doctor.specialization}</td>
                <td className="px-6 py-4">{doctor.department?.name || 'N/A'}</td>
                <td className="px-6 py-4">{doctor.experience} yrs</td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {doctors.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            No doctors added yet.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-sky-100">
            <h2 className="text-2xl font-bold text-sky-700 mb-6">
              Add New Doctor
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full border border-sky-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full border border-sky-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
                required
              />

              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full border border-sky-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full border border-sky-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
                required
              />

              <input
                type="number"
                placeholder="Experience (years)"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                className="w-full border border-sky-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
              />

              <input
                type="number"
                placeholder="Consultation Fee"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) })}
                className="w-full border border-sky-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
              />

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 border border-sky-300 rounded-lg text-sky-600 hover:bg-sky-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md"
                >
                  Add Doctor
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;