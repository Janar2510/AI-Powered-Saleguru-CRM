import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Upload, 
  Edit, 
  Trash2,
  Search,
  Filter,
  User,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import Container from '../layout/Container';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import DocumentUploader from '../ui/DocumentUploader';
import PDFPreview from '../ui/PDFPreview';
import ViewChooser, { ViewMode } from '../ui/ViewChooser';
import { useToastContext } from '../../contexts/ToastContext';

interface CustomerDocument {
  id: string;
  name: string;
  type: 'invoice' | 'quote' | 'contract' | 'receipt' | 'other';
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'paid';
  file: File | string;
  uploaded_at: string;
  modified_at: string;
  size: number;
  customer_id: string;
  document_number?: string;
  amount?: number;
  due_date?: string;
}

interface CustomerOrder {
  id: string;
  number: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered';
  total_amount: number;
  order_date: string;
  delivery_date?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

const CustomerPortal: React.FC = () => {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { showToast } = useToastContext();

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = () => {
    // Simulate loading customer data
    const sampleDocuments: CustomerDocument[] = [
      {
        id: '1',
        name: 'Invoice INV-2024-001.pdf',
        type: 'invoice',
        status: 'sent',
        file: new File([''], 'Invoice INV-2024-001.pdf'),
        uploaded_at: '2024-01-15T10:30:00Z',
        modified_at: '2024-01-15T10:30:00Z',
        size: 245760,
        customer_id: 'customer-1',
        document_number: 'INV-2024-001',
        amount: 1500.00,
        due_date: '2024-02-15'
      },
      {
        id: '2',
        name: 'Quote QT-2024-002.pdf',
        type: 'quote',
        status: 'viewed',
        file: new File([''], 'Quote QT-2024-002.pdf'),
        uploaded_at: '2024-01-10T14:20:00Z',
        modified_at: '2024-01-12T09:15:00Z',
        size: 189440,
        customer_id: 'customer-1',
        document_number: 'QT-2024-002',
        amount: 2500.00
      },
      {
        id: '3',
        name: 'Contract CON-2024-003.pdf',
        type: 'contract',
        status: 'signed',
        file: new File([''], 'Contract CON-2024-003.pdf'),
        uploaded_at: '2024-01-05T16:45:00Z',
        modified_at: '2024-01-08T11:30:00Z',
        size: 512000,
        customer_id: 'customer-1',
        document_number: 'CON-2024-003',
        amount: 5000.00
      }
    ];

    const sampleOrders: CustomerOrder[] = [
      {
        id: '1',
        number: 'SO-2024-001',
        status: 'confirmed',
        total_amount: 1500.00,
        order_date: '2024-01-15',
        delivery_date: '2024-02-15',
        items: [
          { name: 'Product A', quantity: 2, unit_price: 500.00, total: 1000.00 },
          { name: 'Product B', quantity: 1, unit_price: 500.00, total: 500.00 }
        ]
      },
      {
        id: '2',
        number: 'SO-2024-002',
        status: 'in_production',
        total_amount: 2500.00,
        order_date: '2024-01-20',
        items: [
          { name: 'Product C', quantity: 1, unit_price: 2500.00, total: 2500.00 }
        ]
      }
    ];

    setDocuments(sampleDocuments);
    setOrders(sampleOrders);
  };

  const handleUploadDocuments = (files: File[]) => {
    const newDocuments: CustomerDocument[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'other',
      status: 'draft',
      file,
      uploaded_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      size: file.size,
      customer_id: 'customer-1'
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setShowUploadModal(false);
    showToast({
      title: 'Documents Uploaded',
      description: `${files.length} document(s) uploaded successfully`,
      type: 'success'
    });
  };

  const handlePreviewPDF = (file: File | string, title: string) => {
    setPreviewFile(file);
    setPreviewTitle(title);
    setShowPDFPreview(true);
  };

  const handleDownloadDocument = (customerDoc: CustomerDocument) => {
    if (typeof customerDoc.file === 'string') {
      // If it's a URL, download it
      const link = document.createElement('a');
      link.href = customerDoc.file;
      link.download = customerDoc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // If it's a File object, download it
      const url = URL.createObjectURL(customerDoc.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = customerDoc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    showToast({
      title: 'Download Started',
      description: `${customerDoc.name} download has begun`,
      type: 'success'
    });
  };

  const handleEditDocument = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    showToast({
      title: 'Document Deleted',
      description: 'Document has been removed',
      type: 'success'
    });
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.document_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = order.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'warning';
      case 'viewed': return 'info';
      case 'signed': return 'success';
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'in_production': return 'info';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return DollarSign;
      case 'quote': return FileText;
      case 'contract': return Building;
      case 'receipt': return CheckCircle;
      default: return FileText;
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Customer Portal
            </h1>
            <p className="text-[#b0b0d0]">
              View and manage your documents, orders, and communications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-[#23233a]/30 rounded-lg p-1">
          {[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'orders', label: 'Orders', icon: Building },
            { id: 'communications', label: 'Communications', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Header with Search and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b0d0]" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#23233a] border border-[#334155] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:border-[#a259ff]"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-[#23233a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#a259ff]"
                >
                  <option value="all">All Types</option>
                  <option value="invoice">Invoices</option>
                  <option value="quote">Quotes</option>
                  <option value="contract">Contracts</option>
                  <option value="receipt">Receipts</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-[#23233a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#a259ff]"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="signed">Signed</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <ViewChooser
                currentView={viewMode}
                onViewChange={setViewMode}
                availableViews={['cards', 'table', 'list', 'grid']}
              />
            </div>

            {/* Documents Display */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredDocuments().map((doc) => {
                  const Icon = getTypeIcon(doc.type);
                  return (
                    <Card key={doc.id} className="hover:bg-[#23233a]/50 transition-colors">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Icon className="w-8 h-8 text-[#a259ff]" />
                          <Badge variant={getStatusColor(doc.status) as any} size="sm">
                            {doc.status}
                          </Badge>
                        </div>
                        <h4 className="text-white font-medium mb-2">{doc.name}</h4>
                        {doc.document_number && (
                          <p className="text-[#b0b0d0] text-sm mb-1">#{doc.document_number}</p>
                        )}
                        {doc.amount && (
                          <p className="text-white font-medium mb-1">${doc.amount.toFixed(2)}</p>
                        )}
                        <p className="text-[#b0b0d0] text-sm mb-3">
                          {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.modified_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="secondary" onClick={() => handlePreviewPDF(doc.file, doc.name)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="primary" onClick={() => handleDownloadDocument(doc)}>
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleEditDocument(doc)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteDocument(doc.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-[#23233a] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1a2e]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Document</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Modified</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      {getFilteredDocuments().map((doc) => (
                        <tr key={doc.id} className="hover:bg-[#1a1a2e]/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{doc.name}</div>
                            {doc.document_number && (
                              <div className="text-sm text-[#b0b0d0]">#{doc.document_number}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#b0b0d0]">{doc.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusColor(doc.status) as any} size="sm">
                              {doc.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {doc.amount ? `$${doc.amount.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#b0b0d0]">
                            {new Date(doc.modified_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="secondary" onClick={() => handlePreviewPDF(doc.file, doc.name)}>
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="primary" onClick={() => handleDownloadDocument(doc)}>
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => handleEditDocument(doc)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b0d0]" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#23233a] border border-[#334155] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:border-[#a259ff]"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-[#23233a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#a259ff]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_production">In Production</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              
              <ViewChooser
                currentView={viewMode}
                onViewChange={setViewMode}
                availableViews={['cards', 'table', 'list']}
              />
            </div>

            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredOrders().map((order) => (
                  <Card key={order.id} className="hover:bg-[#23233a]/50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Building className="w-8 h-8 text-[#a259ff]" />
                        <Badge variant={getStatusColor(order.status) as any} size="sm">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="text-white font-medium mb-2">{order.number}</h4>
                      <p className="text-white font-medium mb-1">${order.total_amount.toFixed(2)}</p>
                      <p className="text-[#b0b0d0] text-sm mb-3">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                      <div className="space-y-2 mb-3">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-[#b0b0d0] text-sm">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-[#b0b0d0] text-sm">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="primary">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Communications Tab */}
        {activeTab === 'communications' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-white font-medium mb-4">Communications</h3>
                <p className="text-[#b0b0d0]">Communication history and messages will be displayed here.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-[#1a1a2e] rounded-lg max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Upload Documents</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-[#b0b0d0] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <DocumentUploader
                onDocumentsChange={handleUploadDocuments}
                currentFiles={[]}
                maxFiles={10}
                maxSize={20}
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.rtf']}
                title="Upload Documents"
                description="Upload documents for review and processing"
              />
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPDFPreview && previewFile && (
          <PDFPreview
            file={previewFile}
            onClose={() => setShowPDFPreview(false)}
            title={previewTitle}
            showDownload={true}
            showNavigation={true}
          />
        )}

        {/* Edit Document Modal */}
        {showEditModal && selectedDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-[#1a1a2e] rounded-lg max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Edit Document</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-[#b0b0d0] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Document Name</label>
                  <input
                    type="text"
                    defaultValue={selectedDocument.name}
                    className="w-full p-2 bg-[#23233a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#a259ff]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Document Type</label>
                  <select
                    defaultValue={selectedDocument.type}
                    className="w-full p-2 bg-[#23233a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#a259ff]"
                  >
                    <option value="invoice">Invoice</option>
                    <option value="quote">Quote</option>
                    <option value="contract">Contract</option>
                    <option value="receipt">Receipt</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => {
                    setShowEditModal(false);
                    showToast({
                      title: 'Document Updated',
                      description: 'Document has been updated successfully',
                      type: 'success'
                    });
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default CustomerPortal; 