import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Layout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { path: '/admin', label: 'Dashboard', icon: '📊' },
      { path: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
      { path: '/admin/patients', label: 'Patients', icon: '👥' },
      { path: '/admin/departments', label: 'Departments', icon: '🏥' },
      { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
      { path: '/admin/billing', label: 'Billing', icon: '💰' },
      { path: '/admin/reports', label: 'Reports', icon: '📈' },
      { path: '/admin/ai-stats', label: 'AI Statistics', icon: '🤖' }
    ],
    doctor: [
      { path: '/doctor', label: 'Dashboard', icon: '📊' },
      { path: '/doctor/patients', label: 'My Patients', icon: '👥' },
      { path: '/doctor/appointments', label: 'Appointments', icon: '📅' },
      { path: '/doctor/prescriptions', label: 'Prescriptions', icon: '💊' },
      { path: '/doctor/availability', label: 'Availability', icon: '⏰' }
    ],
    patient: [
      { path: '/patient', label: 'Dashboard', icon: '📊' },
      { path: '/patient/appointments', label: 'Appointments', icon: '📅' },
      { path: '/patient/predictions', label: 'AI Predictions', icon: '🤖' },
      { path: '/patient/prescriptions', label: 'Prescriptions', icon: '💊' },
      { path: '/patient/records', label: 'Medical Records', icon: '📋' },
      { path: '/patient/billing', label: 'Billing', icon: '💰' }
    ]
  };

  const items = menuItems[role] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-primary-900">
          <h1 className="text-xl font-bold">Hospital System</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-8">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-primary-700 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-primary-700 hover:text-white transition-colors rounded"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.name}</span>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
