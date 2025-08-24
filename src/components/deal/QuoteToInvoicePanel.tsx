import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Quote,
  ShoppingCart,
  Receipt,
  Plus,
  Eye,
  Send,
  Download,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { BrandCard, BrandButton, BrandBadge } from '../../contexts/BrandDesignContext';
import { useDealFinance } from '../../hooks/useDealFinance';

interface QuoteToInvoicePanelProps {
  dealId: string;
  className?: string;
}

const QuoteToInvoicePanel: React.FC<QuoteToInvoicePanelProps> = ({
  dealId,
  className = '',
}) => {
  const {
    quotes,
    orders,
    invoices,
    isLoading,
    createQuote,
    convertQuoteToOrder,
    convertOrderToInvoice,
    sendQuote,
    updateQuoteStatus,
    totalQuoteValue,
    totalOrderValue,
    totalInvoiceValue,
    hasActiveQuotes,
    hasPendingOrders,
    hasUnpaidInvoices,
  } = useDealFinance(dealId);

  const [activeTab, setActiveTab] = useState<'quotes' | 'orders' | 'invoices'>('quotes');
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'blue';
      case 'accepted': case 'confirmed': case 'paid': return 'green';
      case 'rejected': case 'cancelled': return 'red';
      case 'expired': case 'overdue': return 'orange';
      case 'pending': case 'in_progress': return 'yellow';
      default: return 'secondary';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const ProcessFlow = () => (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-between py-4 mb-6"
    >
      <div className="flex items-center space-x-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          quotes.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
        }`}>
          <Quote className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">Quotes</p>
          <p className="text-white/70 text-xs">{quotes.length} created</p>
        </div>
      </div>
      
      <ArrowRight className={`w-5 h-5 ${orders.length > 0 ? 'text-green-400' : 'text-white/30'}`} />
      
      <div className="flex items-center space-x-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          orders.length > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/50'
        }`}>
          <ShoppingCart className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">Orders</p>
          <p className="text-white/70 text-xs">{orders.length} created</p>
        </div>
      </div>
      
      <ArrowRight className={`w-5 h-5 ${invoices.length > 0 ? 'text-green-400' : 'text-white/30'}`} />
      
      <div className="flex items-center space-x-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          invoices.length > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/50'
        }`}>
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">Invoices</p>
          <p className="text-white/70 text-xs">{invoices.length} created</p>
        </div>
      </div>
    </motion.div>
  );

  const StatsCards = () => (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-3 gap-4 mb-6"
    >
      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Quote className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Quotes</span>
        </div>
        <div className="text-white font-bold">{formatCurrency(totalQuoteValue)}</div>
        <div className="text-white/70 text-xs">{quotes.length} total</div>
      </div>
      
      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <ShoppingCart className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 text-sm font-medium">Orders</span>
        </div>
        <div className="text-white font-bold">{formatCurrency(totalOrderValue)}</div>
        <div className="text-white/70 text-xs">{orders.length} total</div>
      </div>
      
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Receipt className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-medium">Invoices</span>
        </div>
        <div className="text-white font-bold">{formatCurrency(totalInvoiceValue)}</div>
        <div className="text-white/70 text-xs">{invoices.length} total</div>
      </div>
    </motion.div>
  );

  const QuotesList = () => (
    <div className="space-y-3">
      {quotes.length > 0 ? (
        quotes.map((quote) => (
          <motion.div
            key={quote.id}
            variants={itemVariants}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-green-500/20">
                  <Quote className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{quote.title}</h4>
                  <div className="flex items-center space-x-2 text-xs text-white/70">
                    <span>{quote.quote_number}</span>
                    <span>•</span>
                    <span>{formatCurrency(quote.total_amount)}</span>
                    <span>•</span>
                    <span>Valid until {new Date(quote.valid_until).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <BrandBadge variant={getStatusColor(quote.status)}>
                  {quote.status}
                </BrandBadge>
                
                <BrandButton size="sm" variant="secondary">
                  <Eye className="w-3 h-3" />
                </BrandButton>
                
                {quote.status === 'draft' && (
                  <BrandButton 
                    size="sm" 
                    variant="blue"
                    onClick={() => sendQuote(quote.id, { to: ['customer@example.com'] })}
                    disabled={isLoading}
                  >
                    <Send className="w-3 h-3" />
                  </BrandButton>
                )}
                
                {quote.status === 'sent' && (
                  <BrandButton 
                    size="sm" 
                    variant="green"
                    onClick={() => convertQuoteToOrder(quote.id, {
                      quote_id: quote.id,
                      customer_po_number: '',
                      delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    })}
                    disabled={isLoading}
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </BrandButton>
                )}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          variants={itemVariants}
          className="text-center py-8"
        >
          <Quote className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">No Quotes Yet</h4>
          <p className="text-white/70 mb-6">Create a quote to start the sales process for this deal.</p>
          <BrandButton 
            variant="green"
            onClick={() => setShowCreateQuote(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Quote
          </BrandButton>
        </motion.div>
      )}
    </div>
  );

  const OrdersList = () => (
    <div className="space-y-3">
      {orders.length > 0 ? (
        orders.map((order) => (
          <motion.div
            key={order.id}
            variants={itemVariants}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-orange-500/20">
                  <ShoppingCart className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{order.order_number}</h4>
                  <div className="flex items-center space-x-2 text-xs text-white/70">
                    <span>{formatCurrency(order.total_amount)}</span>
                    {order.delivery_date && (
                      <>
                        <span>•</span>
                        <span>Delivery: {new Date(order.delivery_date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <BrandBadge variant={getStatusColor(order.status)}>
                  {order.status}
                </BrandBadge>
                
                <BrandButton size="sm" variant="secondary">
                  <Eye className="w-3 h-3" />
                </BrandButton>
                
                {order.status === 'confirmed' && (
                  <BrandButton 
                    size="sm" 
                    variant="purple"
                    onClick={() => convertOrderToInvoice(order.id, {
                      order_id: order.id,
                      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      payment_terms: 'Net 30'
                    })}
                    disabled={isLoading}
                  >
                    <Receipt className="w-3 h-3" />
                  </BrandButton>
                )}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          variants={itemVariants}
          className="text-center py-6"
        >
          <ShoppingCart className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/70">No orders yet. Orders will appear when quotes are accepted.</p>
        </motion.div>
      )}
    </div>
  );

  const InvoicesList = () => (
    <div className="space-y-3">
      {invoices.length > 0 ? (
        invoices.map((invoice) => (
          <motion.div
            key={invoice.id}
            variants={itemVariants}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-purple-500/20">
                  <Receipt className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{invoice.invoice_number}</h4>
                  <div className="flex items-center space-x-2 text-xs text-white/70">
                    <span>{formatCurrency(invoice.total_amount)}</span>
                    <span>•</span>
                    <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <BrandBadge variant={getStatusColor(invoice.status)}>
                  {invoice.status}
                </BrandBadge>
                
                <BrandButton size="sm" variant="secondary">
                  <Download className="w-3 h-3" />
                </BrandButton>
                
                {invoice.status === 'draft' && (
                  <BrandButton size="sm" variant="purple">
                    <Send className="w-3 h-3" />
                  </BrandButton>
                )}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          variants={itemVariants}
          className="text-center py-6"
        >
          <Receipt className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/70">No invoices yet. Invoices will be generated from completed orders.</p>
        </motion.div>
      )}
    </div>
  );

  const tabs = [
    { key: 'quotes', label: 'Quotes', icon: Quote, count: quotes.length },
    { key: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length },
    { key: 'invoices', label: 'Invoices', icon: Receipt, count: invoices.length },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-4 ${className}`}
    >
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Quote → Order → Invoice</h3>
            <div className="flex items-center space-x-2">
              {hasActiveQuotes && (
                <BrandBadge variant="blue">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active Quotes
                </BrandBadge>
              )}
              {hasPendingOrders && (
                <BrandBadge variant="orange">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending Orders
                </BrandBadge>
              )}
              {hasUnpaidInvoices && (
                <BrandBadge variant="red">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unpaid Invoices
                </BrandBadge>
              )}
            </div>
          </div>

          <ProcessFlow />
          <StatsCards />

          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 rounded-xl p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all flex-1 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'quotes' && <QuotesList />}
              {activeTab === 'orders' && <OrdersList />}
              {activeTab === 'invoices' && <InvoicesList />}
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <BrandButton 
              variant="green"
              onClick={() => setShowCreateQuote(true)}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quote
            </BrandButton>
            
            <div className="flex space-x-2">
              <BrandButton size="sm" variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </BrandButton>
              <BrandButton size="sm" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </BrandButton>
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="flex items-center space-x-3 text-white">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuoteToInvoicePanel;

