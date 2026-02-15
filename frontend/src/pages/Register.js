import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoPerson } from "react-icons/io5";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Full name is required";

    if (!formData.email)
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.phone)
      newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit phone number";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";

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
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      navigate('/login');
    } else {
      setErrors({ general: result.message });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }

          @keyframes slideFade {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }

          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }

          .animate-dropdown {
            animation: slideFade 0.3s ease-out forwards;
          }
        `}
      </style>

      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-white to-blue-600 py-10">

        <div
          className={`w-full max-w-4xl bg-white p-8 rounded-2xl shadow-2xl 
          transition-all duration-500 flex flex-col max-h-[95vh] overflow-y-auto
          ${shake ? 'animate-shake' : 'animate-fadeIn'}`}
        >

          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
            Register
          </h2>

          {errors.general && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-6 text-sm animate-fadeIn">
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >

            <InputField name="name" placeholder="Full Name" errors={errors} handleChange={handleChange} />
            <InputField type="email" name="email" placeholder="Email" errors={errors} handleChange={handleChange} />
            <InputField name="phone" placeholder="Phone (10 digits)" errors={errors} handleChange={handleChange} />
            <InputField name="address" placeholder="Address" errors={errors} handleChange={handleChange} />

            <InputField type="password" name="password" placeholder="Password" errors={errors} handleChange={handleChange} />
            <InputField type="password" name="confirmPassword" placeholder="Confirm Password" errors={errors} handleChange={handleChange} />

            {/* Date of Birth */}
            <div>
              <input
                type="date"
                name="dateOfBirth"
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 transition ${
                  errors.dateOfBirth
                    ? 'border-red-500 focus:ring-red-300'
                    : 'focus:ring-blue-400'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Role */}
            <AnimatedSelect
              name="role"
              value={formData.role}
              options={[
                { value: "patient", label: "Patient" },
                { value: "doctor", label: "Doctor" }
              ]}
              handleChange={handleChange}
            />

            {/* Gender */}
            <AnimatedSelect
              name="gender"
              value={formData.gender}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" }
              ]}
              handleChange={handleChange}
            />

            {/* Button full width */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg 
                           hover:bg-blue-700 transition duration-300 
                           disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </>
  );
};

/* Reusable Input */
const InputField = ({ type = "text", name, placeholder, errors, handleChange }) => (
  <div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={handleChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 transition ${
        errors[name]
          ? 'border-red-500 focus:ring-red-300'
          : 'focus:ring-blue-400'
      }`}
    />
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1 animate-fadeIn">
        {errors[name]}
      </p>
    )}
  </div>
);

/* Animated Select */
const AnimatedSelect = ({ name, value, options, handleChange }) => (
  <div className="relative group animate-dropdown">
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 border rounded-lg bg-white
                 focus:ring-2 focus:ring-blue-400
                 transition-all duration-300
                 focus:scale-[1.02]
                 hover:scale-[1.02]
                 appearance-none cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>

    <div className="absolute right-4 top-3 pointer-events-none 
                    transition-transform duration-300 
                    group-focus-within:rotate-180">
      ▼
    </div>
  </div>
);

export default Register;
