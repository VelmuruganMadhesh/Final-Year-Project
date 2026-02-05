import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientBilling = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get('/api/billing');
      setBills(res.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bills</h1>
      
      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Invoice: {bill.invoiceNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Date: {new Date(bill.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                bill.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {bill.paymentStatus}
              </span>
            </div>
            
            {bill.items && bill.items.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                <ul className="space-y-1">
                  {bill.items.map((item, index) => (
                    <li key={index} className="text-gray-600">
                      {item.description} - ${item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Subtotal: ${bill.subtotal.toFixed(2)}</p>
                {bill.tax > 0 && <p className="text-sm text-gray-600">Tax: ${bill.tax.toFixed(2)}</p>}
                {bill.discount > 0 && <p className="text-sm text-gray-600">Discount: ${bill.discount.toFixed(2)}</p>}
              </div>
              <div className="text-xl font-bold text-primary-600">
                Total: ${bill.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientBilling;
