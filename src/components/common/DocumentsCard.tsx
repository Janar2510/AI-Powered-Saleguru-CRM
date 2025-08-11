import React, { useState, useEffect } from 'react';
import { enhancedDocumentService, Document } from '../../services/enhancedDocumentService';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  FileText, 
  Quote, 
  Receipt, 
  CreditCard, 
  Eye, 
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface DocumentsCardProps {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  title?: string;
  className?: string;
}

const DocumentsCard: React.FC<DocumentsCardProps> = ({
  contactId,
  companyId,
  dealId,
  title = 'Documents',
  className = ''
}) => {
  const { showToast } = useToastContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [contactId, companyId, dealId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      let docs: Document[] = [];

      if (contactId) {
        docs = await enhancedDocumentService.getDocumentsByContact(contactId);
      } else if (companyId) {
        docs = await enhancedDocumentService.getDocumentsByCompany(companyId);
      } else if (dealId) {
        docs = await enhancedDocumentService.getDocumentsByDeal(dealId);
      }

      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load documents',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'quote': return <Quote className="w-4 h-4 text-blue-600" />;
      case 'invoice': return <FileText className="w-4 h-4 text-green-600" />;
      case 'proforma': return <CreditCard className="w-4 h-4 text-orange-600" />;
      case 'receipt': return <Receipt className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewDocument = (documentId: string) => {
    window.open(`/document-templates?documentId=${documentId}`, '_blank');
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      // This would integrate with your document export service
      showToast({
        title: 'Info',
        description: 'Download feature coming soon',
        type: 'info'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to download document',
        type: 'error'
      });
    }
  };

  const getStats = () => {
    const stats = {
      total: documents.length,
      draft: documents.filter(d => d.status === 'draft').length,
      sent: documents.filter(d => d.status === 'sent').length,
      paid: documents.filter(d => d.status === 'paid').length,
      totalAmount: documents.reduce((sum, d) => sum + d.total, 0)
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-300">
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-white">{stats.total}</div>
              <div className="text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-400">{stats.sent}</div>
              <div className="text-gray-400">Sent</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-400">{stats.paid}</div>
              <div className="text-gray-400">Paid</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">{formatCurrency(stats.totalAmount)}</div>
              <div className="text-gray-400">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No documents found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div 
                key={document.id} 
                className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {getDocumentIcon(document.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">
                        {document.title || `${document.type.charAt(0).toUpperCase() + document.type.slice(1)}`}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>{document.document_number || 'DRAFT'}</span>
                      <span>•</span>
                      <span>{formatDate(document.created_at)}</span>
                      <span>•</span>
                      <span className="font-medium text-white">{formatCurrency(document.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDocument(document.id)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-white/10 rounded-lg transition-colors"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsCard;
