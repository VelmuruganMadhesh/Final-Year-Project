import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiX } from 'react-icons/fi';

const AdminBilling = () => {
const [bills, setBills] = useState([]);
const [patients, setPatients] = useState([]);
const [showModal, setShowModal] = useState(false);

const [formData, setFormData] = useState({
patientId: '',
tax: 0,
discount: 0,
items: [{ description: '', quantity: 1, unitPrice: 0 }]
});

useEffect(() => {
fetchBills();
fetchPatients();
}, []);

const fetchBills = async () => {
const res = await axios.get('/api/billing');
setBills(res.data);
};

const fetchPatients = async () => {
const res = await axios.get('/api/patients');
setPatients(res.data);
};

const handleItemChange = (index, field, value) => {
const items = [...formData.items];
items[index][field] = value;
setFormData({ ...formData, items });
};

const addItem = () => {
setFormData({
...formData,
items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
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
  items: formData.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice
  }))
};

await axios.post('/api/billing', payload);

setShowModal(false);
setFormData({
  patientId: '',
  tax: 0,
  discount: 0,
  items: [{ description: '', quantity: 1, unitPrice: 0 }]
});

fetchBills();

};

return ( <div className="p-6"> <div className="flex justify-between mb-6"> <h1 className="text-3xl font-bold">Billing Management</h1>
<button
onClick={() => setShowModal(true)}
className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
> <FiPlus className="mr-2" />
Create Bill </button> </div>
  <div className="bg-white shadow rounded">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Invoice</th>
          <th className="p-3 text-left">Patient</th>
          <th className="p-3 text-left">Amount</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        {bills.map(bill => (
          <tr key={bill._id} className="border-t">
            <td className="p-3">{bill.invoiceNumber}</td>
            <td className="p-3">{bill.patient?.userId?.name}</td>
            <td className="p-3">₹{bill.totalAmount.toFixed(2)}</td>
            <td className="p-3">{bill.paymentStatus}</td>
            <td className="p-3">
              {new Date(bill.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl p-6 rounded relative">
        <FiX
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => setShowModal(false)}
        />

        <h2 className="text-2xl font-bold mb-4">Create Bill</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            required
            className="w-full border p-2 rounded"
            value={formData.patientId}
            onChange={(e) =>
              setFormData({ ...formData, patientId: e.target.value })
            }
          >
            <option value="">Select Patient</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>
                {p.userId?.name}
              </option>
            ))}
          </select>

          {formData.items.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <input
                className="border p-2 col-span-2"
                placeholder="Description"
                value={item.description}
                onChange={e =>
                  handleItemChange(i, 'description', e.target.value)
                }
              />
              <input
                type="number"
                min="1"
                className="border p-2"
                value={item.quantity}
                onChange={e =>
                  handleItemChange(i, 'quantity', Number(e.target.value))
                }
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  className="border p-2 w-full"
                  value={item.unitPrice}
                  onChange={e =>
                    handleItemChange(i, 'unitPrice', Number(e.target.value))
                  }
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 text-sm"
          >
            + Add Item
          </button>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              className="border p-2"
              placeholder="Tax"
              value={formData.tax}
              onChange={e =>
                setFormData({ ...formData, tax: e.target.value })
              }
            />
            <input
              type="number"
              className="border p-2"
              placeholder="Discount"
              value={formData.discount}
              onChange={e =>
                setFormData({ ...formData, discount: e.target.value })
              }
            />
          </div>

          <div className="text-right font-semibold">
            Subtotal: ₹{subtotal.toFixed(2)} <br />
            Total: ₹{totalAmount.toFixed(2)}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
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
