import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorAvailability = () => {
  const [availability, setAvailability] = useState({
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '09:00', end: '17:00', available: false },
    sunday: { start: '09:00', end: '17:00', available: false }
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await axios.get('/api/doctors');
      if (res.data.length > 0) {
        const doctor = res.data[0];
        if (doctor.availability) {
          setAvailability(doctor.availability);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.get('/api/doctors');
      if (res.data.length > 0) {
        await axios.put(`/api/doctors/${res.data[0]._id}/availability`, { availability });
        alert('Availability updated successfully');
      }
    } catch (error) {
      alert('Error updating availability');
    }
  };

  const updateDay = (day, field, value) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value
      }
    });
  };

  const days = Object.keys(availability);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Weekly Availability</h1>
          <p className="text-gray-500 mt-2">Set your working days and time slots</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          <div className="grid md:grid-cols-2 gap-6">
            {days.map((day) => (
              <div
                key={day}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  availability[day].available
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  
                  <h3 className="text-lg font-semibold capitalize text-gray-700">
                    {day}
                  </h3>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability[day].available}
                      onChange={(e) => updateDay(day, 'available', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                  </label>
                </div>

                {availability[day].available && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Start Time</label>
                      <input
                        type="time"
                        value={availability[day].start}
                        onChange={(e) => updateDay(day, 'start', e.target.value)}
                        className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-sm text-gray-500">End Time</label>
                      <input
                        type="time"
                        value={availability[day].end}
                        onChange={(e) => updateDay(day, 'end', e.target.value)}
                        className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleUpdate}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;