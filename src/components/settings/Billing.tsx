import React, { useState } from 'react';
import { CreditCard, FileText, Building, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const Billing: React.FC = () => {
  const [company, setCompany] = useState({ name: 'SaleToru Inc.', address: 'Tallinn, Estonia', vat: 'EE123456789' });
  const [plan, setPlan] = useState('Pro');
  const [payment, setPayment] = useState({ card: '**** 1234', expiry: '12/26' });
  const [invoices] = useState([
    { id: '1', date: '2024-06-01', amount: 49, status: 'paid' },
    { id: '2', date: '2024-05-01', amount: 49, status: 'paid' }
  ]);

  const handlePlanChange = (newPlan: string) => {
    setPlan(newPlan);
    // Log: Plan changed
  };

  const handlePaymentUpdate = () => {
    // Log: Payment updated
    alert('Payment method updated!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Building className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Company Info</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Company Name</label>
            <input
              type="text"
              value={company.name}
              onChange={e => setCompany({ ...company, name: e.target.value })}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Address</label>
            <input
              type="text"
              value={company.address}
              onChange={e => setCompany({ ...company, address: e.target.value })}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">VAT Number</label>
            <input
              type="text"
              value={company.vat}
              onChange={e => setCompany({ ...company, vat: e.target.value })}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Subscription & Payment</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Plan</label>
            <select
              value={plan}
              onChange={e => handlePlanChange(e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Payment Method</label>
            <div className="flex items-center gap-2">
              <span className="text-white">{payment.card}</span>
              <span className="text-secondary-400">Exp: {payment.expiry}</span>
              <button
                onClick={handlePaymentUpdate}
                className="ml-2 px-3 py-2 bg-primary-600 text-white rounded-md"
              >Update</button>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Invoice History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-secondary-400">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-secondary-700">
                  <td className="p-2">{inv.date}</td>
                  <td className="p-2">${inv.amount}</td>
                  <td className="p-2">
                    {inv.status === 'paid' && <Badge variant="success" size="sm"><CheckCircle className="inline w-4 h-4 mr-1" />Paid</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Billing; 