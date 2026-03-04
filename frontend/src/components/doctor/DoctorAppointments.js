import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'appointmentDate', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '' });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: page,
        pageSize,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        searchTerm,
        filters: JSON.stringify(filters)
      };

      const res = await axios.get('/api/appointments', { params });

      setAppointments(Array.isArray(res?.data?.data) ? res.data.data : []);
      setTotalRecords(res?.data?.filteredRecords ?? 0);
    } catch {
      setAppointments([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortConfig, searchTerm, filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setPage(1);
  };

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const totalPages = useMemo(() => {
    return Math.ceil((totalRecords || 0) / pageSize);
  }, [totalRecords, pageSize]);

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";

    if (status === "pending") return `${base} bg-yellow-100 text-yellow-700`;
    if (status === "confirmed") return `${base} bg-blue-100 text-blue-700`;
    if (status === "completed") return `${base} bg-green-100 text-green-700`;
    if (status === "cancelled") return `${base} bg-red-100 text-red-700`;

    return `${base} bg-gray-100 text-gray-600`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-blue-100">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>

        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-1/3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-xs uppercase">
              <tr>
                <th onClick={() => handleSort('patient')} className="px-6 py-4 text-left cursor-pointer">
                  Patient {sortConfig.key === 'patient' && (sortConfig.direction === 'asc' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />)}
                </th>
                <th onClick={() => handleSort('appointmentDate')} className="px-6 py-4 text-left cursor-pointer">
                  Date {sortConfig.key === 'appointmentDate' && (sortConfig.direction === 'asc' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />)}
                </th>
                <th className="px-6 py-4 text-left">Time</th>
                <th className="px-6 py-4 text-left">Reason</th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 text-left cursor-pointer">
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />)}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">Loading...</td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 font-medium">{apt.patient?.userId?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">{apt.appointmentTime || 'N/A'}</td>
                    <td className="px-6 py-4">{apt.reason || 'N/A'}</td>
                    <td className="px-6 py-4">

                      {apt.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(apt._id, "confirmed")} className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700">Confirm</button>
                          <button onClick={() => updateStatus(apt._id, "cancelled")} className="px-3 py-1 text-xs rounded bg-red-100 text-red-700">Cancel</button>
                        </div>
                      )}

                      {apt.status === "confirmed" && (
                        <button onClick={() => updateStatus(apt._id, "completed")} className="px-3 py-1 text-xs rounded bg-green-100 text-green-700">
                          Complete
                        </button>
                      )}

                      {(apt.status === "completed" || apt.status === "cancelled") && (
                        <span className={getStatusBadge(apt.status)}>
                          {apt.status}
                        </span>
                      )}

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">No appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalRecords > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, totalRecords)} to {Math.min(page * pageSize, totalRecords)} of {totalRecords}
            </span>

            <div className="flex gap-3">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-4 py-1 rounded bg-blue-100 text-blue-600">
                Previous
              </button>

              <span>Page {page} of {totalPages}</span>

              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-4 py-1 rounded bg-blue-100 text-blue-600">
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorAppointments;