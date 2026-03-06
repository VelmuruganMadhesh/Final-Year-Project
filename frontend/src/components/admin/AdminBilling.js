import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiX, FiTrash2 } from "react-icons/fi";

const AdminBilling = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    tax: 0,
    discount: 0,
    items: [{ description: "", quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  const fetchBills = async () => {
    const res = await axios.get("/api/billing");
    setBills(Array.isArray(res.data) ? res.data : []);
  };

  const fetchPatients = async () => {
    const res = await axios.get("/api/patients");
    setPatients(Array.isArray(res.data) ? res.data : []);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = value;
    setFormData({ ...formData, items });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const subtotal = formData.items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0
  );

  const totalAmount =
    subtotal + Number(formData.tax) - Number(formData.discount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      patientId: formData.patientId,
      tax: Number(formData.tax),
      discount: Number(formData.discount),
      items: formData.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }))
    };

    await axios.post("/api/billing", payload);

    setShowModal(false);
    setFormData({
      patientId: "",
      tax: 0,
      discount: 0,
      items: [{ description: "", quantity: 1, unitPrice: 0 }]
    });

    fetchBills();
  };

  const statusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalRevenue = bills
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">
            Billing Dashboard
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-2xl shadow-md transition"
          >
            <FiPlus /> Create Bill
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-md">
            <p className="text-gray-500 text-sm">Total Bills</p>
            <h2 className="text-2xl font-bold">{bills.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-md">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-2xl font-bold text-green-600">
              ₹{totalRevenue.toFixed(2)}
            </h2>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-md">
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <h2 className="text-2xl font-bold text-yellow-600">
              {bills.filter(b => b.paymentStatus === "pending").length}
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-indigo-600">
                  {bill.invoiceNumber}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(
                    bill.paymentStatus
                  )}`}
                >
                  {bill.paymentStatus}
                </span>
              </div>

              <p className="text-gray-600 mb-2">
                Patient: {bill.patient?.userId?.name}
              </p>

              <p className="text-gray-500 text-sm mb-2">
                Date: {new Date(bill.createdAt).toLocaleDateString()}
              </p>

              <div className="text-xl font-bold text-indigo-700">
                ₹{bill.totalAmount?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 relative">

            <FiX
              className="absolute right-6 top-6 text-gray-400 hover:text-red-500 cursor-pointer text-xl"
              onClick={() => setShowModal(false)}
            />

            <h2 className="text-2xl font-bold text-indigo-600 mb-6">
              Create Bill
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <select
                required
                className="w-full border p-3 rounded-xl"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.userId?.name}
                  </option>
                ))}
              </select>

              {formData.items.map((item, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 items-center">
                  <input
                    className="col-span-2 border p-3 rounded-xl"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(i, "description", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    className="border p-3 rounded-xl"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(i, "quantity", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    className="border p-3 rounded-xl"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(i, "unitPrice", Number(e.target.value))
                    }
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="text-indigo-600"
              >
                + Add Item
              </button>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Tax"
                  className="border p-3 rounded-xl"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({ ...formData, tax: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Discount"
                  className="border p-3 rounded-xl"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                />
              </div>

              <div className="text-right font-semibold">
                Subtotal: ₹{subtotal.toFixed(2)} <br />
                Total: ₹{totalAmount.toFixed(2)}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl"
                >
                  Save Bill
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBilling;