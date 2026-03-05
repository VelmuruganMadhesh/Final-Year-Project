import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiBarChart2,
  FiActivity,
  FiClock,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const Layout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
      { path: '/admin/doctors', label: 'Doctors', icon: <FiUsers /> },
      { path: '/admin/patients', label: 'Patients', icon: <FiUsers /> },
      { path: '/admin/departments', label: 'Departments', icon: <FiActivity /> },
      { path: '/admin/appointments', label: 'Appointments', icon: <FiCalendar /> },
      { path: '/admin/billing', label: 'Billing', icon: <FiDollarSign /> },
      { path: '/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
      { path: '/admin/ai-stats', label: 'AI Statistics', icon: <FiActivity /> }
    ],
    doctor: [
      { path: '/doctor', label: 'Dashboard', icon: <FiHome /> },
      { path: '/doctor/patients', label: 'My Patients', icon: <FiUsers /> },
      { path: '/doctor/appointments', label: 'Appointments', icon: <FiCalendar /> },
      { path: '/doctor/prescriptions', label: 'Prescriptions', icon: <FiFileText /> },
      { path: '/doctor/availability', label: 'Availability', icon: <FiClock /> }
    ],
    patient: [
      { path: '/patient', label: 'Dashboard', icon: <FiHome /> },
      { path: '/patient/appointments', label: 'Appointments', icon: <FiCalendar /> },
      { path: '/patient/predictions', label: 'AI Predictions', icon: <FiActivity /> },
      { path: '/patient/prescriptions', label: 'Prescriptions', icon: <FiFileText /> },
      { path: '/patient/records', label: 'Medical Records', icon: <FiFileText /> },
      { path: '/patient/billing', label: 'Billing', icon: <FiDollarSign /> }
    ]
  };

  const items = menuItems[role] || [];

  return (
    <div className="flex h-screen bg-sky-50">
      
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 ${
          collapsed ? 'w-20' : 'w-64'
        } bg-sky-500 text-white transition-all duration-300 ease-in-out lg:translate-x-0 lg:static shadow-lg`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sky-400">
          {!collapsed && (
            <h1 className="text-lg font-semibold tracking-wide">
              MEDCAI
            </h1>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block text-white hover:text-sky-100"
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-6 px-2 space-y-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center ${
                  collapsed ? 'justify-center' : ''
                } px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-md'
                    : 'text-white hover:bg-sky-600'
                }`}
              >
                <span className="text-lg">{item.icon}</span>

                {!collapsed && (
                  <span className="text-sm font-medium ml-3">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-sky-400">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${
              collapsed ? 'justify-center' : ''
            } px-4 py-2 rounded-lg text-white hover:bg-red-500 transition`}
          >
            <FiLogOut />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-4 lg:px-8 border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-sky-600"
          >
            <FiMenu size={22} />
          </button>

          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-700 font-medium">
              {user?.name}
            </span>
            <div className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-sky-50">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;