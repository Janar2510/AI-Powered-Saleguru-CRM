import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, ShoppingCart, Clock, Truck, CreditCard, DollarSign, AlertTriangle, CheckCircle, Plus, Eye, Edit, Download, Send, RefreshCw } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface InvoiceDraft {
  id: string;
  number: string;
  customer: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  source_type: 'sales_order' | 'subscription' | 'timesheet' | 'delivery_order';
  source_id: string;
  due_date: Date;
  created_at: Date;
  items: InvoiceItem[];
  tax_amount: number;
  total_amount: number;
  notes?: string;
  payment_terms?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
  product_id?: string;
}

interface SalesOrder {
  id: string;
  number: string;
  customer: string;
  total_amount: number;
  status: 'draft' | 'confirmed' | 'delivered' | 'invoiced';
  items: any[];
  created_at: Date;
}

interface Subscription {
  id: string;
  name: string;
  customer: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  next_billing_date: Date;
  status: 'active' | 'paused' | 'cancelled';
}

interface Timesheet {
  id: string;
  employee: string;
  customer: string;
  project: string;
  hours: number;
  rate: number;
  total_amount: number;
  date: Date;
  status: 'draft' | 'approved' | 'billed';
}

interface DeliveryOrder {
  id: string;
  number: string;
  customer: string;
  items: any[];
  delivery_date: Date;
  status: 'draft' | 'confirmed' | 'delivered';
}

const InvoiceDraftManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'drafts' | 'sources' | 'templates' | 'settings'>('drafts');
  const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[]>([
    {
      id: 'inv-001',
      number: 'INV-2024-001',
      customer: 'Tech Solutions Inc.',
      customer_email: 'billing@techsolutions.com',
      amount: 2500.00,
      currency: 'USD',
      status: 'draft',
      source_type: 'sales_order',
      source_id: 'SO-2024-001',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      items: [
        {
          id: 'item-1',
          name: 'CRM Software License',
          description: 'Annual subscription for 10 users',
          quantity: 1,
          unit_price: 2000.00,
          tax_rate: 0.10,
          subtotal: 2000.00
        },
        {
          id: 'item-2',
          name: 'Implementation Services',
          description: 'Setup and configuration',
          quantity: 10,
          unit_price: 50.00,
          tax_rate: 0.10,
          subtotal: 500.00
        }
      ],
      tax_amount: 250.00,
      total_amount: 2750.00,
      notes: 'Payment due within 30 days',
      payment_terms: 'Net 30'
    },
    {
      id: 'inv-002',
      number: 'INV-2024-002',
      customer: 'Marketing Pro LLC',
      customer_email: 'accounts@marketingpro.com',
      amount: 1200.00,
      currency: 'USD',
      status: 'sent',
      source_type: 'subscription',
      source_id: 'SUB-2024-001',
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-3',
          name: 'Marketing Automation Platform',
          description: 'Monthly subscription',
          quantity: 1,
          unit_price: 1200.00,
          tax_rate: 0.08,
          subtotal: 1200.00
        }
      ],
      tax_amount: 96.00,
      total_amount: 1296.00,
      payment_terms: 'Net 15'
    },
    {
      id: 'inv-003',
      number: 'INV-2024-003',
      customer: 'Design Studio Co.',
      customer_email: 'finance@designstudio.com',
      amount: 800.00,
      currency: 'USD',
      status: 'overdue',
      source_type: 'timesheet',
      source_id: 'TS-2024-001',
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-4',
          name: 'Consulting Services',
          description: 'UI/UX Design consultation - 16 hours',
          quantity: 16,
          unit_price: 50.00,
          tax_rate: 0.10,
          subtotal: 800.00
        }
      ],
      tax_amount: 80.00,
      total_amount: 880.00,
      payment_terms: 'Net 30'
    }
  ]);

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    {
      id: 'SO-2024-001',
      number: 'SO-2024-001',
      customer: 'Tech Solutions Inc.',
      total_amount: 2500.00,
      status: 'confirmed',
      items: [],
      created_at: new Date()
    },
    {
      id: 'SO-2024-002',
      number: 'SO-2024-002',
      customer: 'Startup XYZ',
      total_amount: 1500.00,
      status: 'draft',
      items: [],
      created_at: new Date()
    }
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'SUB-2024-001',
      name: 'Marketing Automation',
      customer: 'Marketing Pro LLC',
      amount: 1200.00,
      frequency: 'monthly',
      next_billing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'SUB-2024-002',
      name: 'CRM Enterprise',
      customer: 'Enterprise Corp',
      amount: 5000.00,
      frequency: 'quarterly',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active'
    }
  ]);

  const [timesheets, setTimesheets] = useState<Timesheet[]>([
    {
      id: 'TS-2024-001',
      employee: 'John Designer',
      customer: 'Design Studio Co.',
      project: 'Website Redesign',
      hours: 16,
      rate: 50.00,
      total_amount: 800.00,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'approved'
    },
    {
      id: 'TS-2024-002',
      employee: 'Sarah Developer',
      customer: 'Tech Startup',
      project: 'Mobile App Development',
      hours: 24,
      rate: 75.00,
      total_amount: 1800.00,
      date: new Date(),
      status: 'draft'
    }
  ]);

  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([
    {
      id: 'DO-2024-001',
      number: 'DO-2024-001',
      customer: 'Retail Store',
      items: [],
      delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'confirmed'
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleCreateInvoiceFromSource = (sourceType: string, sourceId: string) => {
    let sourceData: any = null;
    
    switch (sourceType) {
      case 'sales_order':
        sourceData = salesOrders.find(so => so.id === sourceId);
        break;
      case 'subscription':
        sourceData = subscriptions.find(sub => sub.id === sourceId);
        break;
      case 'timesheet':
        sourceData = timesheets.find(ts => ts.id === sourceId);
        break;
      case 'delivery_order':
        sourceData = deliveryOrders.find(do => do.id === sourceId);
        break;
    }

    if (sourceData) {
      const newInvoice: InvoiceDraft = {
        id: `inv-${Date.now()}`,
        number: `INV-${new Date().getFullYear()}-${String(invoiceDrafts.length + 1).padStart(3, '0')}`,
        customer: sourceData.customer,
        customer_email: `${sourceData.customer.toLowerCase().replace(/\s+/g, '')}@example.com`,
        amount: sourceData.total_amount || sourceData.amount,
        currency: 'USD',
        status: 'draft',
        source_type: sourceType as any,
        source_id: sourceId,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        items: [],
        tax_amount: 0,
        total_amount: sourceData.total_amount || sourceData.amount
      };

      setInvoiceDrafts(prev => [...prev, newInvoice]);
      
      showToast({
        title: 'Invoice Draft Created',
        description: `Invoice draft created from ${sourceType.replace('_', ' ')}`,
        type: 'success'
      });
    }
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoiceDrafts(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: 'sent' as const }
        : invoice
    ));
    
    showToast({
      title: 'Invoice Sent',
      description: 'Invoice has been sent to the customer',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'paid': return 'success';
      case 'overdue': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'sales_order': return ShoppingCart;
      case 'subscription': return CreditCard;
      case 'timesheet': return Clock;
      case 'delivery_order': return Truck;
      default: return FileText;
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
              <FileText className="w-5 h-5 text-[#a259ff]" />
              <span>Invoice Draft Manager</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Automatically create invoices from sales orders, subscriptions, timesheets, and delivery orders
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
        <div className="flex border-b border-[#23233a]/30">
          {[
            { id: 'drafts', name: 'Invoice Drafts', icon: FileText },
            { id: 'sources', name: 'Source Documents', icon: ShoppingCart },
            { id: 'templates', name: 'Templates', icon: Eye },
            { id: 'settings', name: 'Settings', icon: RefreshCw }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
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
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Invoice Drafts</h4>
                <div className="flex space-x-2">
                  <Badge variant="info" size="sm">
                    {invoiceDrafts.filter(inv => inv.status === 'draft').length} Drafts
                  </Badge>
                  <Badge variant="warning" size="sm">
                    {invoiceDrafts.filter(inv => inv.status === 'overdue').length} Overdue
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {invoiceDrafts.map(invoice => (
                  <Card key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{invoice.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{invoice.customer}</p>
                        <p className="text-sm text-[#b0b0d0]">{invoice.customer_email}</p>
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
                        <span className="text-[#b0b0d0]">Source:</span>
                        <div className="flex items-center space-x-1 mt-1">
                          {React.createElement(getSourceIcon(invoice.source_type), { className: "w-4 h-4 text-[#a259ff]" })}
                          <span className="text-white capitalize">{invoice.source_type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{invoice.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Tax:</span>
                        <div className="text-white">{formatCurrency(invoice.tax_amount, invoice.currency)}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Terms:</span>
                        <div className="text-white">{invoice.payment_terms}</div>
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
                        <Button 
                          variant="gradient" 
                          size="sm" 
                          icon={Send}
                          onClick={() => handleSendInvoice(invoice.id)}
                        >
                          Send
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Source Documents</h4>
              
              {/* Sales Orders */}
              <div className="space-y-4">
                <h5 className="font-medium text-white flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-[#a259ff]" />
                  <span>Sales Orders</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salesOrders.map(order => (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h6 className="font-medium text-white">{order.number}</h6>
                          <p className="text-sm text-[#b0b0d0]">{order.customer}</p>
                        </div>
                        <Badge variant={order.status === 'confirmed' ? 'success' : 'secondary'} size="sm">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          {formatCurrency(order.total_amount)}
                        </span>
                        {order.status === 'confirmed' && (
                          <Button 
                            variant="gradient" 
                            size="sm" 
                            icon={Plus}
                            onClick={() => handleCreateInvoiceFromSource('sales_order', order.id)}
                          >
                            Create Invoice
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Subscriptions */}
              <div className="space-y-4">
                <h5 className="font-medium text-white flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-[#a259ff]" />
                  <span>Subscriptions</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map(subscription => (
                    <Card key={subscription.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h6 className="font-medium text-white">{subscription.name}</h6>
                          <p className="text-sm text-[#b0b0d0]">{subscription.customer}</p>
                          <p className="text-xs text-[#b0b0d0] capitalize">{subscription.frequency}</p>
                        </div>
                        <Badge variant={subscription.status === 'active' ? 'success' : 'warning'} size="sm">
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          {formatCurrency(subscription.amount)}
                        </span>
                        {subscription.status === 'active' && (
                          <Button 
                            variant="gradient" 
                            size="sm" 
                            icon={Plus}
                            onClick={() => handleCreateInvoiceFromSource('subscription', subscription.id)}
                          >
                            Create Invoice
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Timesheets */}
              <div className="space-y-4">
                <h5 className="font-medium text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#a259ff]" />
                  <span>Timesheets</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timesheets.map(timesheet => (
                    <Card key={timesheet.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h6 className="font-medium text-white">{timesheet.project}</h6>
                          <p className="text-sm text-[#b0b0d0]">{timesheet.customer}</p>
                          <p className="text-xs text-[#b0b0d0]">{timesheet.employee}</p>
                        </div>
                        <Badge variant={timesheet.status === 'approved' ? 'success' : 'secondary'} size="sm">
                          {timesheet.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          {formatCurrency(timesheet.total_amount)}
                        </span>
                        {timesheet.status === 'approved' && (
                          <Button 
                            variant="gradient" 
                            size="sm" 
                            icon={Plus}
                            onClick={() => handleCreateInvoiceFromSource('timesheet', timesheet.id)}
                          >
                            Create Invoice
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Invoice Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Professional', color: '#a259ff', description: 'Clean and modern design' },
                  { name: 'Classic', color: '#377dff', description: 'Traditional business style' },
                  { name: 'Minimal', color: '#43e7ad', description: 'Simple and elegant' }
                ].map(template => (
                  <Card key={template.name} className="p-4">
                    <div className="space-y-3">
                      <div 
                        className="w-full h-32 rounded-lg border-2 border-dashed"
                        style={{ borderColor: template.color }}
                      />
                      <div>
                        <h6 className="font-medium text-white">{template.name}</h6>
                        <p className="text-sm text-[#b0b0d0]">{template.description}</p>
                      </div>
                      <Button variant="secondary" size="sm">
                        Preview
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Invoice Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h6 className="font-medium text-white mb-3">Auto-Generation Rules</h6>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Auto-create invoices from confirmed sales orders</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Auto-create invoices from active subscriptions</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" />
                      <span className="text-sm text-white">Auto-create invoices from approved timesheets</span>
                    </label>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h6 className="font-medium text-white mb-3">Default Settings</h6>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-[#b0b0d0]">Default Payment Terms</label>
                      <select className="w-full mt-1 bg-[#23233a]/50 border border-[#23233a]/60 rounded-lg px-3 py-2 text-white">
                        <option>Net 30</option>
                        <option>Net 15</option>
                        <option>Due on Receipt</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-[#b0b0d0]">Default Currency</label>
                      <select className="w-full mt-1 bg-[#23233a]/50 border border-[#23233a]/60 rounded-lg px-3 py-2 text-white">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </select>
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

export default InvoiceDraftManager; 