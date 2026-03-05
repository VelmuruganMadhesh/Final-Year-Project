import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortDate, setSortDate] = useState("latest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/api/appointments");
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      alert("Error updating appointment");
    }
  };

  // SEARCH
  let filtered = appointments.filter((apt) =>
    apt.patient?.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // FILTER
  if (filterStatus !== "all") {
    filtered = filtered.filter((apt) => apt.status === filterStatus);
  }

  // SORT
  filtered.sort((a, b) => {
    if (sortDate === "latest") {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    }
    return new Date(a.appointmentDate) - new Date(b.appointmentDate);
  });

  // PAGINATION
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAppointments = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Doctor Appointment
      </h1>

      {/* FILTER + SEARCH */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow">

        <input
          type="text"
          placeholder="Search patient..."
          className="border px-3 py-2 rounded w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={sortDate}
          onChange={(e) => setSortDate(e.target.value)}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Patient</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">Reason</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">AI Prediction</th>
            </tr>
          </thead>

          <tbody>
            {currentAppointments.map((apt) => (
              <tr key={apt._id} className="border-t hover:bg-gray-50">

                <td className="px-6 py-4 font-medium">
                  {apt.patient?.userId?.name || "N/A"}
                </td>

                <td className="px-6 py-4">
                  {apt.appointmentDate
                    ? new Date(apt.appointmentDate).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="px-6 py-4">
                  {apt.appointmentTime || "N/A"}
                </td>

                <td className="px-6 py-4">{apt.reason || "N/A"}</td>

                <td className="px-6 py-4">
                  <select
                    value={apt.status}
                    onChange={(e) => updateStatus(apt._id, e.target.value)}
                    className={`px-2 py-1 rounded text-sm ${getStatusColor(
                      apt.status
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="px-6 py-4 text-sm">
                  {apt.aiPrediction ? (
                    <div>
                      <div className="font-semibold">
                        {apt.aiPrediction.predictedDisease}
                      </div>

                      <div
                        className={`text-xs ${
                          apt.aiPrediction.riskLevel === "high"
                            ? "text-red-600"
                            : apt.aiPrediction.riskLevel === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        Risk: {apt.aiPrediction.riskLevel}
                      </div>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-2">

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {index + 1}
          </button>
        ))}

      </div>

    </div>
  );
};

export default DoctorAppointments;