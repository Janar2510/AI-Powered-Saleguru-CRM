import React, { useState, useEffect } from 'react';
import { useDocumentsComprehensive, Document } from '../../hooks/useDocumentsComprehensive';
import { BrandCard, BrandButton, BrandBadge } from '../../contexts/BrandDesignContext';
import PDFPreview from './PDFPreview';
import { 
  FileText, 
  Plus,
  Eye, 
  Download,
  Send,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PenTool,
  ExternalLink,
  Upload,
  Package,
  DollarSign,
  Shield,
  FileX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentsCardEnhancedProps {
  contactId?: string;
  organizationId?: string;
  dealId?: string;
  title?: string;
  className?: string;
  showCreateButton?: boolean;
  maxItems?: number;
  showPreview?: boolean;
}

const DocumentsCardEnhanced: React.FC<DocumentsCardEnhancedProps> = ({
  contactId,
  organizationId,
  dealId,
  title = 'Documents',
  className = '',
  showCreateButton = true,
  maxItems = 5,
  showPreview = false
}) => {
  const {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByContact,
    getDocumentsByOrganization,
    getDocumentsByDeal,
    fetchDocuments
  } = useDocumentsComprehensive();

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get filtered documents based on relationship
  const getRelatedDocuments = () => {
    if (contactId) {
      return getDocumentsByContact(contactId);
    } else if (organizationId) {
      return getDocumentsByOrganization(organizationId);
    } else if (dealId) {
      return getDocumentsByDeal(dealId);
    }
    return documents.slice(0, maxItems);
  };

  const relatedDocuments = getRelatedDocuments();
  const displayDocuments = relatedDocuments.slice(0, maxItems);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-400" />;
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-400" />;
      case 'viewed': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'signed': return <PenTool className="w-4 h-4 text-green-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired': return <Clock className="w-4 h-4 text-red-400" />;
      case 'cancelled': return <FileX className="w-4 h-4 text-red-400" />;
      case 'archived': return <Package className="w-4 h-4 text-gray-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending_review': return 'warning';
      case 'approved': return 'success';
      case 'sent': return 'primary';
      case 'viewed': return 'info';
      case 'signed': return 'success';
      case 'completed': return 'success';
      case 'expired': return 'warning';
      case 'cancelled': return 'danger';
      case 'archived': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'sales_order': return <Package className="w-4 h-4 text-green-400" />;
      case 'invoice': return <DollarSign className="w-4 h-4 text-yellow-400" />;
      case 'proforma': return <FileText className="w-4 h-4 text-orange-400" />;
      case 'receipt': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'contract': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'nda': return <Shield className="w-4 h-4 text-red-400" />;
      case 'agreement': return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'warranty': return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'manual': return <FileText className="w-4 h-4 text-gray-400" />;
      case 'certificate': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'report': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amountCents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountCents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDownloadDocument = (document: Document) => {
    if (document.file_url) {
      const link = document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name || `${document.document_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEditDocument = (document: Document) => {
    // Navigate to edit page or open edit modal
    window.open(`/documents/${document.id}/edit`, '_blank');
  };

  const handleDeleteDocument = async (document: Document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(document.id);
    }
  };

  const getStats = () => {
    const stats = {
      total: relatedDocuments.length,
      draft: relatedDocuments.filter(d => d.status === 'draft').length,
      sent: relatedDocuments.filter(d => d.status === 'sent').length,
      signed: relatedDocuments.filter(d => d.status === 'signed').length,
      totalAmount: relatedDocuments.reduce((sum, d) => sum + d.total_amount_cents, 0)
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className={className}>
      <BrandCard borderGradient="secondary" className="overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/60">
                {relatedDocuments.length} document{relatedDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {showCreateButton && (
              <BrandButton size="sm" onClick={handleCreateDocument}>
                <Plus className="w-4 h-4 mr-2" />
                New
              </BrandButton>
            )}
          </div>

          {/* Quick Stats */}
          {relatedDocuments.length > 0 && (
            <div className="flex gap-4 mt-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-white">{stats.total}</div>
                <div className="text-white/60">Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-400">{stats.sent}</div>
                <div className="text-white/60">Sent</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-400">{stats.signed}</div>
                <div className="text-white/60">Signed</div>
              </div>
              {stats.totalAmount > 0 && (
                <div className="text-center">
                  <div className="font-semibold text-yellow-400">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                  <div className="text-white/60">Value</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : displayDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No documents found</p>
              <p className="text-sm text-white/40 mt-1">
                {contactId && 'Create documents for this contact'}
                {organizationId && 'Create documents for this organization'}
                {dealId && 'Create documents for this deal'}
                {!contactId && !organizationId && !dealId && 'Create your first document'}
              </p>
              {showCreateButton && (
                <BrandButton className="mt-4" size="sm" onClick={handleCreateDocument}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Document
                </BrandButton>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {displayDocuments.map((document) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-all border border-white/10 group-hover:border-blue-400/50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getDocumentTypeIcon(document.document_type)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white truncate">
                              {document.title}
                            </h4>
                            <BrandBadge 
                              variant={getStatusColor(document.status)}
                              className="flex items-center gap-1 text-xs"
                            >
                              {getStatusIcon(document.status)}
                              {document.status.replace('_', ' ')}
                            </BrandBadge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <span>{document.document_number}</span>
                            <span>•</span>
                            <span>{formatDate(document.created_at)}</span>
                            {document.total_amount_cents > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-yellow-400">
                                  {formatCurrency(document.total_amount_cents, document.currency)}
                                </span>
                              </>
                            )}
                          </div>
                          
                          {document.signature_required && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-purple-400">
                              <PenTool className="w-3 h-3" />
                              Signature Required
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(document)}
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </BrandButton>
                        
                        {document.file_url && (
                          <BrandButton 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownloadDocument(document)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </BrandButton>
                        )}
                        
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditDocument(document)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </BrandButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {relatedDocuments.length > maxItems && (
                <div className="pt-4 border-t border-white/10">
                  <BrandButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open('/documents', '_blank')}
                    className="w-full"
                  >
                    View all {relatedDocuments.length} documents
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </BrandButton>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PDF Preview Modal */}
        {selectedDocument && showPreview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl h-full max-h-[90vh]">
              <PDFPreview
                documentId={selectedDocument.id}
                fileUrl={selectedDocument.file_url}
                fileName={selectedDocument.file_name}
                title={selectedDocument.title}
                height="100%"
              />
              <div className="flex justify-end mt-4">
                <BrandButton 
                  variant="ghost" 
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </BrandButton>
              </div>
            </div>
          </div>
        )}
      </BrandCard>
    </div>
  );
};

export default DocumentsCardEnhanced;

