import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiUpload, FiDownload, FiFileText, FiX } from 'react-icons/fi'

const PatientRecords = () => {
  const [records, setRecords] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    recordType: 'test_report',
    title: '',
    description: '',
    file: null
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/medical-records')
      setRecords(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileChange = (e) => {
    setUploadData({ ...uploadData, file: e.target.files[0] })
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('file', uploadData.file)
    formData.append('recordType', uploadData.recordType)
    formData.append('title', uploadData.title)
    formData.append('description', uploadData.description)

    try {
      await axios.post('/api/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowUploadModal(false)
      setUploadData({
        recordType: 'test_report',
        title: '',
        description: '',
        file: null
      })
      fetchRecords()
    } catch (error) {
      alert('Upload failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FiFileText className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
              <p className="text-gray-500 text-sm">Manage and access your health documents</p>
            </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow"
          >
            <FiUpload />
            Upload
          </button>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FiFileText className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No records uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {records.map((record) => (
              <div
                key={record._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{record.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {record.recordType.replace('_', ' ')} • {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>

                  {record.fileUrl && (
                    <a
                      href={`http://localhost:5000${record.fileUrl}`}
                      download
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                    >
                      <FiDownload />
                    </a>
                  )}
                </div>

                {record.description && (
                  <p className="text-gray-600 text-sm mb-3">{record.description}</p>
                )}

                {record.testResults && (
                  <div className="mt-3 bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                      Test Results
                    </h4>
                    <p className="text-xs text-gray-600">
                      {record.testResults.testName}: {JSON.stringify(record.testResults.results)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

              <div className="flex justify-between items-center border-b px-6 py-4">
                <h2 className="text-xl font-bold">Upload Medical Record</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">

                <select
                  value={uploadData.recordType}
                  onChange={(e) => setUploadData({ ...uploadData, recordType: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="test_report">Test Report</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="treatment">Treatment</option>
                  <option value="surgery">Surgery</option>
                  <option value="other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />

                <textarea
                  placeholder="Description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  rows="3"
                />

                <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full"
                    required
                  />
                  {uploadData.file && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {uploadData.file.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    Upload
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PatientRecords