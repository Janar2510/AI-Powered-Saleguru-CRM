import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  Percent,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Send,
  Grid,
  Square
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spline from '@splinetool/react-spline';
import { useToastContext } from '../contexts/ToastContext';

// Interfaces
interface ProformaInvoice {
  id: string;
  invoice_number: string;
  offer_id?: string;
  offer_number?: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  customer_phone?: string;
  company_id: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_vat_number?: string;
  issue_date: string;
  due_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_rate: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  notes?: string;
  terms_conditions?: string;
  payment_terms: string;
  items: ProformaInvoiceItem[];
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  accepted_at?: string;
  converted_to_invoice_id?: string;
}

interface ProformaInvoiceItem {
  id: string;
  proforma_invoice_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_of_measure: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  company?: string;
  vat_number?: string;
}

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  vat_number?: string;
  logo_url?: string;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    address: '123 Business St, New York, NY 10001',
    company: 'Smith Enterprises',
    vat_number: 'US123456789'
  },
  {
    id: 'cust-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0456',
    address: '456 Tech Ave, San Francisco, CA 94102',
    company: 'TechCorp Inc.',
    vat_number: 'US987654321'
  }
];

const mockCompany: Company = {
  id: 'comp-1',
  name: 'SaleToru Solutions',
  address: '789 Innovation Drive, Austin, TX 78701',
  phone: '+1-555-0789',
  email: 'info@saletoru.com',
  vat_number: 'US456789123',
  logo_url: '/public/saletoru-logo.png'
};

const mockProformaInvoices: ProformaInvoice[] = [
  {
    id: 'proforma-1',
    invoice_number: 'PRO-2024-001',
    offer_id: 'offer-1',
    offer_number: 'OFF-2024-001',
    customer_id: 'cust-1',
    customer_name: 'John Smith',
    customer_email: 'john.smith@example.com',
    customer_address: '123 Business St, New York, NY 10001',
    customer_phone: '+1-555-0123',
    company_id: 'comp-1',
    company_name: 'SaleToru Solutions',
    company_address: '789 Innovation Drive, Austin, TX 78701',
    company_phone: '+1-555-0789',
    company_email: 'info@saletoru.com',
    company_vat_number: 'US456789123',
    issue_date: '2024-12-19',
    due_date: '2025-01-19',
    valid_until: '2025-01-19',
    subtotal: 2500.00,
    tax_rate: 8.25,
    tax_amount: 206.25,
    discount_rate: 5,
    discount_amount: 125.00,
    total_amount: 2581.25,
    currency: 'USD',
    status: 'sent',
    notes: 'Thank you for your business!',
    terms_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    payment_terms: 'Net 30',
    items: [
      {
        id: 'item-1',
        proforma_invoice_id: 'proforma-1',
        product_id: 'prod-1',
        product_name: 'Premium Software License',
        product_sku: 'SW-PREM-001',
        description: 'Annual subscription for premium features',
        quantity: 5,
        unit_price: 500.00,
        total_price: 2500.00,
        unit_of_measure: 'pcs'
      }
    ],
    created_by: 'user-1',
    created_at: '2024-12-19T10:00:00Z',
    updated_at: '2024-12-19T10:00:00Z',
    sent_at: '2024-12-19T10:30:00Z'
  }
];

// Proforma Invoice Modal Component
interface ProformaInvoiceModalProps {
  proformaInvoice?: ProformaInvoice;
  onClose: () => void;
  onSave: (proformaInvoice: ProformaInvoice) => void;
  isNew: boolean;
}

