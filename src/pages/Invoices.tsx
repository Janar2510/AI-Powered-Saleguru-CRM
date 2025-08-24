import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,

  Send,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard
} from '../contexts/BrandDesignContext';

import { useInvoices, Invoice } from '../hooks/useInvoices';
import { BrandDropdown } from '../components/ui/BrandDropdown';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, loading, error, fetchInvoices, recordPayment } = useInvoices();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  // Calculate statistics
  const stats = {
    total: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalValue: invoices.reduce((sum, inv) => sum + (inv.total_cents || 0), 0),
    paidValue: invoices.reduce((sum, inv) => sum + (inv.paid_cents || 0), 0),
    outstandingValue: invoices.reduce((sum, inv) => sum + ((inv.total_cents || 0) - (inv.paid_cents || 0)), 0)
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (invoice.invoice_number || '').toLowerCase().includes(searchLower) ||
      (invoice.contact?.name || '').toLowerCase().includes(searchLower) ||
      (invoice.organization?.name || '').toLowerCase().includes(searchLower) ||
      (invoice.customer_name || '').toLowerCase().includes(searchLower) ||
      (invoice.partner_name || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: { variant: 'default' as const, label: 'Draft', icon: Edit },
      sent: { variant: 'info' as const, label: 'Sent', icon: Send },
      paid: { variant: 'success' as const, label: 'Paid', icon: CheckCircle },
      overdue: { variant: 'error' as const, label: 'Overdue', icon: AlertTriangle },
      cancelled: { variant: 'secondary' as const, label: 'Cancelled', icon: Edit },
      partially_paid: { variant: 'warning' as const, label: 'Partial', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <BrandBadge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </BrandBadge>
    );
  };

  const formatCurrency = (cents: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const handlePayment = async () => {
    if (!showPaymentModal || !paymentAmount) return;

    const amount = parseFloat(paymentAmount) * 100;
    const success = await recordPayment(showPaymentModal, {
      amount_cents: amount,
      payment_method: paymentMethod as any,
      notes: `Payment recorded via CRM`
    });

    if (success) {
      setShowPaymentModal(null);
      setPaymentAmount('');
    }
  };

  if (error) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Invoices" subtitle="Invoice management system">
          <BrandCard borderGradient="red" className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <BrandButton variant="secondary" onClick={fetchInvoices}>
              <Receipt className="w-4 h-4 mr-2" />
              Retry
            </BrandButton>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Invoices"
        subtitle="Manage invoices, track payments, and monitor billing"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="primary" onClick={() => navigate('/invoices/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </BrandButton>
          </div>
        }
      >
        {/* Statistics Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BrandStatCard
            icon={<Receipt className="h-6 w-6 text-white" />}
            title="Total Invoices"
            value={stats.total}
            trend={`${stats.draft} draft, ${stats.sent} sent`}
            borderGradient="primary"
          />

          <BrandStatCard
            icon={<DollarSign className="h-6 w-6 text-white" />}
            title="Total Value"
            value={formatCurrency(stats.totalValue)}
            trend={`${formatCurrency(stats.paidValue)} received`}
            borderGradient="green"
          />

          <BrandStatCard
            icon={<CheckCircle className="h-6 w-6 text-white" />}
            title="Paid Invoices"
            value={stats.paid}
            trend={`${Math.round((stats.paid / (stats.total || 1)) * 100)}% completion`}
            borderGradient="blue"
          />

          <BrandStatCard
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            title="Outstanding"
            value={formatCurrency(stats.outstandingValue)}
            trend={`${stats.overdue} overdue invoices`}
            borderGradient="yellow"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <BrandCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <BrandInput
                      type="text"
                      placeholder="Search invoices by number, contact, or organization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10"
                    />
                  </div>
              </div>
              
              <div className="w-48">
                <BrandDropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'partially_paid', label: 'Partially Paid' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  placeholder="Filter by status"
                />
              </div>
            </div>
          </BrandCard>
        </motion.div>

        {/* Invoices List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BrandCard className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-white/70">Loading invoices...</span>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
                <p className="text-white/60 mb-6">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
                </p>
                <BrandButton variant="primary" onClick={() => navigate('/invoices/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </BrandButton>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Invoice</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Customer</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Date</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Due Date</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Total</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Receipt className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{invoice.invoice_number || invoice.number || 'N/A'}</p>
                              {invoice.quote_id && (
                                <p className="text-xs text-white/60">From quote</p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {invoice.contact ? (
                              <>
                                <User className="w-4 h-4 text-white/60" />
                                <div>
                                  <p className="text-white font-medium">{invoice.contact.name}</p>
                                  <p className="text-xs text-white/60">{invoice.contact.email}</p>
                                </div>
                              </>
                            ) : invoice.organization ? (
                              <>
                                <Building2 className="w-4 h-4 text-white/60" />
                                <div>
                                  <p className="text-white font-medium">{invoice.organization.name}</p>
                                  <p className="text-xs text-white/60">{invoice.organization.email}</p>
                                </div>
                              </>
                            ) : invoice.customer_name || invoice.partner_name ? (
                              <>
                                <User className="w-4 h-4 text-white/60" />
                                <div>
                                  <p className="text-white font-medium">{invoice.customer_name || invoice.partner_name}</p>
                                  <p className="text-xs text-white/60">Legacy customer</p>
                                </div>
                              </>
                            ) : (
                              <p className="text-white/60">No customer</p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-white">
                              {new Date(invoice.invoice_date || invoice.date || new Date()).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          {invoice.due_date ? (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-white/60" />
                              <span className="text-white">
                                {new Date(invoice.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/60">—</span>
                          )}
                        </td>
                        
                        <td className="py-4 px-6">
                          {getStatusBadge(invoice.status)}
                        </td>
                        
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-white">
                              {invoice.total_cents 
                                ? formatCurrency(invoice.total_cents, invoice.currency)
                                : formatCurrency((invoice.total_amount || invoice.amount || 0) * 100, invoice.currency)
                              }
                            </p>
                            {(invoice.paid_cents || 0) > 0 && (
                              <p className="text-xs text-green-400">
                                {formatCurrency(invoice.paid_cents || 0, invoice.currency)} paid
                              </p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </BrandButton>
                            
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <BrandButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPaymentModal(invoice.id)}
                                className="p-2 text-green-400 hover:text-green-300"
                              >
                                <CreditCard className="w-4 h-4" />
                              </BrandButton>
                            )}
                            
                            {invoice.status === 'draft' && (
                              <BrandButton
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                                className="p-2"
                              >
                                <Edit className="w-4 h-4" />
                              </BrandButton>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </BrandCard>
        </motion.div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <BrandCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Record Payment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      step="0.01"
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Payment Method
                    </label>
                    <BrandDropdown
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      options={[
                        { value: 'bank_transfer', label: 'Bank Transfer' },
                        { value: 'credit_card', label: 'Credit Card' },
                        { value: 'cash', label: 'Cash' },
                        { value: 'check', label: 'Check' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <BrandButton
                    variant="secondary"
                    onClick={() => {
                      setShowPaymentModal(null);
                      setPaymentAmount('');
                    }}
                  >
                    Cancel
                  </BrandButton>
                  <BrandButton
                    variant="primary"
                    onClick={handlePayment}
                    disabled={!paymentAmount}
                  >
                    Record Payment
                  </BrandButton>
                </div>
              </BrandCard>
            </motion.div>
          </div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Invoices;
