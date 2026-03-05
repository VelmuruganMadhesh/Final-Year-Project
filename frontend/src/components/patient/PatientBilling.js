import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiFileText, FiCalendar, FiDollarSign, FiDownload } from 'react-icons/fi'

const PatientBilling = () => {
  const [bills, setBills] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const billsPerPage = 5

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const res = await axios.get('/api/billing')
      setBills(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDownload = (id) => {
    window.open(`/api/billing/${id}/download`, '_blank')
  }

  const handlePayNow = async (billId) => {
    try {
      const res = await axios.post(`/api/billing/${billId}/pay`)
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.invoiceNumber.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || bill.paymentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const indexOfLast = currentPage * billsPerPage
  const indexOfFirst = indexOfLast - billsPerPage
  const currentBills = filteredBills.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredBills.length / billsPerPage)

  const getStatusStyle = (status) => {
    if (status === 'paid')
      return 'bg-green-100 text-green-700'
    if (status === 'pending')
      return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">My Bills</h1>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {currentBills.map((bill) => (
            <div
              key={bill._id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FiFileText className="text-blue-500" />
                    Invoice #{bill.invoiceNumber}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                    <FiCalendar />
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${getStatusStyle(bill.paymentStatus)}`}>
                  {bill.paymentStatus}
                </span>
              </div>

              {bill.items && bill.items.length > 0 && (
                <div className="mb-4 space-y-2">
                  {bill.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <span>{item.description}</span>
                      <span className="font-medium">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Subtotal: ${bill.subtotal.toFixed(2)}</p>
                  {bill.tax > 0 && <p>Tax: ${bill.tax.toFixed(2)}</p>}
                  {bill.discount > 0 && (
                    <p className="text-red-500">
                      Discount: -${bill.discount.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <FiDollarSign />
                    ${bill.totalAmount.toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleDownload(bill._id)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                  >
                    <FiDownload />
                    Download
                  </button>

                  {bill.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => handlePayNow(bill._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientBilling