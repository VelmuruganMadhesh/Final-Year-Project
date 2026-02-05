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

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Set Availability</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 w-32">
                <input
                  type="checkbox"
                  checked={availability[day].available}
                  onChange={(e) => updateDay(day, 'available', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="font-semibold capitalize">{day}</label>
              </div>
              
              {availability[day].available && (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Start Time</label>
                    <input
                      type="time"
                      value={availability[day].start}
                      onChange={(e) => updateDay(day, 'start', e.target.value)}
                      className="ml-2 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">End Time</label>
                    <input
                      type="time"
                      value={availability[day].end}
                      onChange={(e) => updateDay(day, 'end', e.target.value)}
                      className="ml-2 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <button
          onClick={handleUpdate}
          className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Update Availability
        </button>
      </div>
    </div>
  );
};

export default DoctorAvailability;
