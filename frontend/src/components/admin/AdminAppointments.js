import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("appointmentDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/appointments");
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAppointments([]);
    }
    setLoading(false);
  };

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        const matchesStatus = statusFilter
          ? apt.status === statusFilter
          : true;

        const matchesSearch =
          apt.patient?.userId?.name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          apt.doctor?.userId?.name
            ?.toLowerCase()
            .includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (sortField === "appointmentDate") {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [appointments, search, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedData = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">
            Appointment Management
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient or doctor..."
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              className="pl-10 pr-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
            className="px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-600 text-xs uppercase">
              <tr>
                <th
                  onClick={() => handleSort("patient")}
                  className="px-6 py-4 cursor-pointer"
                >
                  Patient
                </th>
                <th
                  onClick={() => handleSort("doctor")}
                  className="px-6 py-4 cursor-pointer"
                >
                  Doctor
                </th>
                <th
                  onClick={() => handleSort("appointmentDate")}
                  className="px-6 py-4 cursor-pointer"
                >
                  Date
                </th>
                <th className="px-6 py-4">Time</th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-6 py-4 cursor-pointer"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-center">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    No Appointments Found
                  </td>
                </tr>
              ) : (
                paginatedData.map((apt) => (
                  <tr key={apt._id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {apt.patient?.userId?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {apt.doctor?.userId?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {apt.appointmentTime}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-xl disabled:opacity-40 hover:bg-indigo-200 transition"
          >
            <FiChevronLeft /> Previous
          </button>

          <span className="text-sm font-medium text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-xl disabled:opacity-40 hover:bg-indigo-200 transition"
          >
            Next <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;