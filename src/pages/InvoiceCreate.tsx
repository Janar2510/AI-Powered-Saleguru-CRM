import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Save,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Trash2,
  Calculator
} from 'lucide-react';

import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge
} from '../contexts/BrandDesignContext';

import { useInvoices, CreateInvoiceData } from '../hooks/useInvoices';
import { useContacts } from '../hooks/useContacts';
import { BrandDropdown } from '../components/ui/BrandDropdown';

interface InvoiceLineItem {
  product_name: string;
  product_sku: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  discount_percent: number;
  tax_percent: number;
}

const InvoiceCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createInvoice, loading } = useInvoices();
  const { contacts } = useContacts();

  const [formData, setFormData] = useState({
    contact_id: '',
    organization_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'EUR',
    notes: '',
    terms_conditions: 'Payment due within 30 days.',
    payment_terms: 'Net 30',
    billing_address: '',
    shipping_address: ''
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      product_name: '',
      product_sku: '',
      description: '',
      quantity: 1,
      unit_price_cents: 0,
      discount_percent: 0,
      tax_percent: 10
    }
  ]);

  const calculateLineTotal = (item: InvoiceLineItem) => {
    const baseAmount = item.quantity * item.unit_price_cents;
    const discountAmount = baseAmount * (item.discount_percent / 100);
    return baseAmount - discountAmount;
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };

  const calculateTaxAmount = () => {
    return lineItems.reduce((sum, item) => {
      const lineTotal = calculateLineTotal(item);
      return sum + (lineTotal * (item.tax_percent / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      product_name: '',
      product_sku: '',
      description: '',
      quantity: 1,
      unit_price_cents: 0,
      discount_percent: 0,
      tax_percent: 10
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contact_id && !formData.organization_id) {
      alert('Please select a contact or organization');
      return;
    }

    if (lineItems.length === 0 || lineItems.some(item => !item.product_name || item.unit_price_cents <= 0)) {
      alert('Please add at least one valid line item');
      return;
    }

    const invoiceData: CreateInvoiceData = {
      ...formData,
      contact_id: formData.contact_id || undefined,
      organization_id: formData.organization_id || undefined,
      items: lineItems
    };

    const createdInvoice = await createInvoice(invoiceData);
    if (createdInvoice) {
      navigate('/invoices');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title={id ? "Edit Invoice" : "Create Invoice"}
        subtitle="Create and manage invoice details"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/invoices')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </BrandButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Invoice Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Contact/Customer
                  </label>
                  <BrandDropdown
                    value={formData.contact_id}
                    onChange={(value) => handleFormChange('contact_id', value)}
                    options={[
                      { value: '', label: 'Select Contact...' },
                      ...contacts.map(contact => ({
                        value: contact.id,
                        label: `${contact.name} (${contact.email})`
                      }))
                    ]}
                    placeholder="Choose a contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Currency
                  </label>
                  <BrandDropdown
                    value={formData.currency}
                    onChange={(value) => handleFormChange('currency', value)}
                    options={[
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'GBP', label: 'GBP (£)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Invoice Date
                  </label>
                  <BrandInput
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => handleFormChange('invoice_date', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Due Date
                  </label>
                  <BrandInput
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleFormChange('due_date', e.target.value)}
                    required
                  />
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Line Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BrandCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Line Items
                </h3>
                <BrandButton type="button" variant="secondary" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </BrandButton>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Product/Service
                        </label>
                        <BrandInput
                          type="text"
                          placeholder="Product name"
                          value={item.product_name}
                          onChange={(e) => handleLineItemChange(index, 'product_name', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          SKU
                        </label>
                        <BrandInput
                          type="text"
                          placeholder="SKU"
                          value={item.product_sku}
                          onChange={(e) => handleLineItemChange(index, 'product_sku', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Quantity
                        </label>
                        <BrandInput
                          type="number"
                          min="1"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Unit Price ({formData.currency})
                        </label>
                        <BrandInput
                          type="number"
                          min="0"
                          step="0.01"
                          value={(item.unit_price_cents / 100).toFixed(2)}
                          onChange={(e) => handleLineItemChange(index, 'unit_price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                          required
                        />
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-white/70 mb-1">
                            Tax %
                          </label>
                          <BrandInput
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.tax_percent}
                            onChange={(e) => handleLineItemChange(index, 'tax_percent', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        {lineItems.length > 1 && (
                          <BrandButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </BrandButton>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Description
                      </label>
                      <BrandInput
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      />
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-sm text-white/70">Line Total: </span>
                      <span className="text-lg font-semibold text-white">
                        {formatCurrency(calculateLineTotal(item) + (calculateLineTotal(item) * (item.tax_percent / 100)))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </BrandCard>
          </motion.div>

          {/* Invoice Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Invoice Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between text-white/70">
                  <span>Tax:</span>
                  <span>{formatCurrency(calculateTaxAmount())}</span>
                </div>
                
                <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold text-white">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    placeholder="Internal notes..."
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    placeholder="Payment terms..."
                    value={formData.terms_conditions}
                    onChange={(e) => handleFormChange('terms_conditions', e.target.value)}
                  />
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-end space-x-4"
          >
            <BrandButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </BrandButton>
            
            <BrandButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : (id ? 'Update Invoice' : 'Create Invoice')}
            </BrandButton>
          </motion.div>
        </form>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default InvoiceCreate;
