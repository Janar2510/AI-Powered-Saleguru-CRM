import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, RotateCcw, DollarSign, AlertTriangle, CheckCircle, Plus, Eye, Edit, Download, Send, RefreshCw, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CreditNote {
  id: string;
  number: string;
  customer: string;
  customer_email: string;
  original_invoice_id: string;
  original_invoice_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'applied' | 'cancelled';
  type: 'refund' | 'credit' | 'adjustment';
  reason: string;
  created_at: Date;
  applied_at?: Date;
  items: CreditNoteItem[];
  tax_amount: number;
  total_amount: number;
  notes?: string;
  refund_method?: 'bank_transfer' | 'credit_card' | 'check' | 'credit_account';
}

interface CreditNoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
  original_invoice_item_id: string;
}

interface Invoice {
  id: string;
  number: string;
  customer: string;
  total_amount: number;
  paid_amount: number;
  status: 'paid' | 'partially_paid' | 'overdue';
  due_date: Date;
  created_at: Date;
}

interface RefundRequest {
  id: string;
  customer: string;
  invoice_number: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requested_at: Date;
  processed_at?: Date;
  refund_method: 'bank_transfer' | 'credit_card' | 'check' | 'credit_account';
}

const CreditNoteManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'credit_notes' | 'refunds' | 'invoices' | 'settings'>('credit_notes');
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([
    {
      id: 'CN-001',
      number: 'CN-2024-001',
      customer: 'Tech Solutions Inc.',
      customer_email: 'billing@techsolutions.com',
      original_invoice_id: 'INV-2024-001',
      original_invoice_number: 'INV-2024-001',
      amount: 500.00,
      currency: 'USD',
      status: 'sent',
      type: 'refund',
      reason: 'Product returned - defective item',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-1',
          name: 'Hardware Component',
          description: 'Returned due to defect',
          quantity: 1,
          unit_price: 500.00,
          tax_rate: 0.10,
          subtotal: 500.00,
          original_invoice_item_id: 'inv-item-1'
        }
      ],
      tax_amount: 50.00,
      total_amount: 550.00,
      notes: 'Customer returned defective hardware component',
      refund_method: 'credit_card'
    },
    {
      id: 'CN-002',
      number: 'CN-2024-002',
      customer: 'Marketing Pro LLC',
      customer_email: 'accounts@marketingpro.com',
      original_invoice_id: 'INV-2024-002',
      original_invoice_number: 'INV-2024-002',
      amount: 200.00,
      currency: 'USD',
      status: 'applied',
      type: 'credit',
      reason: 'Service discount - loyalty program',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-2',
          name: 'Marketing Services',
          description: 'Loyalty discount applied',
          quantity: 1,
          unit_price: 200.00,
          tax_rate: 0.08,
          subtotal: 200.00,
          original_invoice_item_id: 'inv-item-2'
        }
      ],
      tax_amount: 16.00,
      total_amount: 216.00,
      notes: 'Applied to next invoice as credit',
      refund_method: 'credit_account'
    }
  ]);

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([
    {
      id: 'REF-001',
      customer: 'Design Studio Co.',
      invoice_number: 'INV-2024-003',
      amount: 300.00,
      reason: 'Service not delivered as promised',
      status: 'approved',
      requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      processed_at: new Date(),
      refund_method: 'bank_transfer'
    },
    {
      id: 'REF-002',
      customer: 'Startup XYZ',
      invoice_number: 'INV-2024-004',
      amount: 150.00,
      reason: 'Duplicate payment',
      status: 'pending',
      requested_at: new Date(),
      refund_method: 'credit_card'
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      number: 'INV-2024-001',
      customer: 'Tech Solutions Inc.',
      total_amount: 2750.00,
      paid_amount: 2200.00,
      status: 'partially_paid',
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'INV-2024-002',
      number: 'INV-2024-002',
      customer: 'Marketing Pro LLC',
      total_amount: 1296.00,
      paid_amount: 1296.00,
      status: 'paid',
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'INV-2024-003',
      number: 'INV-2024-003',
      customer: 'Design Studio Co.',
      total_amount: 880.00,
      paid_amount: 880.00,
      status: 'paid',
      due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleCreateCreditNote = (invoiceId: string, type: 'refund' | 'credit' | 'adjustment') => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const newCreditNote: CreditNote = {
      id: `CN-${Date.now()}`,
      number: `CN-${new Date().getFullYear()}-${String(creditNotes.length + 1).padStart(3, '0')}`,
      customer: invoice.customer,
      customer_email: `${invoice.customer.toLowerCase().replace(/\s+/g, '')}@example.com`,
      original_invoice_id: invoice.id,
      original_invoice_number: invoice.number,
      amount: invoice.total_amount - invoice.paid_amount,
      currency: 'USD',
      status: 'draft',
      type,
      reason: type === 'refund' ? 'Customer requested refund' : 'Credit adjustment',
      created_at: new Date(),
      items: [],
      tax_amount: 0,
      total_amount: invoice.total_amount - invoice.paid_amount
    };

    setCreditNotes(prev => [...prev, newCreditNote]);
    
    showToast({
      title: 'Credit Note Created',
      description: `${type} credit note created for ${invoice.number}`,
      type: 'success'
    });
  };

  const handleProcessRefund = (refundId: string) => {
    setRefundRequests(prev => prev.map(refund => 
      refund.id === refundId 
        ? { ...refund, status: 'processed' as const, processed_at: new Date() }
        : refund
    ));
    
    showToast({
      title: 'Refund Processed',
      description: 'Refund has been processed successfully',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'applied': return 'success';
      case 'cancelled': return 'secondary';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'processed': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'refund': return 'danger';
      case 'credit': return 'primary';
      case 'adjustment': return 'warning';
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
              <RotateCcw className="w-5 h-5 text-[#a259ff]" />
              <span>Credit Notes & Refunds</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Manage credit notes, refunds, and payment adjustments
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
            { id: 'credit_notes', name: 'Credit Notes', icon: FileText },
            { id: 'refunds', name: 'Refund Requests', icon: CreditCard },
            { id: 'invoices', name: 'Invoices', icon: DollarSign },
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
          {activeTab === 'credit_notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Credit Notes</h4>
                <div className="flex space-x-2">
                                     <Badge variant="secondary" size="sm">
                     {creditNotes.filter(cn => cn.status === 'draft').length} Drafts
                   </Badge>
                   <Badge variant="success" size="sm">
                     {creditNotes.filter(cn => cn.status === 'applied').length} Applied
                   </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {creditNotes.map(creditNote => (
                  <Card key={creditNote.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{creditNote.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{creditNote.customer}</p>
                        <p className="text-sm text-[#b0b0d0]">Original: {creditNote.original_invoice_number}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getTypeColor(creditNote.type) as any} size="sm">
                          {creditNote.type}
                        </Badge>
                        <Badge variant={getStatusColor(creditNote.status) as any} size="sm">
                          {creditNote.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(creditNote.total_amount, creditNote.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            {creditNote.created_at.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Reason:</span>
                        <div className="text-white">{creditNote.reason}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{creditNote.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Tax:</span>
                        <div className="text-white">{formatCurrency(creditNote.tax_amount, creditNote.currency)}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Method:</span>
                        <div className="text-white capitalize">{creditNote.refund_method?.replace('_', ' ')}</div>
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
                      {creditNote.status === 'draft' && (
                        <Button variant="gradient" size="sm" icon={Send}>
                          Send
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'refunds' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Refund Requests</h4>
              
              <div className="space-y-4">
                {refundRequests.map(refund => (
                  <Card key={refund.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">Refund #{refund.id}</h5>
                        <p className="text-sm text-[#b0b0d0]">{refund.customer}</p>
                        <p className="text-sm text-[#b0b0d0]">Invoice: {refund.invoice_number}</p>
                        <p className="text-sm text-[#b0b0d0]">Reason: {refund.reason}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(refund.status) as any} size="sm">
                          {refund.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(refund.amount)}
                          </div>
                          <div className="text-xs text-[#b0b0d0] capitalize">
                            {refund.refund_method.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Details
                      </Button>
                      {refund.status === 'approved' && (
                        <Button 
                          variant="gradient" 
                          size="sm" 
                          icon={CreditCard}
                          onClick={() => handleProcessRefund(refund.id)}
                        >
                          Process Refund
                        </Button>
                      )}
                      {refund.status === 'pending' && (
                        <Button variant="success" size="sm">
                          Approve
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
              <h4 className="text-lg font-semibold text-white">Invoices for Credit Notes</h4>
              
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{invoice.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{invoice.customer}</p>
                        <p className="text-sm text-[#b0b0d0]">
                          Due: {invoice.due_date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(invoice.status) as any} size="sm">
                          {invoice.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(invoice.total_amount)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Paid: {formatCurrency(invoice.paid_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="danger" 
                        size="sm" 
                        icon={RotateCcw}
                        onClick={() => handleCreateCreditNote(invoice.id, 'refund')}
                      >
                        Create Refund
                      </Button>
                                               <Button 
                           variant="primary" 
                           size="sm" 
                           icon={ArrowLeftRight}
                           onClick={() => handleCreateCreditNote(invoice.id, 'credit')}
                         >
                           Create Credit
                         </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        icon={RefreshCw}
                        onClick={() => handleCreateCreditNote(invoice.id, 'adjustment')}
                      >
                        Create Adjustment
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Credit Note Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h6 className="font-medium text-white mb-3">Refund Methods</h6>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Bank Transfer</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Credit Card Refund</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Check</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Credit Account</span>
                    </label>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h6 className="font-medium text-white mb-3">Auto-Approval Rules</h6>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-[#b0b0d0]">Max Auto-Approval Amount</label>
                      <input 
                        type="number" 
                        defaultValue={100}
                        className="w-full mt-1 bg-[#23233a]/50 border border-[#23233a]/60 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" />
                      <span className="text-sm text-white">Auto-approve refunds under threshold</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" />
                      <span className="text-sm text-white">Require manager approval for large amounts</span>
                    </label>
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

export default CreditNoteManager; 