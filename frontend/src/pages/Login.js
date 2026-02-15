import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, } from "react-icons/fa";
import Logo from '../assets/MedAiLogo.png';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const userRole = result.user?.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } else {
      setErrors({ general: result.message });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }

          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}
      </style>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-white to-blue-600">
      <div className={`w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transition-all duration-500 ${shake ? 'animate-shake' : 'animate-fadeIn'}`}>

        <h2 className="text-3xl font-bold text-center text-blue-700">
          <div className='flex gap-3 items-center'>
            <img src={Logo} alt="MedAI Logo" className="logo w-[200px] h-[150px]" /> Login
          </div>
        </h2>

        {errors.general && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className='relative'>
            <FaEnvelope className="absolute left-3 top-3 text-gray-400"/>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 transition ${
                errors.email ? 'border-red-500 focus:ring-red-300' : 'focus:ring-blue-400'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                {errors.email}
              </p>
            )}
          </div>

          <div className='relative'>
            <FaLock className="absolute left-3 top-3 text-gray-400"/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 transition ${
                errors.password ? 'border-red-500 focus:ring-red-300' : 'focus:ring-blue-400'
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
      </div>
    </>
  );
};

export default Login;
