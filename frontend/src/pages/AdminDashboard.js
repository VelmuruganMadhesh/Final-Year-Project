import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";

import {
  FiUsers,
  FiActivity,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiUserCheck,
  FiPlusCircle,
  FiClipboard
} from "react-icons/fi";

import AdminDoctors from "../components/admin/AdminDoctors";
import AdminPatients from "../components/admin/AdminPatients";
import AdminDepartments from "../components/admin/AdminDepartments";
import AdminAppointments from "../components/admin/AdminAppointments";
import AdminBilling from "../components/admin/AdminBilling";
import AdminReports from "../components/admin/AdminReports";
import AdminAIStats from "../components/admin/AdminAIStats";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    pendingBills: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {

      const [patientsRes, doctorsRes, appointmentsRes, billingRes] =
        await Promise.all([
          axios.get("/api/patients"),
          axios.get("/api/doctors"),
          axios.get("/api/appointments"),
          axios.get("/api/billing/stats/revenue")
        ]);

      const today = new Date().toISOString().split("T")[0];

      const todayAppts = appointmentsRes.data.filter(
        (apt) => apt.appointmentDate?.split("T")[0] === today
      );

      setStats({
        totalPatients: patientsRes.data.length,
        totalDoctors: doctorsRes.data.length,
        totalAppointments: appointmentsRes.data.length,
        totalRevenue: billingRes.data.totalRevenue || 0,
        todayAppointments: todayAppts.length,
        pendingBills: billingRes.data.pendingBills || 0
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const DashboardHome = () => (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-xl shadow-lg text-white">
        <h1 className="text-3xl font-bold">Hospital Admin Dashboard</h1>
        <p className="opacity-80 mt-1">
          Manage hospital operations, doctors and patients
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <StatCard title="Total Patients" value={stats.totalPatients} icon={<FiUsers />} color="bg-blue-500" />
        <StatCard title="Doctors" value={stats.totalDoctors} icon={<FiUserCheck />} color="bg-green-500" />
        <StatCard title="Appointments" value={stats.totalAppointments} icon={<FiCalendar />} color="bg-purple-500" />
        <StatCard title="Today's Visits" value={stats.todayAppointments} icon={<FiActivity />} color="bg-orange-500" />
        <StatCard title="Revenue" value={`$${stats.totalRevenue}`} icon={<FiDollarSign />} color="bg-teal-500" />
        <StatCard title="Pending Bills" value={stats.pendingBills} icon={<FiTrendingUp />} color="bg-red-500" />

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <ActionCard
            title="Add Doctor"
            icon={<FiUserCheck />}
            color="bg-green-500"
          />

          <ActionCard
            title="Add Patient"
            icon={<FiPlusCircle />}
            color="bg-blue-500"
          />

          <ActionCard
            title="Create Appointment"
            icon={<FiCalendar />}
            color="bg-purple-500"
          />

          <ActionCard
            title="Generate Bill"
            icon={<FiDollarSign />}
            color="bg-orange-500"
          />

          <ActionCard
            title="View Reports"
            icon={<FiClipboard />}
            color="bg-indigo-500"
          />

        </div>
      </div>

    </div>
  );

  return (
    <Layout role="admin">
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="ai-stats" element={<AdminAIStats />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white shadow-md rounded-xl p-5 flex justify-between items-center hover:shadow-lg transition">

    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>

    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}>
      {icon}
    </div>

  </div>
);

const ActionCard = ({ title, icon, color }) => (
  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">

    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color}`}>
      {icon}
    </div>

    <p className="font-medium">{title}</p>

  </div>
);

export default AdminDashboard;