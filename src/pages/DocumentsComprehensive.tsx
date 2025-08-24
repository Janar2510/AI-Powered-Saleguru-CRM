import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentsComprehensive } from '../hooks/useDocumentsComprehensive';
import { 
  BrandCard, 
  BrandButton, 
  BrandInput, 
  BrandDropdown, 
  BrandBadge,
  BrandStatsGrid,
  BrandStatCard
} from '../contexts/BrandDesignContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Send,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileX,
  Archive,
  Users,
  Calendar,
  DollarSign,
  Building,
  User,
  Package,
  Shield,
  Settings,
  Upload,
  Copy,
  ExternalLink,
  PenTool,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Share,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentsComprehensive: React.FC = () => {
  const navigate = useNavigate();
  const {
    documents,
    signatures,
    warrantyClaims,
    loading,
    saving,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    sendForSignature,
    getDocumentStats,
    getWarrantyStats
  } = useDocumentsComprehensive();

  // State management
  const [activeTab, setActiveTab] = useState<'documents' | 'signatures' | 'templates' | 'warranty' | 'analytics'>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    document_type: 'contract' as const,
    description: '',
    total_amount_cents: 0,
    currency: 'EUR',
    signature_required: false,
    tags: [],
    metadata: {}
  });

  // Get statistics
  const documentStats = getDocumentStats() || {};
  const warrantyStats = getWarrantyStats() || {};
  
  // Ensure documents array exists
  const safeDocuments = documents || [];

  // Filter documents
  const filteredDocuments = safeDocuments.filter(doc => {
    if (!doc || !doc.title || !doc.document_number) return false;
    
    const matchesSearch = (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.document_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'pending_review': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'signed': return <PenTool className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <FileX className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending_review': return 'warning';
      case 'approved': return 'success';
      case 'sent': return 'blue';
      case 'viewed': return 'info';
      case 'signed': return 'success';
      case 'completed': return 'success';
      case 'expired': return 'warning';
      case 'cancelled': return 'error';
      case 'archived': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'sales_order': return <Package className="w-5 h-5 text-green-400" />;
      case 'invoice': return <DollarSign className="w-5 h-5 text-yellow-400" />;
      case 'contract': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'nda': return <Shield className="w-5 h-5 text-red-400" />;
      case 'warranty': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'certificate': return <CheckCircle className="w-5 h-5 text-green-400" />;
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
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleSignDocument = (document: any) => {
    setSelectedDocument(document);
    setShowSignatureModal(true);
  };

  const handleDownloadDocument = (document: any) => {
    // Implement download functionality
    console.log('Download document:', document.id);
  };

  const handleEditDocument = (document: any) => {
    navigate(`/documents/${document.id}/edit`);
  };

  const handleDeleteDocument = async (document: any) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(document.id);
    }
  };

  const handleBulkActions = (action: string) => {
    console.log('Bulk action:', action, 'on documents:', selectedDocuments);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
              Documents & E-Signatures
            </h1>
            <p className="text-white/60 mt-1">
              Manage contracts, agreements, warranties and digital signatures
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <BrandButton 
              variant="ghost" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </BrandButton>
            
            <BrandButton onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </BrandButton>
            
            <BrandButton onClick={handleCreateDocument}>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </BrandButton>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <BrandStatsGrid>
        <BrandStatCard
          title="Total Documents"
          value={documentStats.total || 0}
          icon={<FileText className="w-6 h-6 text-blue-400" />}
          trend="up"
        />
        <BrandStatCard
          title="Pending Signatures"
          value={documentStats.sent || 0}
          icon={<PenTool className="w-6 h-6 text-orange-400" />}
          trend="up"
        />
        <BrandStatCard
          title="Completed"
          value={documentStats.signed || 0}
          icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          trend="up"
        />
        <BrandStatCard
          title="Total Value"
          value={formatCurrency(documentStats.totalValue || 0)}
          icon={<DollarSign className="w-6 h-6 text-yellow-400" />}
          trend="up"
        />
      </BrandStatsGrid>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'signatures', label: 'E-Signatures', icon: PenTool },
          { id: 'templates', label: 'Templates', icon: Copy },
          { id: 'warranty', label: 'Warranties', icon: Shield },
          { id: 'analytics', label: 'Analytics', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Tab Content */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Controls */}
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
                    { value: 'sales_order', label: 'Sales Orders' },
                    { value: 'invoice', label: 'Invoices' },
                    { value: 'contract', label: 'Contracts' },
                    { value: 'nda', label: 'NDAs' },
                    { value: 'warranty', label: 'Warranties' }
                  ]}
                />
                
                <BrandDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'signed', label: 'Signed' },
                    { value: 'expired', label: 'Expired' }
                  ]}
                />
              </div>
            </div>

            {(selectedDocuments || []).length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-white/60">
                  {(selectedDocuments || []).length} selected
                </span>
                <BrandButton size="sm" variant="ghost" onClick={() => handleBulkActions('send')}>
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </BrandButton>
                <BrandButton size="sm" variant="ghost" onClick={() => handleBulkActions('archive')}>
                  <Archive className="w-4 h-4 mr-1" />
                  Archive
                </BrandButton>
                <BrandButton size="sm" variant="ghost" onClick={() => handleBulkActions('delete')}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </BrandButton>
              </div>
            )}
          </BrandCard>

          {/* Documents Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (filteredDocuments || []).length === 0 ? (
            <BrandCard className="p-12 text-center" borderGradient="secondary">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
              <p className="text-white/60 mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first document to get started'}
              </p>
              <BrandButton onClick={handleCreateDocument}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </BrandButton>
            </BrandCard>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              <AnimatePresence>
                {filteredDocuments.map((document) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group"
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleViewDocument(document)}
                    >
                      <BrandCard 
                        className="p-6 hover:scale-105 transition-all duration-200"
                        borderGradient="primary"
                      >
                      {/* Document Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getDocumentTypeIcon(document.document_type)}
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {document.title}
                            </h3>
                            <p className="text-sm text-white/60">{document.document_number}</p>
                          </div>
                        </div>
                        
                        <BrandBadge 
                          variant={getStatusColor(document.status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(document.status)}
                          {document.status.replace('_', ' ')}
                        </BrandBadge>
                      </div>

                      {/* Document Details */}
                      <div className="space-y-2 mb-4">
                        {document.description && (
                          <p className="text-sm text-white/70 line-clamp-2">
                            {document.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>Created {formatDate(document.created_at)}</span>
                          {document.total_amount_cents > 0 && (
                            <span className="font-medium text-green-400">
                              {formatCurrency(document.total_amount_cents, document.currency)}
                            </span>
                          )}
                        </div>

                        {document.signature_required && (
                          <div className="flex items-center gap-1 text-xs text-purple-400">
                            <PenTool className="w-3 h-3" />
                            Signature Required
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </BrandButton>
                        
                        {document.signature_required && document.status === 'draft' && (
                          <BrandButton 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSignDocument(document)}
                          >
                            <PenTool className="w-4 h-4" />
                          </BrandButton>
                        )}
                        
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="w-4 h-4" />
                        </BrandButton>
                        
                        {/* PDF Download Button */}
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            const pdfUrl = `/api/pdf/${document.document_type}/${document.id}`;
                            window.open(pdfUrl, '_blank');
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditDocument(document)}
                        >
                          <Edit className="w-4 h-4" />
                        </BrandButton>
                      </div>
                    </BrandCard>
                  </div>
                </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* E-Signatures Tab */}
      {activeTab === 'signatures' && (
        <div className="space-y-6">
          <BrandCard className="p-6" borderGradient="secondary">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">E-Signature Management</h3>
                <p className="text-white/60">Track and manage electronic signatures for your documents</p>
              </div>
              <BrandButton>
                <Send className="w-4 h-4 mr-2" />
                Send for Signature
              </BrandButton>
            </div>
          </BrandCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Requests */}
            <BrandCard className="p-6" borderGradient="primary">
              <h4 className="text-lg font-semibold text-white mb-4">Pending Signatures</h4>
              <div className="space-y-3">
                {filteredDocuments.filter(doc => doc.signature_required && doc.status === 'sent').map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{doc.title}</p>
                      <p className="text-white/60 text-sm">{doc.document_number}</p>
                    </div>
                    <BrandButton size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </BrandButton>
                  </div>
                ))}
                {filteredDocuments.filter(doc => doc.signature_required && doc.status === 'sent').length === 0 && (
                  <p className="text-white/40 text-center py-4">No pending signatures</p>
                )}
              </div>
            </BrandCard>

            {/* Signature History */}
            <BrandCard className="p-6" borderGradient="secondary">
              <h4 className="text-lg font-semibold text-white mb-4">Recently Signed</h4>
              <div className="space-y-3">
                {filteredDocuments.filter(doc => doc.status === 'signed').slice(0, 5).map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{doc.title}</p>
                      <p className="text-white/60 text-sm">Signed {formatDate(doc.updated_at)}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                ))}
                {filteredDocuments.filter(doc => doc.status === 'signed').length === 0 && (
                  <p className="text-white/40 text-center py-4">No signed documents</p>
                )}
              </div>
            </BrandCard>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <BrandCard className="p-6" borderGradient="secondary">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Document Templates</h3>
                <p className="text-white/60">Manage reusable document templates for quick document creation</p>
              </div>
              <BrandButton>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </BrandButton>
            </div>
          </BrandCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contract Template */}
            <BrandCard className="p-6" borderGradient="primary">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
                <BrandBadge variant="success">Active</BrandBadge>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Service Agreement</h4>
              <p className="text-white/60 text-sm mb-4">Standard service agreement template with customizable terms and conditions</p>
              <div className="flex items-center justify-between text-sm text-white/40">
                <span>Last used: 2 days ago</span>
                <span>Used 15 times</span>
              </div>
              <div className="flex gap-2 mt-4">
                <BrandButton size="sm" variant="outline">Edit</BrandButton>
                <BrandButton size="sm">Use Template</BrandButton>
              </div>
            </BrandCard>

            {/* NDA Template */}
            <BrandCard className="p-6" borderGradient="secondary">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <BrandBadge variant="success">Active</BrandBadge>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">NDA Agreement</h4>
              <p className="text-white/60 text-sm mb-4">Non-disclosure agreement template for confidential business relationships</p>
              <div className="flex items-center justify-between text-sm text-white/40">
                <span>Last used: 1 week ago</span>
                <span>Used 8 times</span>
              </div>
              <div className="flex gap-2 mt-4">
                <BrandButton size="sm" variant="outline">Edit</BrandButton>
                <BrandButton size="sm">Use Template</BrandButton>
              </div>
            </BrandCard>

            {/* Quote Template */}
            <BrandCard className="p-6" borderGradient="accent">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <BrandBadge variant="success">Active</BrandBadge>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Project Quote</h4>
              <p className="text-white/60 text-sm mb-4">Professional project quote template with pricing breakdown</p>
              <div className="flex items-center justify-between text-sm text-white/40">
                <span>Last used: 3 days ago</span>
                <span>Used 23 times</span>
              </div>
              <div className="flex gap-2 mt-4">
                <BrandButton size="sm" variant="outline">Edit</BrandButton>
                <BrandButton size="sm">Use Template</BrandButton>
              </div>
            </BrandCard>
          </div>
        </div>
      )}

      {/* Warranty Tab */}
      {activeTab === 'warranty' && (
        <BrandCard className="p-6" borderGradient="secondary">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Warranty Management</h3>
            <p className="text-white/60 mb-6">
                              {warrantyStats.total || 0} claims • {warrantyStats.inProgress || 0} in progress
            </p>
            <BrandButton>
              <Plus className="w-4 h-4 mr-2" />
              New Warranty Claim
            </BrandButton>
          </div>
        </BrandCard>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BrandCard className="p-6" borderGradient="primary">
            <h3 className="text-lg font-semibold text-white mb-4">Document Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Signature Completion Rate</span>
                <span className="text-white font-medium">
                  {Math.round((documentStats.completedSignatures / Math.max(documentStats.requiresSignature, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Average Processing Time</span>
                <span className="text-white font-medium">2.5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Document Value</span>
                <span className="text-white font-medium">
                  {formatCurrency(documentStats.totalValue)}
                </span>
              </div>
            </div>
          </BrandCard>

          <BrandCard className="p-6" borderGradient="secondary">
            <h3 className="text-lg font-semibold text-white mb-4">Warranty Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Resolution Rate</span>
                <span className="text-white font-medium">
                  {Math.round(((warrantyStats.resolved || 0) / Math.max((warrantyStats.total || 0), 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Average Resolution Time</span>
                <span className="text-white font-medium">5.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Resolution Cost</span>
                <span className="text-white font-medium">
                  {formatCurrency(warrantyStats.totalCost || 0)}
                </span>
              </div>
            </div>
          </BrandCard>
        </div>
      )}

      {/* Document Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Document</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Document Title</label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Document Type</label>
                  <select
                    value={newDocument.document_type}
                    onChange={(e) => setNewDocument({...newDocument, document_type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="contract">Contract</option>
                    <option value="quote">Quote</option>
                    <option value="invoice">Invoice</option>
                    <option value="nda">NDA</option>
                    <option value="agreement">Agreement</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Amount (EUR)</label>
                  <input
                    type="number"
                    value={newDocument.total_amount_cents / 100}
                    onChange={(e) => setNewDocument({...newDocument, total_amount_cents: Math.round(parseFloat(e.target.value) * 100)})}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newDocument.signature_required}
                    onChange={(e) => setNewDocument({...newDocument, signature_required: e.target.checked})}
                    className="rounded border-white/20 bg-black/20 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-white/80">Requires signature</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <BrandButton
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </BrandButton>
              <BrandButton
                onClick={async () => {
                  try {
                    await createDocument(newDocument);
                    setShowCreateModal(false);
                    setNewDocument({
                      title: '',
                      document_type: 'contract' as const,
                      description: '',
                      total_amount_cents: 0,
                      currency: 'EUR',
                      signature_required: false,
                      tags: [],
                      metadata: {}
                    });
                  } catch (error) {
                    console.error('Failed to create document:', error);
                  }
                }}
              >
                Create Document
              </BrandButton>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60 mb-2">Drag and drop your document here</p>
                <p className="text-sm text-white/40">or click to browse</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('File selected:', file.name);
                      // TODO: Implement file upload logic
                    }
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  Choose File
                </label>
              </div>
              
              <div className="text-sm text-white/60">
                <p>Supported formats: PDF, DOC, DOCX, TXT</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <BrandButton
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </BrandButton>
              <BrandButton>
                Upload Document
              </BrandButton>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && selectedDocument && (
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
                  {selectedDocument.status.replace('_', ' ')}
                </BrandBadge>
              </div>
              
              <div className="flex items-center gap-2">
                <BrandButton size="sm" variant="ghost">
                  <ZoomOut className="w-4 h-4" />
                </BrandButton>
                <BrandButton size="sm" variant="ghost">
                  <ZoomIn className="w-4 h-4" />
                </BrandButton>
                <BrandButton size="sm" variant="ghost">
                  <RotateCcw className="w-4 h-4" />
                </BrandButton>
                <BrandButton size="sm" variant="ghost">
                  <Maximize className="w-4 h-4" />
                </BrandButton>
                <BrandButton size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </BrandButton>
                <BrandButton size="sm" variant="ghost">
                  <Share className="w-4 h-4" />
                </BrandButton>
                <BrandButton size="sm" variant="ghost">
                  <Printer className="w-4 h-4" />
                </BrandButton>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-white/60 hover:text-white p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Document Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Document Viewer - A4 Format */}
              <div className="flex-1 p-4 bg-white/5 rounded-lg m-4">
                <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
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
                          <h3 className="text-lg font-semibold text-purple-800 mb-2">Signature Required</h3>
                          <p className="text-purple-700">
                            This document requires electronic signature for completion.
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
                    <p className="text-white font-medium capitalize">{selectedDocument.status.replace('_', ' ')}</p>
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
                      <label className="text-sm text-white/60">Signature Required</label>
                      <p className="text-orange-400 font-medium">Yes</p>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <BrandButton 
                    className="w-full" 
                    onClick={() => handleEditDocument(selectedDocument)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Document
                  </BrandButton>
                  
                  {selectedDocument.signature_required && selectedDocument.status === 'draft' && (
                    <BrandButton 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setShowPreviewModal(false);
                        handleSignDocument(selectedDocument);
                      }}
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Send for Signature
                    </BrandButton>
                  )}
                  
                  <BrandButton 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleDownloadDocument(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </BrandButton>
                  
                  {/* PDF Download Button */}
                  <BrandButton 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      const pdfUrl = `/api/pdf/${selectedDocument.document_type}/${selectedDocument.id}`;
                      window.open(pdfUrl, '_blank');
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
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

export default DocumentsComprehensive;
