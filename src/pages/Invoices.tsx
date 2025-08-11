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
  Receipt,
  CreditCard,
  Banknote,
  Square,
  Grid,
  RotateCcw,
  QrCode,
  Users,
  Settings
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spline from '@splinetool/react-spline';
import { useToastContext } from '../contexts/ToastContext';
// import InvoiceDraftManager from '../components/accounting/InvoiceDraftManager';
// import CreditNoteManager from '../components/accounting/CreditNoteManager';
// import PaymentGatewayManager from '../components/accounting/PaymentGatewayManager';

// Interfaces
interface Invoice {
  id: string;
  invoice_number: string;
  proforma_invoice_id?: string;
  proforma_invoice_number?: string;
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
  payment_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_rate: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  terms_conditions?: string;
  payment_terms: string;
  items: InvoiceItem[];
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
}

interface InvoiceItem {
  id: string;
  invoice_id: string;
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

const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    invoice_number: 'INV-2024-001',
    proforma_invoice_id: 'proforma-1',
    proforma_invoice_number: 'PRO-2024-001',
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
    payment_date: '2024-12-20',
    subtotal: 2500.00,
    tax_rate: 8.25,
    tax_amount: 206.25,
    discount_rate: 5,
    discount_amount: 125.00,
    total_amount: 2581.25,
    currency: 'USD',
    status: 'paid',
    payment_method: 'Credit Card',
    payment_reference: 'CC-2024-001',
    notes: 'Thank you for your business!',
    terms_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    payment_terms: 'Net 30',
    items: [
      {
        id: 'item-1',
        invoice_id: 'invoice-1',
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
    sent_at: '2024-12-19T10:30:00Z',
    paid_at: '2024-12-20T14:15:00Z'
  },
  {
    id: 'invoice-2',
    invoice_number: 'INV-2024-002',
    customer_id: 'cust-2',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.johnson@techcorp.com',
    customer_address: '456 Tech Ave, San Francisco, CA 94102',
    customer_phone: '+1-555-0456',
    company_id: 'comp-1',
    company_name: 'SaleToru Solutions',
    company_address: '789 Innovation Drive, Austin, TX 78701',
    company_phone: '+1-555-0789',
    company_email: 'info@saletoru.com',
    company_vat_number: 'US456789123',
    issue_date: '2024-12-19',
    due_date: '2025-01-19',
    subtotal: 1500.00,
    tax_rate: 8.25,
    tax_amount: 123.75,
    discount_rate: 0,
    discount_amount: 0,
    total_amount: 1623.75,
    currency: 'USD',
    status: 'sent',
    notes: 'Please review and process payment',
    terms_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    payment_terms: 'Net 30',
    items: [
      {
        id: 'item-2',
        invoice_id: 'invoice-2',
        product_id: 'prod-2',
        product_name: 'Basic Software License',
        product_sku: 'SW-BASIC-001',
        description: 'Annual subscription for basic features',
        quantity: 3,
        unit_price: 500.00,
        total_price: 1500.00,
        unit_of_measure: 'pcs'
      }
    ],
    created_by: 'user-1',
    created_at: '2024-12-19T11:00:00Z',
    updated_at: '2024-12-19T11:00:00Z',
    sent_at: '2024-12-19T11:30:00Z'
  }
];

// Invoice Modal Component
interface InvoiceModalProps {
  invoice?: Invoice;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  isNew: boolean;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  invoice, 
  onClose, 
  onSave, 
  isNew 
}) => {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    customer_phone: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax_rate: 8.25,
    tax_amount: 0,
    discount_rate: 0,
    discount_amount: 0,
    total_amount: 0,
    currency: 'USD',
    status: 'draft',
    payment_method: '',
    payment_reference: '',
    notes: '',
    terms_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    payment_terms: 'Net 30',
    items: [],
    ...invoice
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
    if (!formData.issue_date || !formData.due_date) {
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

    const invoiceData: Invoice = {
      id: invoice?.id || `invoice-${Date.now()}`,
      invoice_number: invoice?.invoice_number || `INV-${new Date().getFullYear()}-${String(mockInvoices.length + 1).padStart(3, '0')}`,
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
      payment_date: formData.payment_date,
      subtotal: formData.subtotal!,
      tax_rate: formData.tax_rate!,
      tax_amount: formData.tax_amount!,
      discount_rate: formData.discount_rate!,
      discount_amount: formData.discount_amount!,
      total_amount: formData.total_amount!,
      currency: formData.currency!,
      status: formData.status!,
      payment_method: formData.payment_method,
      payment_reference: formData.payment_reference,
      notes: formData.notes || '',
      terms_conditions: formData.terms_conditions!,
      payment_terms: formData.payment_terms!,
      items: formData.items!,
      created_by: 'user-1',
      created_at: invoice?.created_at || new Date().toISOString(),
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
            {isNew ? 'Create Invoice' : 'Edit Invoice'}
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
                <Receipt className="w-5 h-5" />
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

              {/* Payment Information */}
              {formData.status === 'paid' && (
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <h4 className="text-md font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Payment Date</label>
                      <input
                        type="date"
                        name="payment_date"
                        value={formData.payment_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Payment Method</label>
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      >
                        <option value="">Select Method</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Check">Check</option>
                        <option value="Cash">Cash</option>
                        <option value="PayPal">PayPal</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Payment Reference</label>
                    <input
                      type="text"
                      name="payment_reference"
                      value={formData.payment_reference}
                      onChange={handleChange}
                      placeholder="Transaction ID or reference"
                      className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    />
                  </div>
                </div>
              )}
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
              {isNew ? 'Create Invoice' : 'Update Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isInvoiceDraftManagerOpen, setIsInvoiceDraftManagerOpen] = useState(false);
  const [isCreditNoteManagerOpen, setIsCreditNoteManagerOpen] = useState(false);
  const [isPaymentGatewayManagerOpen, setIsPaymentGatewayManagerOpen] = useState(false);
  const { showToast } = useToastContext();

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleSaveInvoice = (invoiceData: Invoice) => {
    if (editingInvoice) {
      setInvoices(prev => 
        prev.map(inv => inv.id === editingInvoice.id ? { ...invoiceData, updated_at: new Date().toISOString() } : inv)
      );
      showToast({ title: 'Invoice updated successfully', type: 'success' });
    } else {
      setInvoices(prev => [...prev, invoiceData]);
      showToast({ title: 'Invoice created successfully', type: 'success' });
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    showToast({ title: 'Invoice deleted successfully', type: 'success' });
  };

  const handleSendInvoice = (invoice: Invoice) => {
    // Here you would implement email sending logic
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: 'sent', sent_at: new Date().toISOString() }
          : inv
      )
    );
    showToast({ title: 'Invoice sent successfully', type: 'success' });
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoice.id 
          ? { 
              ...inv, 
              status: 'paid', 
              paid_at: new Date().toISOString(),
              payment_date: new Date().toISOString().split('T')[0]
            }
          : inv
      )
    );
    showToast({ title: 'Invoice marked as paid', type: 'success' });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (invoice.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      case 'sent':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'paid':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'overdue':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'cancelled':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'partially_paid':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
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

  const getTotalRevenue = () => {
    return invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
  };

  const getOutstandingAmount = () => {
    return invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
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
              <h1 className="text-3xl font-bold text-white">Invoices</h1>
              <p className="text-[#b0b0d0] mt-1">Manage invoices and track payments</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setIsInvoiceDraftManagerOpen(true)}
                  variant="secondary"
                  size="sm"
                  icon={FileText}
                >
                  Invoice Drafts
                </Button>
                <Button
                  onClick={() => setIsCreditNoteManagerOpen(true)}
                  variant="secondary"
                  size="sm"
                  icon={RotateCcw}
                >
                  Credit Notes
                </Button>
                <Button
                  onClick={() => setIsPaymentGatewayManagerOpen(true)}
                  variant="secondary"
                  size="sm"
                  icon={CreditCard}
                >
                  Payment Gateway
                </Button>
              </div>
              <Button
                onClick={handleCreateInvoice}
                variant="gradient"
                size="lg"
                icon={Plus}
              >
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(getTotalRevenue())}</p>
                  </div>
                  <div className="p-3 bg-green-400/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Outstanding</p>
                    <p className="text-2xl font-bold text-orange-400">{formatCurrency(getOutstandingAmount())}</p>
                  </div>
                  <div className="p-3 bg-orange-400/20 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Total Invoices</p>
                    <p className="text-2xl font-bold text-white">{invoices.length}</p>
                  </div>
                  <div className="p-3 bg-blue-400/20 rounded-lg">
                    <Receipt className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </Card>
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
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="partially_paid">Partially Paid</option>
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
                          {invoice.status.replace('_', ' ').charAt(0).toUpperCase() + invoice.status.replace('_', ' ').slice(1)}
                        </Badge>
                        {invoice.proforma_invoice_number && (
                          <Badge variant="secondary" className="text-xs">
                            From: {invoice.proforma_invoice_number}
                          </Badge>
                        )}
                        {invoice.offer_number && (
                          <Badge variant="secondary" className="text-xs">
                            Offer: {invoice.offer_number}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                        <div>
                          <p className="text-[#b0b0d0]">Payment</p>
                          {invoice.payment_date ? (
                            <div>
                              <p className="text-green-400 font-medium">{new Date(invoice.payment_date).toLocaleDateString()}</p>
                              <p className="text-[#b0b0d0] text-xs">{invoice.payment_method}</p>
                            </div>
                          ) : (
                            <p className="text-[#b0b0d0] text-xs">Pending</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleEditInvoice(invoice)}
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                      >
                        View
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button
                          onClick={() => handleSendInvoice(invoice)}
                          variant="secondary"
                          size="sm"
                          icon={Send}
                        >
                          Send
                        </Button>
                      )}
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button
                          onClick={() => handleMarkAsPaid(invoice)}
                          variant="gradient"
                          size="sm"
                          icon={CheckCircle}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteInvoice(invoice.id)}
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
                <Receipt className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Invoices</h3>
                <p className="text-[#b0b0d0] mb-6">Create your first invoice to get started</p>
                <Button
                  onClick={handleCreateInvoice}
                  variant="gradient"
                  icon={Plus}
                >
                  Create Invoice
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <InvoiceModal
          invoice={editingInvoice || undefined}
          onClose={() => setShowModal(false)}
          onSave={handleSaveInvoice}
          isNew={!editingInvoice}
        />
      )}

      {/* Accounting Management Modals */}
      {/* <InvoiceDraftManager
        isOpen={isInvoiceDraftManagerOpen}
        onClose={() => setIsInvoiceDraftManagerOpen(false)}
      />
      
      <CreditNoteManager
        isOpen={isCreditNoteManagerOpen}
        onClose={() => setIsCreditNoteManagerOpen(false)}
      />
      
      <PaymentGatewayManager
        isOpen={isPaymentGatewayManagerOpen}
        onClose={() => setIsPaymentGatewayManagerOpen(false)}
      /> */}
    </div>
  );
};

export default Invoices; 