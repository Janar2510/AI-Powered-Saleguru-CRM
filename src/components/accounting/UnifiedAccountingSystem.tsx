import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, ShoppingCart, DollarSign, CreditCard, Users, Settings, Plus, Eye, Edit, Download, Send, RefreshCw, CheckCircle, Clock, AlertTriangle, QrCode, RotateCcw, Building, Package, Truck, BarChart3 } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Quotation {
  id: string;
  number: string;
  customer: string;
  customer_email: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  total_amount: number;
  currency: string;
  valid_until: Date;
  created_at: Date;
  items: QuotationItem[];
  discount_rate: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  notes?: string;
  terms_conditions?: string;
  template_id?: string;
  signature_required: boolean;
  signed_at?: Date;
}

interface QuotationItem {
  id: string;
  product_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_attributes?: { [key: string]: string };
}

interface SalesOrder {
  id: string;
  number: string;
  quotation_id?: string;
  customer: string;
  customer_email: string;
  status: 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: Date;
  items: SalesOrderItem[];
  shipping_address: string;
  billing_address: string;
  payment_terms: string;
  delivery_date?: Date;
}

interface SalesOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_attributes?: { [key: string]: string };
}

interface ProformaInvoice {
  id: string;
  number: string;
  sales_order_id?: string;
  quotation_id?: string;
  customer: string;
  customer_email: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: Date;
  due_date: Date;
  items: ProformaInvoiceItem[];
  payment_terms: string;
  notes?: string;
}

interface ProformaInvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Invoice {
  id: string;
  number: string;
  proforma_invoice_id?: string;
  sales_order_id?: string;
  customer: string;
  customer_email: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: Date;
  due_date: Date;
  paid_at?: Date;
  items: InvoiceItem[];
  payment_terms: string;
  payment_method?: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit_price: number;
  currency: string;
  stock_quantity: number;
  variants: ProductVariant[];
  images: string[];
  is_active: boolean;
}

interface ProductVariant {
  id: string;
  product_id: string;
  attributes: { [key: string]: string };
  sku: string;
  unit_price: number;
  stock_quantity: number;
}

interface Payment {
  id: string;
  invoice_id: string;
  customer: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'cash' | 'check';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: Date;
  completed_at?: Date;
}

