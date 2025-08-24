import React, { useState } from 'react';
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
  Package, 
  Eye, 
  Download, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,

  MapPin,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PortalOrders: React.FC = () => {
  const customerId = 'company-001'; // In real implementation, get from auth context
  const { documents, loading, toCustomerDocuments } = useUnifiedDocuments('sales_order', customerId);
  
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
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'accepted': return 'success';
      case 'shipped': return 'blue';
      case 'delivered': return 'green';
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

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDownloadDocument = (document: any) => {
    // Generate PDF URL and download
    const pdfUrl = `/api/pdf/sales_order/${document.id}`;
    window.open(pdfUrl, '_blank');
  };

  const handleTrackShipment = (document: any) => {
    // In real implementation, show tracking information
    console.log('Tracking shipment for order:', document.id);
  };

  const getStats = () => {
    return {
      total: customerDocuments.length,
      processing: customerDocuments.filter(d => d.status === 'accepted').length,
      shipped: customerDocuments.filter(d => d.document_type === 'sales_order' && d.status === 'shipped').length,
      totalValue: customerDocuments.reduce((sum, d) => sum + d.total_cents, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
          My Orders
        </h1>
        <p className="text-white/60 mt-1">
          Track your sales orders and shipments
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BrandCard className="p-4" borderGradient="primary">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Orders</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="warning">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.processing}</div>
              <div className="text-sm text-white/60">Processing</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="info">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.shipped}</div>
              <div className="text-sm text-white/60">Shipped</div>
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
              placeholder="Search orders..."
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
                { value: 'draft', label: 'Draft' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
        </div>
      </BrandCard>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <BrandCard className="p-12 text-center" borderGradient="secondary">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
          <p className="text-white/60">
            {searchTerm ? 'Try adjusting your search criteria' : 'No orders available yet'}
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
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Package className="w-8 h-8 text-green-400" />
                      
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
                          {document.quote_id && (
                            <BrandBadge variant="info" className="text-xs">
                              From Quote
                            </BrandBadge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                          <span className="font-mono">{document.number}</span>
                          <span>•</span>
                          <span>Created {formatDate(document.created_at)}</span>
                          <span>•</span>
                          <span className="font-medium text-green-400">
                            {formatCurrency(document.total_cents, document.currency)}
                          </span>
                        </div>

                        {document.description && (
                          <p className="text-sm text-white/70 mb-2">{document.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <div className="text-white/60">
                            {document.lines?.length || 0} items
                          </div>
                          
                          {document.shipping_address && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <MapPin className="w-3 h-3" />
                              Ship to: {document.shipping_address.split(',')[0]}
                            </div>
                          )}
                          
                          {document.customer_name && (
                            <div className="flex items-center gap-1 text-green-400">
                              <User className="w-3 h-3" />
                              {document.customer_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <BrandButton 
                        size="sm" 
                        variant="ghost"
                                                  onClick={() => handleViewDocument(document)}
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </BrandButton>
                      
                      <BrandButton 
                        size="sm" 
                        variant="ghost"
                                                  onClick={() => handleDownloadDocument(document)}
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </BrandButton>
                      
                                              {(document.document_type === 'sales_order') && (
                        <BrandButton 
                          size="sm"
                          variant="outline"
                                                      onClick={() => handleTrackShipment(document)}
                          title="Track Shipment"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Track
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
          documentType="sales_order"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async () => {}} // Read-only for portal
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default PortalOrders;