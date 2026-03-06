import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/api/departments");
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/departments", formData);
      setShowModal(false);
      setFormData({ name: "", description: "" });
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding department");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this department?")) {
      try {
        await axios.delete(`/api/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        alert("Error deleting department");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-white p-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-sky-600">
            Departments Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-2xl shadow-md transition"
          >
            <FiPlus /> Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition border border-sky-100"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-sky-600">
                  {dept.name}
                </h3>
                <button
                  onClick={() => handleDelete(dept._id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                {dept.description || "No description provided"}
              </p>

              <div className="flex justify-between text-sm">
                <div className="bg-sky-50 px-4 py-3 rounded-xl text-center w-1/2 mr-2">
                  <p className="text-sky-600 font-semibold text-lg">
                    {dept.totalDoctors || 0}
                  </p>
                  <p className="text-gray-500">Doctors</p>
                </div>

                <div className="bg-sky-50 px-4 py-3 rounded-xl text-center w-1/2 ml-2">
                  <p className="text-sky-600 font-semibold text-lg">
                    {dept.totalPatients || 0}
                  </p>
                  <p className="text-gray-500">Patients</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 relative border border-sky-100">

            <FiX
              className="absolute right-6 top-6 text-gray-400 hover:text-red-500 cursor-pointer text-xl"
              onClick={() => setShowModal(false)}
            />

            <h2 className="text-2xl font-bold text-sky-600 mb-6">
              Add Department
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-sky-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-sky-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-500 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-sky-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 border border-sky-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md transition"
                >
                  Add
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDepartments;