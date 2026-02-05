import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiDownload } from 'react-icons/fi';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    recordType: 'test_report',
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/medical-records');
      setRecords(res.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleFileChange = (e) => {
    setUploadData({ ...uploadData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('recordType', uploadData.recordType);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);

    try {
      await axios.post('/api/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadData({
        recordType: 'test_report',
        title: '',
        description: '',
        file: null
      });
      fetchRecords();
    } catch (error) {
      alert('Error uploading record');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <FiUpload className="mr-2" />
          Upload Record
        </button>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{record.title}</h3>
                <p className="text-sm text-gray-600">
                  Type: {record.recordType} | Date: {new Date(record.date).toLocaleDateString()}
                </p>
              </div>
              {record.fileUrl && (
                <a
                  href={`http://localhost:5000${record.fileUrl}`}
                  download
                  className="text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FiDownload className="mr-1" />
                  Download
                </a>
              )}
            </div>
            {record.description && (
              <p className="text-gray-600">{record.description}</p>
            )}
            {record.testResults && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold text-gray-700 mb-2">Test Results</h4>
                <p className="text-sm text-gray-600">
                  {record.testResults.testName}: {JSON.stringify(record.testResults.results)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Upload Medical Record</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Record Type</label>
                <select
                  value={uploadData.recordType}
                  onChange={(e) => setUploadData({ ...uploadData, recordType: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="test_report">Test Report</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="treatment">Treatment</option>
                  <option value="surgery">Surgery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
