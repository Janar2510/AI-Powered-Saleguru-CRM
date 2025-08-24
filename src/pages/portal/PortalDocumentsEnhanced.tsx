import React, { useState, useEffect } from 'react';
import { BrandCard, BrandButton, BrandInput, BrandDropdown, BrandBadge } from '../../contexts/BrandDesignContext';
import PDFPreview from '../../components/documents/PDFPreview';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  PenTool,
  Shield,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalDocument {
  id: string;
  document_number: string;
  title: string;
  description?: string;
  document_type: string;
  status: string;
  file_url?: string;
  file_name?: string;
  total_amount_cents: number;
  currency: string;
  signature_required: boolean;
  signature_completed_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

const PortalDocumentsEnhanced: React.FC = () => {
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<PortalDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockDocuments: PortalDocument[] = [
        {
          id: '1',
          document_number: 'QUO-000001',
          title: 'Software License Quote',
          description: 'Annual software licensing proposal',
          document_type: 'quote',
          status: 'sent',
          file_url: '/documents/quo-000001.pdf',
          file_name: 'software-license-quote.pdf',
          total_amount_cents: 250000,
          currency: 'EUR',
          signature_required: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          expires_at: '2024-02-15T23:59:59Z'
        },
        {
          id: '2',
          document_number: 'INV-000123',
          title: 'Monthly Service Invoice',
          description: 'January 2024 service billing',
          document_type: 'invoice',
          status: 'sent',
          file_url: '/documents/inv-000123.pdf',
          file_name: 'january-invoice.pdf',
          total_amount_cents: 150000,
          currency: 'EUR',
          signature_required: false,
          created_at: '2024-01-01T09:00:00Z',
          updated_at: '2024-01-01T09:00:00Z'
        },
        {
          id: '3',
          document_number: 'CON-000045',
          title: 'Service Agreement 2024',
          description: 'Annual service contract agreement',
          document_type: 'contract',
          status: 'signed',
          file_url: '/documents/con-000045.pdf',
          file_name: 'service-agreement-2024.pdf',
          total_amount_cents: 500000,
          currency: 'EUR',
          signature_required: true,
          signature_completed_at: '2024-01-10T14:30:00Z',
          created_at: '2024-01-05T11:00:00Z',
          updated_at: '2024-01-10T14:30:00Z'
        },
        {
          id: '4',
          document_number: 'WAR-000012',
          title: 'Equipment Warranty Certificate',
          description: 'Warranty coverage for purchased equipment',
          document_type: 'warranty',
          status: 'completed',
          file_url: '/documents/war-000012.pdf',
          file_name: 'equipment-warranty.pdf',
          total_amount_cents: 0,
          currency: 'EUR',
          signature_required: false,
          created_at: '2023-12-01T10:00:00Z',
          updated_at: '2023-12-01T10:00:00Z',
          expires_at: '2025-12-01T23:59:59Z'
        }
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'signed': return <PenTool className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'primary';
      case 'viewed': return 'info';
      case 'signed': return 'success';
      case 'completed': return 'success';
      case 'expired': return 'warning';
      default: return 'secondary';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'sales_order': return <Package className="w-5 h-5 text-green-400" />;
      case 'invoice': return <DollarSign className="w-5 h-5 text-yellow-400" />;
      case 'contract': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'warranty': return <Shield className="w-5 h-5 text-cyan-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
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

  const handleViewDocument = (document: PortalDocument) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  const handleDownloadDocument = (document: PortalDocument) => {
    if (document.file_url) {
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name || `${document.document_number}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const getStats = () => {
    return {
      total: documents.length,
      pending: documents.filter(d => d.status === 'sent' && d.signature_required).length,
      signed: documents.filter(d => d.status === 'signed').length,
      totalValue: documents.reduce((sum, d) => sum + d.total_amount_cents, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
          My Documents
        </h1>
        <p className="text-white/60 mt-1">
          Access your quotes, invoices, contracts, and warranties
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BrandCard className="p-4" borderGradient="primary">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Documents</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="warning">
          <div className="flex items-center gap-3">
            <PenTool className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
              <div className="text-sm text-white/60">Pending Signature</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="success">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.signed}</div>
              <div className="text-sm text-white/60">Completed</div>
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
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <BrandDropdown
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'quote', label: 'Quotes' },
                { value: 'invoice', label: 'Invoices' },
                { value: 'contract', label: 'Contracts' },
                { value: 'warranty', label: 'Warranties' }
              ]}
            />
            
            <BrandDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'sent', label: 'Sent' },
                { value: 'signed', label: 'Signed' },
                { value: 'completed', label: 'Completed' }
              ]}
            />
          </div>
        </div>
      </BrandCard>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <BrandCard className="p-12 text-center" borderGradient="secondary">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
          <p className="text-white/60">
            {searchTerm ? 'Try adjusting your search criteria' : 'No documents available yet'}
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
                      {getDocumentTypeIcon(document.document_type)}
                      
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
                          <span className="font-mono">{document.document_number}</span>
                          <span>•</span>
                          <span>Created {formatDate(document.created_at)}</span>
                          {document.total_amount_cents > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-yellow-400">
                                {formatCurrency(document.total_amount_cents, document.currency)}
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
                          
                          {document.expires_at && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Calendar className="w-3 h-3" />
                              Expires {formatDate(document.expires_at)}
                            </div>
                          )}
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
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </BrandButton>
                      
                      {document.file_url && (
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(document);
                          }}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </BrandButton>
                      )}
                      
                      {document.signature_required && !document.signature_completed_at && (
                        <BrandButton 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle signature process
                            handleViewDocument(document);
                          }}
                          title="Sign Document"
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

      {/* Document Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl w-full h-full max-w-[1200px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                {getDocumentTypeIcon(selectedDocument.document_type)}
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedDocument.title}</h3>
                  <p className="text-white/60 text-sm">{selectedDocument.document_number}</p>
                </div>
                <BrandBadge variant={getStatusColor(selectedDocument.status)}>
                  {selectedDocument.status}
                </BrandBadge>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedDocument.signature_required && !selectedDocument.signature_completed_at && (
                  <BrandButton>
                    <PenTool className="w-4 h-4 mr-2" />
                    Sign Document
                  </BrandButton>
                )}
                {selectedDocument.file_url && (
                  <BrandButton 
                    variant="ghost"
                    onClick={() => handleDownloadDocument(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </BrandButton>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-white/60 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Document Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Document Viewer - A4 Format */}
              <div className="flex-1 p-4 bg-white/5 rounded-lg m-4">
                <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-auto">
                  {/* A4 Document Content */}
                  <div className="p-8 min-h-[800px]">
                    {/* Document Header */}
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedDocument.title}
                      </h1>
                      <p className="text-lg text-gray-600">
                        {selectedDocument.document_type.toUpperCase()} • {selectedDocument.document_number}
                      </p>
                      <p className="text-gray-500">
                        Created: {formatDate(selectedDocument.created_at)}
                      </p>
                    </div>
                    
                    {/* Document Content */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Document Details</h2>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedDocument.description || 'This document contains important information and terms that require careful review.'}
                        </p>
                      </div>
                      
                      {selectedDocument.total_amount_cents > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Summary</h3>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedDocument.total_amount_cents, selectedDocument.currency)}
                          </p>
                        </div>
                      )}
                      
                      {selectedDocument.signature_required && (
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                          <h3 className="text-lg font-semibold text-purple-800 mb-2">
                            {selectedDocument.signature_completed_at ? 'Document Signed' : 'Signature Required'}
                          </h3>
                          <p className="text-purple-700">
                            {selectedDocument.signature_completed_at 
                              ? `This document was signed on ${formatDate(selectedDocument.signature_completed_at)}.`
                              : 'This document requires your electronic signature for completion.'
                            }
                          </p>
                        </div>
                      )}
                      
                      {selectedDocument.expires_at && (
                        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Expiration Notice</h3>
                          <p className="text-yellow-700">
                            This document expires on {formatDate(selectedDocument.expires_at)}.
                          </p>
                        </div>
                      )}
                      
                      {/* Document Footer */}
                      <div className="mt-12 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Document Information</h4>
                            <p className="text-sm text-gray-600">Type: {selectedDocument.document_type}</p>
                            <p className="text-sm text-gray-600">Status: {selectedDocument.status}</p>
                            <p className="text-sm text-gray-600">Last Modified: {formatDate(selectedDocument.updated_at)}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Contact</h4>
                            <p className="text-sm text-gray-600">SaleGuru CRM</p>
                            <p className="text-sm text-gray-600">support@saleGuru.com</p>
                            <p className="text-sm text-gray-600">+372 1234 5678</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="w-72 p-4 border-l border-white/20 overflow-y-auto">
                <h4 className="text-lg font-semibold text-white mb-4">Document Details</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60">Type</label>
                    <p className="text-white font-medium capitalize">{selectedDocument.document_type}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Status</label>
                    <p className="text-white font-medium capitalize">{selectedDocument.status}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Created</label>
                    <p className="text-white font-medium">{formatDate(selectedDocument.created_at)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Last Modified</label>
                    <p className="text-white font-medium">{formatDate(selectedDocument.updated_at)}</p>
                  </div>
                  
                  {selectedDocument.total_amount_cents > 0 && (
                    <div>
                      <label className="text-sm text-white/60">Amount</label>
                      <p className="text-white font-medium">
                        {formatCurrency(selectedDocument.total_amount_cents, selectedDocument.currency)}
                      </p>
                    </div>
                  )}
                  
                  {selectedDocument.signature_required && (
                    <div>
                      <label className="text-sm text-white/60">Signature</label>
                      <p className={`font-medium ${selectedDocument.signature_completed_at ? 'text-green-400' : 'text-orange-400'}`}>
                        {selectedDocument.signature_completed_at ? 'Completed' : 'Required'}
                      </p>
                    </div>
                  )}

                  {selectedDocument.expires_at && (
                    <div>
                      <label className="text-sm text-white/60">Expires</label>
                      <p className="text-white font-medium">{formatDate(selectedDocument.expires_at)}</p>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-6 space-y-3">
                  {selectedDocument.signature_required && !selectedDocument.signature_completed_at && (
                    <BrandButton className="w-full">
                      <PenTool className="w-4 h-4 mr-2" />
                      Sign Document
                    </BrandButton>
                  )}
                  
                  {selectedDocument.file_url && (
                    <BrandButton 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleDownloadDocument(selectedDocument)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </BrandButton>
                  )}
                  
                  <BrandButton 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      if (selectedDocument.file_url) {
                        window.open(selectedDocument.file_url, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </BrandButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalDocumentsEnhanced;