const ProformaInvoiceModal: React.FC<ProformaInvoiceModalProps> = ({ 
  proformaInvoice, 
  onClose, 
  onSave, 
  isNew 
}) => {
  const [formData, setFormData] = useState<Partial<ProformaInvoice>>({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    customer_phone: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax_rate: 8.25,
    tax_amount: 0,
    discount_rate: 0,
    discount_amount: 0,
    total_amount: 0,
    currency: 'USD',
    status: 'draft',
    notes: '',
    terms_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    payment_terms: 'Net 30',
    items: [],
    ...proformaInvoice
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_address: customer.address,
      customer_phone: customer.phone || ''
    }));
    setShowCustomerModal(false);
  };

  const calculateTotals = () => {
    const subtotal = formData.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
    const taxAmount = (subtotal * (formData.tax_rate || 0)) / 100;
    const discountAmount = (subtotal * (formData.discount_rate || 0)) / 100;
    const total = subtotal + taxAmount - discountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.tax_rate, formData.discount_rate]);

  const validateForm = () => {
    if (!formData.customer_name || !formData.customer_email || !formData.customer_address) {
      return false;
    }
    if (!formData.issue_date || !formData.due_date || !formData.valid_until) {
      return false;
    }
    if (!formData.items || formData.items.length === 0) {
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const invoiceData: ProformaInvoice = {
      id: proformaInvoice?.id || `proforma-${Date.now()}`,
      invoice_number: proformaInvoice?.invoice_number || `PRO-${new Date().getFullYear()}-${String(mockProformaInvoices.length + 1).padStart(3, '0')}`,
      customer_id: formData.customer_id!,
      customer_name: formData.customer_name!,
      customer_email: formData.customer_email!,
      customer_address: formData.customer_address!,
      customer_phone: formData.customer_phone || '',
      company_id: mockCompany.id,
      company_name: mockCompany.name,
      company_address: mockCompany.address,
      company_phone: mockCompany.phone,
      company_email: mockCompany.email,
      company_vat_number: mockCompany.vat_number,
      issue_date: formData.issue_date!,
      due_date: formData.due_date!,
      valid_until: formData.valid_until!,
      subtotal: formData.subtotal!,
      tax_rate: formData.tax_rate!,
      tax_amount: formData.tax_amount!,
      discount_rate: formData.discount_rate!,
      discount_amount: formData.discount_amount!,
      total_amount: formData.total_amount!,
      currency: formData.currency!,
      status: formData.status!,
      notes: formData.notes || '',
      terms_conditions: formData.terms_conditions!,
      payment_terms: formData.payment_terms!,
      items: formData.items!,
      created_by: 'user-1',
      created_at: proformaInvoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave(invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#23233a]/95 backdrop-blur-md rounded-2xl border-2 border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isNew ? 'Create Proforma Invoice' : 'Edit Proforma Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#b0b0d0] hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  variant="secondary"
                  size="sm"
                >
                  Select Customer
                </Button>
                {selectedCustomer && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {selectedCustomer.name}
                  </Badge>
                )}
              </div>

              <input
                type="text"
                name="customer_name"
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                required
              />

              <input
                type="email"
                name="customer_email"
                placeholder="Customer Email"
                value={formData.customer_email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                required
              />

              <input
                type="text"
                name="customer_phone"
                placeholder="Customer Phone"
                value={formData.customer_phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />

              <textarea
                name="customer_address"
                placeholder="Customer Address"
                value={formData.customer_address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                required
              />
            </div>

            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Issue Date</label>
                  <input
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Valid Until</label>
                <input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="tax_rate"
                    value={formData.tax_rate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Discount Rate (%)</label>
                  <input
                    type="number"
                    name="discount_rate"
                    value={formData.discount_rate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Payment Terms</label>
                <input
                  type="text"
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  placeholder="Net 30"
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
              >
                Add Item
              </Button>
            </div>

            {/* Items table would go here */}
            <div className="bg-[#23233a]/30 rounded-lg p-4 border border-white/10">
              <p className="text-[#b0b0d0] text-center">Items will be added here</p>
            </div>
          </div>

          {/* Totals Section */}
          <div className="bg-[#23233a]/30 rounded-lg p-4 border border-white/10">
            <div className="grid grid-cols-2 gap-4 text-right">
              <div className="text-[#b0b0d0]">Subtotal:</div>
              <div className="text-white font-semibold">${formData.subtotal?.toFixed(2)}</div>
              
              <div className="text-[#b0b0d0]">Tax ({formData.tax_rate}%):</div>
              <div className="text-white font-semibold">${formData.tax_amount?.toFixed(2)}</div>
              
              <div className="text-[#b0b0d0]">Discount ({formData.discount_rate}%):</div>
              <div className="text-white font-semibold">-${formData.discount_amount?.toFixed(2)}</div>
              
              <div className="text-[#b0b0d0] text-lg font-semibold border-t border-white/20 pt-2">Total:</div>
              <div className="text-[#a259ff] text-lg font-bold border-t border-white/20 pt-2">
                ${formData.total_amount?.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes..."
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Terms & Conditions</label>
              <textarea
                name="terms_conditions"
                value={formData.terms_conditions}
                onChange={handleChange}
                rows={3}
                placeholder="Payment terms and conditions..."
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              icon={isNew ? Plus : Edit}
            >
              {isNew ? 'Create Proforma Invoice' : 'Update Proforma Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const ProformaInvoices: React.FC = () => {
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>(mockProformaInvoices);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ProformaInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { showToast } = useToastContext();

  const handleCreateProformaInvoice = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleEditProformaInvoice = (invoice: ProformaInvoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleSaveProformaInvoice = (invoiceData: ProformaInvoice) => {
    if (editingInvoice) {
      setProformaInvoices(prev => 
        prev.map(inv => inv.id === editingInvoice.id ? { ...invoiceData, updated_at: new Date().toISOString() } : inv)
      );
      showToast({ title: 'Proforma Invoice updated successfully', type: 'success' });
    } else {
      setProformaInvoices(prev => [...prev, invoiceData]);
      showToast({ title: 'Proforma Invoice created successfully', type: 'success' });
    }
  };

  const handleDeleteProformaInvoice = (invoiceId: string) => {
    setProformaInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    showToast({ title: 'Proforma Invoice deleted successfully', type: 'success' });
  };

  const handleSendProformaInvoice = (invoice: ProformaInvoice) => {
    // Here you would implement email sending logic
    setProformaInvoices(prev => 
      prev.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: 'sent', sent_at: new Date().toISOString() }
          : inv
      )
    );
    showToast({ title: 'Proforma Invoice sent successfully', type: 'success' });
  };

  const handleConvertToInvoice = (invoice: ProformaInvoice) => {
    // Here you would implement conversion logic
    setProformaInvoices(prev => 
      prev.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: 'converted' }
          : inv
      )
    );
    showToast({ title: 'Proforma Invoice converted to invoice', type: 'success' });
  };

  const filteredInvoices = proformaInvoices.filter(invoice => {
    const matchesSearch = invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProformaInvoice['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      case 'sent':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'accepted':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'rejected':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'expired':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'converted':
        return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Proforma Invoices</h1>
              <p className="text-[#b0b0d0] mt-1">Create and manage proforma invoices from offers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateProformaInvoice}
                variant="gradient"
                size="lg"
                icon={Plus}
              >
                Create Proforma Invoice
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="converted">Converted</option>
                </select>
              </div>

              <div className="flex space-x-1 bg-[#23233a]/50 border-2 border-white/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.map(invoice => (
              <Card key={invoice.id} className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {invoice.invoice_number}
                        </h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                        {invoice.offer_number && (
                          <Badge variant="secondary" className="text-xs">
                            From: {invoice.offer_number}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-[#b0b0d0]">Customer</p>
                          <p className="text-white font-medium">{invoice.customer_name}</p>
                          <p className="text-[#b0b0d0] text-xs">{invoice.customer_email}</p>
                        </div>
                        <div>
                          <p className="text-[#b0b0d0]">Issue Date</p>
                          <p className="text-white font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                          <p className="text-[#b0b0d0] text-xs">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[#b0b0d0]">Total Amount</p>
                          <p className="text-[#a259ff] font-bold text-lg">{formatCurrency(invoice.total_amount)}</p>
                          <p className="text-[#b0b0d0] text-xs">{invoice.items.length} items</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleEditProformaInvoice(invoice)}
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                      >
                        View
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button
                          onClick={() => handleSendProformaInvoice(invoice)}
                          variant="secondary"
                          size="sm"
                          icon={Send}
                        >
                          Send
                        </Button>
                      )}
                      {invoice.status === 'accepted' && (
                        <Button
                          onClick={() => handleConvertToInvoice(invoice)}
                          variant="gradient"
                          size="sm"
                          icon={FileText}
                        >
                          Convert to Invoice
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteProformaInvoice(invoice.id)}
                        variant="secondary"
                        size="sm"
                        icon={Trash2}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Proforma Invoices</h3>
                <p className="text-[#b0b0d0] mb-6">Create your first proforma invoice to get started</p>
                <Button
                  onClick={handleCreateProformaInvoice}
                  variant="gradient"
                  icon={Plus}
                >
                  Create Proforma Invoice
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProformaInvoiceModal
          proformaInvoice={editingInvoice || undefined}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProformaInvoice}
          isNew={!editingInvoice}
        />
      )}
    </div>
  );
};

export default ProformaInvoices; 