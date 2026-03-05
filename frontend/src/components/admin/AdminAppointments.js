import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("appointmentDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await axios.get("/api/appointments");
    setAppointments(res.data || []);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-indigo-600 mb-6">
          Admin Appointment Dashboard
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={search}
            onChange={(e) => {
              setCurrentPage(1);
              setSearch(e.target.value);
            }}
            className="px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-300"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
            className="px-4 py-2 border rounded-xl shadow-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() =>
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
            }
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl"
          >
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedData.map((apt) => (
                <tr key={apt._id} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4">
                    {apt.patient?.userId?.name}
                  </td>
                  <td className="px-6 py-4">
                    {apt.doctor?.userId?.name}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(apt.appointmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{apt.appointmentTime}</td>
                  <td className="px-6 py-4 capitalize">
                    {apt.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-indigo-100 rounded-lg disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-indigo-100 rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;