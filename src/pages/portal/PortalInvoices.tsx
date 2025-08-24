import React, { useState, useEffect } from 'react';
import { useUnifiedDocuments } from '../../hooks/useUnifiedDocuments';
import UnifiedDocumentModal from '../../components/documents/UnifiedDocumentModal';
import { 
  BrandCard, 
  BrandButton, 
  BrandInput, 
  BrandDropdown, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { 
  Receipt, 
  Eye, 
  Download, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  Calendar,
  ExternalLink,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PortalInvoices: React.FC = () => {
  const customerId = 'company-001'; // In real implementation, get from auth context
  const { documents, loading, toCustomerDocuments } = useUnifiedDocuments('invoice', customerId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  const customerDocuments = toCustomerDocuments(documents);

  // Filter documents
  const filteredDocuments = customerDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'viewed': return 'warning';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const formatCurrency = (cents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDateString: string, status: string) => {
    if (status === 'paid' || !dueDateString) return false;
    return new Date(dueDateString) < new Date();
  };

  const getDaysUntilDue = (dueDateString: string) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDownloadDocument = (document: any) => {
    // Generate PDF URL and download
    const pdfUrl = `/api/pdf/invoice/${document.id}`;
    window.open(pdfUrl, '_blank');
  };

  const handlePayInvoice = (document: any) => {
    // In real implementation, redirect to payment page
    if (document.payment_url) {
      window.open(document.payment_url, '_blank');
    } else {
      console.log('Initiating payment for invoice:', document.id);
    }
  };

  const getStats = () => {
    const now = new Date();
    return {
      total: customerDocuments.length,
      outstanding: customerDocuments.filter(d => d.status === 'sent' && d.due_date && new Date(d.due_date) >= now).length,
      overdue: customerDocuments.filter(d => d.due_date && new Date(d.due_date) < now && d.status !== 'paid').length,
      paid: customerDocuments.filter(d => d.status === 'paid').length,
      totalOutstanding: customerDocuments
        .filter(d => d.status !== 'paid')
        .reduce((sum, d) => sum + d.total_cents, 0),
      totalPaid: customerDocuments
        .filter(d => d.status === 'paid')
        .reduce((sum, d) => sum + d.total_cents, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
          My Invoices
        </h1>
        <p className="text-white/60 mt-1">
          View and pay your invoices
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BrandCard className="p-4" borderGradient="primary">
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Invoices</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="warning">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.outstanding}</div>
              <div className="text-sm text-white/60">Outstanding</div>
              <div className="text-xs text-yellow-400">
                {formatCurrency(stats.totalOutstanding)}
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="error">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.overdue}</div>
              <div className="text-sm text-white/60">Overdue</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="success">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.paid}</div>
              <div className="text-sm text-white/60">Paid</div>
              <div className="text-xs text-green-400">
                {formatCurrency(stats.totalPaid)}
              </div>
            </div>
          </div>
        </BrandCard>
      </div>

      {/* Filters */}
      <BrandCard className="p-4" borderGradient="secondary">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <BrandInput
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <BrandDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'sent', label: 'Sent' },
                { value: 'viewed', label: 'Viewed' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
        </div>
      </BrandCard>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <BrandCard className="p-12 text-center" borderGradient="secondary">
          <Receipt className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
          <p className="text-white/60">
            {searchTerm ? 'Try adjusting your search criteria' : 'No invoices available yet'}
          </p>
        </BrandCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredDocuments.map((document) => {
              const daysUntilDue = document.due_date ? getDaysUntilDue(document.due_date) : null;
              const overdue = document.due_date ? isOverdue(document.due_date, document.status) : false;
              
              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <BrandCard 
                    className={`p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer ${
                      overdue ? 'border-red-500/50 bg-red-500/5' : ''
                    }`}
                    borderGradient={overdue ? "error" : "primary"}
                    onClick={() => handleViewDocument(document)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Receipt className="w-8 h-8 text-yellow-400" />
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white truncate">
                              {document.title}
                            </h3>
                            <BrandBadge 
                              variant={overdue ? 'error' : getStatusColor(document.status)}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(overdue ? 'overdue' : document.status)}
                              {overdue ? 'Overdue' : document.status}
                            </BrandBadge>
                            {document.sales_order_id && (
                              <BrandBadge variant="info" className="text-xs">
                                From Order
                              </BrandBadge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                            <span className="font-mono">{document.number}</span>
                            <span>•</span>
                            <span>Issued {formatDate(document.issue_date || document.created_at)}</span>
                            {document.due_date && (
                              <>
                                <span>•</span>
                                <span className={`flex items-center gap-1 ${
                                  overdue ? 'text-red-400' : daysUntilDue !== null && daysUntilDue <= 7 ? 'text-yellow-400' : 'text-white/60'
                                }`}>
                                  <Calendar className="w-3 h-3" />
                                  {overdue 
                                    ? `Overdue by ${Math.abs(daysUntilDue!)} days`
                                    : daysUntilDue === 0 
                                      ? 'Due today'
                                      : daysUntilDue! > 0 
                                        ? `Due in ${daysUntilDue} days`
                                        : `Due ${formatDate(document.due_date)}`
                                  }
                                </span>
                              </>
                            )}
                          </div>

                          {document.description && (
                            <p className="text-sm text-white/70 mb-2">{document.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <div className="text-white/60">
                              {document.lines?.length || 0} items
                            </div>
                            
                            <div className="font-medium text-green-400">
                              {formatCurrency(document.total_cents, document.currency)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(document);
                          }}
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(document);
                          }}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </BrandButton>
                        
                        {document.can_pay && document.status !== 'paid' && (
                          <BrandButton 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayInvoice(document);
                            }}
                            title="Pay Invoice"
                            className={overdue ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </BrandButton>
                        )}

                        {document.status === 'paid' && (
                          <BrandBadge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Paid
                          </BrandBadge>
                        )}
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Document Modal */}
      {showModal && selectedDocument && (
        <UnifiedDocumentModal
          document={selectedDocument}
          documentType="invoice"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async () => {}} // Read-only for portal
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default PortalInvoices;