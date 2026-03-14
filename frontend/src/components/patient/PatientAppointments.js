import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiSearch, FiCalendar } from "react-icons/fi";

const PatientAppointments = () => {

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    symptoms: []
  });

  const [symptomInput, setSymptomInput] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    const res = await axios.get("/api/appointments");
    setAppointments(res.data);
  };

  const fetchDoctors = async () => {
    const res = await axios.get("/api/doctors");
    setDoctors(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("/api/appointments", {
      ...formData,
      symptoms:
        formData.symptoms.length > 0
          ? formData.symptoms
          : symptomInput.split(",").map((s) => s.trim()).filter((s) => s)
    });

    setShowModal(false);

    setFormData({
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      symptoms: []
    });

    setSymptomInput("");

    fetchAppointments();
  };

  const addSymptom = () => {
    if (!symptomInput.trim()) return;

    setFormData({
      ...formData,
      symptoms: [...formData.symptoms, symptomInput]
    });

    setSymptomInput("");
  };

  let filtered = appointments.filter((apt) =>
    apt.doctor?.userId?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  if (statusFilter !== "all") {
    filtered = filtered.filter((apt) => apt.status === statusFilter);
  }

  const statusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          My Appointments
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2  bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <FiPlus />
          Book Appointment
        </button>

      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">

        <div className="flex items-center border px-3 py-2 rounded-lg w-72">
          <FiSearch className="text-gray-400 mr-2"/>
          <input
            type="text"
            placeholder="Search doctor..."
            className="outline-none w-full"
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>

        <select
          className="border px-3 py-2 rounded-lg"
          onChange={(e)=>setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
        </select>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filtered.map((apt) => (

          <div
            key={apt._id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-5"
          >

            <div className="flex justify-between mb-3">

              <h2 className="font-semibold text-lg">
                Dr. {apt.doctor?.userId?.name}
              </h2>

              <span className={`text-xs px-3 py-1 rounded-full ${statusColor(apt.status)}`}>
                {apt.status}
              </span>

            </div>

            <div className="text-sm text-gray-600 space-y-1">

              <p className="flex items-center gap-2">
                <FiCalendar/>
                {new Date(apt.appointmentDate).toLocaleDateString()}
              </p>

              <p>Time: {apt.appointmentTime}</p>

              <p className="text-gray-500">
                {apt.reason || "No reason provided"}
              </p>

            </div>

            {apt.aiPrediction && (

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">

                <p className="font-medium">
                  {apt.aiPrediction.predictedDisease}
                </p>

                <p className={`text-xs ${
                  apt.aiPrediction.riskLevel === "high"
                    ? "text-red-600"
                    : apt.aiPrediction.riskLevel === "medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}>
                  Risk: {apt.aiPrediction.riskLevel}
                </p>

              </div>

            )}

          </div>

        ))}

      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

            <h2 className="text-2xl font-bold mb-4">
              Book Appointment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <select
                required
                className="w-full border rounded-lg px-3 py-2"
                value={formData.doctorId}
                onChange={(e)=>
                  setFormData({...formData,doctorId:e.target.value})
                }
              >
                <option value="">Select Doctor</option>

                {doctors.map((doctor)=>(
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.userId?.name} - {doctor.specialization}
                  </option>
                ))}

              </select>

              <input
                type="date"
                required
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e)=>
                  setFormData({...formData,appointmentDate:e.target.value})
                }
              />

              <input
                type="time"
                required
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e)=>
                  setFormData({...formData,appointmentTime:e.target.value})
                }
              />

              <textarea
                placeholder="Reason"
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e)=>
                  setFormData({...formData,reason:e.target.value})
                }
              />

              <div className="flex gap-2">

                <input
                  placeholder="Enter symptom"
                  value={symptomInput}
                  onChange={(e)=>setSymptomInput(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                />

                <button
                  type="button"
                  onClick={addSymptom}
                  className="bg-gray-200 px-3 rounded-lg"
                >
                  Add
                </button>

              </div>

              <div className="flex flex-wrap gap-2">

                {formData.symptoms.map((s,i)=>(
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {s}
                  </span>
                ))}

              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={()=>setShowModal(false)}
                  className="border px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Book
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default PatientAppointments;