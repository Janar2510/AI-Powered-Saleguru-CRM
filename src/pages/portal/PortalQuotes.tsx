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
  FileText, 
  Eye, 
  Download, 
  PenTool, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  Calendar,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PortalQuotes: React.FC = () => {
  const customerId = 'company-001'; // In real implementation, get from auth context
  const { documents, loading, toCustomerDocuments } = useUnifiedDocuments('quote', customerId);
  
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
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'viewed': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'error';
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

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDownloadDocument = (document: any) => {
    // Generate PDF URL and download
    const pdfUrl = `/api/pdf/quote/${document.id}`;
    window.open(pdfUrl, '_blank');
  };

  const handleAcceptQuote = async (document: any) => {
    // In real implementation, update quote status to accepted
    console.log('Accepting quote:', document.id);
    // Could trigger generation of sales order
  };

  const getStats = () => {
    return {
      total: customerDocuments.length,
      pending: customerDocuments.filter(d => d.status === 'sent').length,
      accepted: customerDocuments.filter(d => d.status === 'accepted').length,
      totalValue: customerDocuments.reduce((sum, d) => sum + d.total_cents, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
          My Quotes
        </h1>
        <p className="text-white/60 mt-1">
          View and manage your quotes and proposals
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BrandCard className="p-4" borderGradient="primary">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Quotes</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="warning">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
              <div className="text-sm text-white/60">Pending Review</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="success">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.accepted}</div>
              <div className="text-sm text-white/60">Accepted</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="secondary">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-sm text-white/60">Total Value</div>
            </div>
          </div>
        </BrandCard>
      </div>

      {/* Filters */}
      <BrandCard className="p-4" borderGradient="secondary">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <BrandInput
              placeholder="Search quotes..."
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
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'expired', label: 'Expired' }
              ]}
            />
          </div>
        </div>
      </BrandCard>

      {/* Quotes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <BrandCard className="p-12 text-center" borderGradient="secondary">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No quotes found</h3>
          <p className="text-white/60">
            {searchTerm ? 'Try adjusting your search criteria' : 'No quotes available yet'}
          </p>
        </BrandCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredDocuments.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BrandCard 
                  className="p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  borderGradient="primary"
                  onClick={() => handleViewDocument(document)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <FileText className="w-8 h-8 text-blue-400" />
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white truncate">
                            {document.title}
                          </h3>
                          <BrandBadge 
                            variant={getStatusColor(document.status)}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(document.status)}
                            {document.status}
                          </BrandBadge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                          <span className="font-mono">{document.number}</span>
                          <span>•</span>
                          <span>Created {formatDate(document.created_at)}</span>
                          <span>•</span>
                          <span className="font-medium text-green-400">
                            {formatCurrency(document.total_cents, document.currency)}
                          </span>
                          {document.valid_until && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Calendar className="w-3 h-3" />
                                Valid until {formatDate(document.valid_until)}
                              </span>
                            </>
                          )}
                        </div>

                        {document.description && (
                          <p className="text-sm text-white/70 mb-2">{document.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-white/50">
                          {document.signature_required && (
                            <div className="flex items-center gap-1 text-purple-400">
                              <PenTool className="w-3 h-3" />
                              {document.signature_completed_at ? 'Signed' : 'Signature Required'}
                            </div>
                          )}
                          
                          <div className="text-white/60">
                            {document.lines?.length || 0} items
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
                        title="View Quote"
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
                      
                      {document.status === 'sent' && (
                        <BrandButton 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptQuote(document);
                          }}
                          title="Accept Quote"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </BrandButton>
                      )}

                      {document.can_sign && (
                        <BrandButton 
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle signature process
                            handleViewDocument(document);
                          }}
                          title="Sign Quote"
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          Sign
                        </BrandButton>
                      )}
                    </div>
                  </div>
                </BrandCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Document Modal */}
      {showModal && selectedDocument && (
        <UnifiedDocumentModal
          document={selectedDocument}
          documentType="quote"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async () => {}} // Read-only for portal
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default PortalQuotes;