const UnifiedAccountingSystem: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'quotations' | 'orders' | 'proforma' | 'invoices' | 'payments' | 'products' | 'templates' | 'analytics'>('quotations');
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: 'Q-001',
      number: 'Q-2024-001',
      customer: 'Tech Solutions Inc.',
      customer_email: 'procurement@techsolutions.com',
      status: 'sent',
      total_amount: 5000.00,
      currency: 'USD',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-1',
          product_id: 'PROD-001',
          product_name: 'CRM Software License',
          description: 'Annual subscription for 10 users',
          quantity: 1,
          unit_price: 3000.00,
          total_price: 3000.00
        },
        {
          id: 'item-2',
          product_id: 'PROD-002',
          product_name: 'Implementation Services',
          description: 'Setup and configuration',
          quantity: 20,
          unit_price: 100.00,
          total_price: 2000.00
        }
      ],
      discount_rate: 0.10,
      discount_amount: 500.00,
      tax_rate: 0.08,
      tax_amount: 360.00,
      notes: 'Special pricing for enterprise customer',
      signature_required: true
    }
  ]);

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    {
      id: 'SO-001',
      number: 'SO-2024-001',
      quotation_id: 'Q-001',
      customer: 'Tech Solutions Inc.',
      customer_email: 'procurement@techsolutions.com',
      status: 'confirmed',
      total_amount: 5000.00,
      currency: 'USD',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-1',
          product_id: 'PROD-001',
          product_name: 'CRM Software License',
          description: 'Annual subscription for 10 users',
          quantity: 1,
          unit_price: 3000.00,
          total_price: 3000.00
        },
        {
          id: 'item-2',
          product_id: 'PROD-002',
          product_name: 'Implementation Services',
          description: 'Setup and configuration',
          quantity: 20,
          unit_price: 100.00,
          total_price: 2000.00
        }
      ],
      shipping_address: '123 Business St, Tech City, TC 12345',
      billing_address: '123 Business St, Tech City, TC 12345',
      payment_terms: 'Net 30',
      delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>([
    {
      id: 'PF-001',
      number: 'PF-2024-001',
      sales_order_id: 'SO-001',
      customer: 'Tech Solutions Inc.',
      customer_email: 'procurement@techsolutions.com',
      status: 'sent',
      total_amount: 5000.00,
      currency: 'USD',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-1',
          product_id: 'PROD-001',
          product_name: 'CRM Software License',
          description: 'Annual subscription for 10 users',
          quantity: 1,
          unit_price: 3000.00,
          total_price: 3000.00
        },
        {
          id: 'item-2',
          product_id: 'PROD-002',
          product_name: 'Implementation Services',
          description: 'Setup and configuration',
          quantity: 20,
          unit_price: 100.00,
          total_price: 2000.00
        }
      ],
      payment_terms: 'Net 30',
      notes: 'Proforma invoice for order confirmation'
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      number: 'INV-2024-001',
      proforma_invoice_id: 'PF-001',
      customer: 'Tech Solutions Inc.',
      customer_email: 'procurement@techsolutions.com',
      status: 'sent',
      total_amount: 5000.00,
      currency: 'USD',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      due_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-1',
          product_id: 'PROD-001',
          product_name: 'CRM Software License',
          description: 'Annual subscription for 10 users',
          quantity: 1,
          unit_price: 3000.00,
          total_price: 3000.00
        },
        {
          id: 'item-2',
          product_id: 'PROD-002',
          product_name: 'Implementation Services',
          description: 'Setup and configuration',
          quantity: 20,
          unit_price: 100.00,
          total_price: 2000.00
        }
      ],
      payment_terms: 'Net 30'
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY-001',
      invoice_id: 'INV-001',
      customer: 'Tech Solutions Inc.',
      amount: 5000.00,
      currency: 'USD',
      method: 'credit_card',
      status: 'completed',
      transaction_id: 'txn_123456789',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 'PROD-001',
      name: 'CRM Software License',
      sku: 'CRM-LIC-001',
      description: 'Annual subscription for CRM software',
      category: 'Software',
      unit_price: 3000.00,
      currency: 'USD',
      stock_quantity: 999,
      variants: [
        {
          id: 'VAR-001',
          product_id: 'PROD-001',
          attributes: { 'Users': '10', 'Duration': '1 Year' },
          sku: 'CRM-LIC-001-10-1Y',
          unit_price: 3000.00,
          stock_quantity: 999
        }
      ],
      images: ['/images/crm-software.jpg'],
      is_active: true
    },
    {
      id: 'PROD-002',
      name: 'Implementation Services',
      sku: 'IMPL-SVC-001',
      description: 'Professional implementation and setup services',
      category: 'Services',
      unit_price: 100.00,
      currency: 'USD',
      stock_quantity: 999,
      variants: [
        {
          id: 'VAR-002',
          product_id: 'PROD-002',
          attributes: { 'Service Type': 'Setup', 'Duration': 'Per Hour' },
          sku: 'IMPL-SVC-001-SETUP-HR',
          unit_price: 100.00,
          stock_quantity: 999
        }
      ],
      images: ['/images/implementation.jpg'],
      is_active: true
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleCreateQuotation = () => {
    const newQuotation: Quotation = {
      id: `Q-${Date.now()}`,
      number: `Q-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      customer: 'New Customer',
      customer_email: 'customer@example.com',
      status: 'draft',
      total_amount: 0,
      currency: 'USD',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      items: [],
      discount_rate: 0,
      discount_amount: 0,
      tax_rate: 0.08,
      tax_amount: 0,
      signature_required: false
    };

    setQuotations(prev => [...prev, newQuotation]);
    showToast({
      title: 'Quotation Created',
      description: 'New quotation draft created',
      type: 'success'
    });
  };

  const handleCreateSalesOrder = (quotationId?: string) => {
    const newSalesOrder: SalesOrder = {
      id: `SO-${Date.now()}`,
      number: `SO-${new Date().getFullYear()}-${String(salesOrders.length + 1).padStart(3, '0')}`,
      quotation_id: quotationId,
      customer: 'New Customer',
      customer_email: 'customer@example.com',
      status: 'draft',
      total_amount: 0,
      currency: 'USD',
      created_at: new Date(),
      items: [],
      shipping_address: '',
      billing_address: '',
      payment_terms: 'Net 30'
    };

    setSalesOrders(prev => [...prev, newSalesOrder]);
    showToast({
      title: 'Sales Order Created',
      description: 'New sales order draft created',
      type: 'success'
    });
  };

  const handleCreateProformaInvoice = (salesOrderId?: string) => {
    const newProformaInvoice: ProformaInvoice = {
      id: `PF-${Date.now()}`,
      number: `PF-${new Date().getFullYear()}-${String(proformaInvoices.length + 1).padStart(3, '0')}`,
      sales_order_id: salesOrderId,
      customer: 'New Customer',
      customer_email: 'customer@example.com',
      status: 'draft',
      total_amount: 0,
      currency: 'USD',
      created_at: new Date(),
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: [],
      payment_terms: 'Net 30'
    };

    setProformaInvoices(prev => [...prev, newProformaInvoice]);
    showToast({
      title: 'Proforma Invoice Created',
      description: 'New proforma invoice draft created',
      type: 'success'
    });
  };

  const handleCreateInvoice = (proformaInvoiceId?: string) => {
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      proforma_invoice_id: proformaInvoiceId,
      customer: 'New Customer',
      customer_email: 'customer@example.com',
      status: 'draft',
      total_amount: 0,
      currency: 'USD',
      created_at: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [],
      payment_terms: 'Net 30'
    };

    setInvoices(prev => [...prev, newInvoice]);
    showToast({
      title: 'Invoice Created',
      description: 'New invoice draft created',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'confirmed': return 'success';
      case 'accepted': return 'success';
      case 'paid': return 'success';
      case 'completed': return 'success';
      case 'overdue': return 'danger';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      case 'expired': return 'warning';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-[#a259ff]" />
              <span>Unified Accounting System</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Manage quotations, orders, invoices, and payments in one integrated system
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#23233a]/30 overflow-x-auto">
          {[
            { id: 'quotations', name: 'Quotations', icon: FileText },
            { id: 'orders', name: 'Sales Orders', icon: ShoppingCart },
            { id: 'proforma', name: 'Proforma Invoices', icon: Building },
            { id: 'invoices', name: 'Invoices', icon: DollarSign },
            { id: 'payments', name: 'Payments', icon: CreditCard },
            { id: 'products', name: 'Products', icon: Package },
            { id: 'templates', name: 'Templates', icon: Settings },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'quotations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Quotations</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={handleCreateQuotation}>
                  Create Quotation
                </Button>
              </div>
              
              <div className="space-y-4">
                {quotations.map(quotation => (
                  <Card key={quotation.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{quotation.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{quotation.customer}</p>
                        <p className="text-sm text-[#b0b0d0]">{quotation.customer_email}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(quotation.status) as any} size="sm">
                          {quotation.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(quotation.total_amount, quotation.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Valid until: {quotation.valid_until.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{quotation.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Discount:</span>
                        <div className="text-white">{formatCurrency(quotation.discount_amount, quotation.currency)}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Tax:</span>
                        <div className="text-white">{formatCurrency(quotation.tax_amount, quotation.currency)}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Signature:</span>
                        <div className="text-white">{quotation.signature_required ? 'Required' : 'Not Required'}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        PDF
                      </Button>
                      {quotation.status === 'draft' && (
                        <Button variant="gradient" size="sm" icon={Send}>
                          Send
                        </Button>
                      )}
                      {quotation.status === 'accepted' && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          icon={ShoppingCart}
                          onClick={() => handleCreateSalesOrder(quotation.id)}
                        >
                          Create Order
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Sales Orders</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={() => handleCreateSalesOrder()}>
                  Create Order
                </Button>
              </div>
              
              <div className="space-y-4">
                {salesOrders.map(order => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{order.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{order.customer}</p>
                        {order.quotation_id && (
                          <p className="text-xs text-[#a259ff]">From: {order.quotation_id}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(order.status) as any} size="sm">
                          {order.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(order.total_amount, order.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            {order.delivery_date ? `Delivery: ${order.delivery_date.toLocaleDateString()}` : 'No delivery date'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{order.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Payment Terms:</span>
                        <div className="text-white">{order.payment_terms}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Created:</span>
                        <div className="text-white">{order.created_at.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Currency:</span>
                        <div className="text-white">{order.currency}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        PDF
                      </Button>
                      {order.status === 'confirmed' && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          icon={Building}
                          onClick={() => handleCreateProformaInvoice(order.id)}
                        >
                          Create Proforma
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'proforma' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Proforma Invoices</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={() => handleCreateProformaInvoice()}>
                  Create Proforma
                </Button>
              </div>
              
              <div className="space-y-4">
                {proformaInvoices.map(proforma => (
                  <Card key={proforma.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{proforma.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{proforma.customer}</p>
                        {proforma.sales_order_id && (
                          <p className="text-xs text-[#a259ff]">From: {proforma.sales_order_id}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(proforma.status) as any} size="sm">
                          {proforma.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(proforma.total_amount, proforma.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Due: {proforma.due_date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{proforma.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Payment Terms:</span>
                        <div className="text-white">{proforma.payment_terms}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Created:</span>
                        <div className="text-white">{proforma.created_at.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Currency:</span>
                        <div className="text-white">{proforma.currency}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        PDF
                      </Button>
                      {proforma.status === 'sent' && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          icon={DollarSign}
                          onClick={() => handleCreateInvoice(proforma.id)}
                        >
                          Create Invoice
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Invoices</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={() => handleCreateInvoice()}>
                  Create Invoice
                </Button>
              </div>
              
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{invoice.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{invoice.customer}</p>
                        {invoice.proforma_invoice_id && (
                          <p className="text-xs text-[#a259ff]">From: {invoice.proforma_invoice_id}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(invoice.status) as any} size="sm">
                          {invoice.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(invoice.total_amount, invoice.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Due: {invoice.due_date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{invoice.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Payment Terms:</span>
                        <div className="text-white">{invoice.payment_terms}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Created:</span>
                        <div className="text-white">{invoice.created_at.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Currency:</span>
                        <div className="text-white">{invoice.currency}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        PDF
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="gradient" size="sm" icon={Send}>
                          Send
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button variant="success" size="sm" icon={CheckCircle}>
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Payments</h4>
              
              <div className="space-y-4">
                {payments.map(payment => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">Payment #{payment.id}</h5>
                        <p className="text-sm text-[#b0b0d0]">{payment.customer}</p>
                        <p className="text-xs text-[#a259ff]">Invoice: {payment.invoice_id}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(payment.status) as any} size="sm">
                          {payment.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0] capitalize">
                            {payment.method.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Method:</span>
                        <div className="text-white capitalize">{payment.method.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Transaction ID:</span>
                        <div className="text-white">{payment.transaction_id || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Created:</span>
                        <div className="text-white">{payment.created_at.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Completed:</span>
                        <div className="text-white">{payment.completed_at?.toLocaleDateString() || 'Pending'}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Details
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        Receipt
                      </Button>
                      {payment.status === 'completed' && (
                        <Button variant="danger" size="sm" icon={RotateCcw}>
                          Refund
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Products</h4>
                <Button variant="gradient" size="sm" icon={Plus}>
                  Add Product
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white">{product.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">SKU: {product.sku}</p>
                        <p className="text-xs text-[#b0b0d0] capitalize">{product.category}</p>
                      </div>
                      <Badge variant={product.is_active ? 'success' : 'secondary'} size="sm">
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Price:</span>
                        <span className="text-white">{formatCurrency(product.unit_price, product.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Stock:</span>
                        <span className="text-white">{product.stock_quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Variants:</span>
                        <span className="text-white">{product.variants.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Variants
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Professional Quotation', type: 'quotation', color: '#a259ff' },
                  { name: 'Standard Invoice', type: 'invoice', color: '#377dff' },
                  { name: 'Service Agreement', type: 'contract', color: '#43e7ad' }
                ].map(template => (
                  <Card key={template.name} className="p-4">
                    <div className="space-y-3">
                      <div 
                        className="w-full h-32 rounded-lg border-2 border-dashed"
                        style={{ borderColor: template.color }}
                      />
                      <div>
                        <h6 className="font-medium text-white">{template.name}</h6>
                        <p className="text-sm text-[#b0b0d0] capitalize">{template.type}</p>
                      </div>
                      <Button variant="secondary" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Analytics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Total Revenue</p>
                      <p className="text-xl font-semibold text-white">{formatCurrency(150000)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#377dff]/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#377dff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Active Quotations</p>
                      <p className="text-xl font-semibold text-white">{quotations.filter(q => q.status === 'sent').length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#43e7ad]/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-[#43e7ad]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Confirmed Orders</p>
                      <p className="text-xl font-semibold text-white">{salesOrders.filter(o => o.status === 'confirmed').length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#ff6b6b]/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#ff6b6b]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Overdue Invoices</p>
                      <p className="text-xl font-semibold text-white">{invoices.filter(i => i.status === 'overdue').length}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UnifiedAccountingSystem; 