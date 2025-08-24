import React, { useState, useEffect } from 'react';
import { BrandCard, BrandButton, BrandInput, BrandDropdown, BrandBadge, BrandTextarea } from '../../contexts/BrandDesignContext';
import { 
  Shield, 
  Plus, 
  Search,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Camera,
  Send,
  Eye,
  Download,
  Settings,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WarrantyClaim {
  id: string;
  claim_number: string;
  warranty_type: 'product' | 'service' | 'extended' | 'manufacturer';
  product_name: string;
  product_serial?: string;
  product_model?: string;
  purchase_date?: string;
  warranty_start_date?: string;
  warranty_end_date?: string;
  issue_description: string;
  issue_type?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'parts_ordered' | 'resolved' | 'closed';
  resolution_description?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  attachments: any[];
}

interface WarrantyProduct {
  id: string;
  name: string;
  model: string;
  serial: string;
  purchase_date: string;
  warranty_start: string;
  warranty_end: string;
  warranty_type: string;
  status: 'active' | 'expired' | 'expiring_soon';
}

const PortalWarranty: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'claims' | 'products' | 'new-claim'>('claims');
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [products, setProducts] = useState<WarrantyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);

  // New claim form state
  const [newClaim, setNewClaim] = useState({
    product_name: '',
    product_serial: '',
    product_model: '',
    issue_description: '',
    issue_type: '',
    severity: 'medium' as const,
    warranty_type: 'product' as const,
    attachments: [] as File[]
  });

  useEffect(() => {
    loadWarrantyData();
  }, []);

  const loadWarrantyData = async () => {
    try {
      setLoading(true);
      
      // Mock warranty claims data
      const mockClaims: WarrantyClaim[] = [
        {
          id: '1',
          claim_number: 'WAR-000001',
          warranty_type: 'product',
          product_name: 'Industrial Printer X200',
          product_serial: 'IP200-2024-001',
          product_model: 'X200-Pro',
          purchase_date: '2024-01-15',
          warranty_start_date: '2024-01-15',
          warranty_end_date: '2026-01-15',
          issue_description: 'Printer stops working after 500 pages, showing error code E-42',
          issue_type: 'hardware_failure',
          severity: 'high',
          status: 'in_progress',
          resolution_description: 'Technician dispatched. Replacement parts ordered.',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-22T14:30:00Z',
          attachments: [
            { name: 'error-screenshot.jpg', url: '/files/error-screenshot.jpg' },
            { name: 'purchase-receipt.pdf', url: '/files/purchase-receipt.pdf' }
          ]
        },
        {
          id: '2',
          claim_number: 'WAR-000002',
          warranty_type: 'service',
          product_name: 'Annual Maintenance Package',
          issue_description: 'Scheduled maintenance not performed within agreed timeframe',
          issue_type: 'service_delay',
          severity: 'medium',
          status: 'resolved',
          resolution_description: 'Maintenance completed with service credit applied.',
          created_at: '2024-01-10T09:00:00Z',
          updated_at: '2024-01-18T16:00:00Z',
          resolved_at: '2024-01-18T16:00:00Z',
          attachments: []
        }
      ];

      // Mock warranty products data
      const mockProducts: WarrantyProduct[] = [
        {
          id: '1',
          name: 'Industrial Printer X200',
          model: 'X200-Pro',
          serial: 'IP200-2024-001',
          purchase_date: '2024-01-15',
          warranty_start: '2024-01-15',
          warranty_end: '2026-01-15',
          warranty_type: 'Comprehensive Coverage',
          status: 'active'
        },
        {
          id: '2',
          name: 'Server Hardware Suite',
          model: 'SVR-ENT-2024',
          serial: 'SVR-ENT-2024-012',
          purchase_date: '2023-12-01',
          warranty_start: '2024-01-01',
          warranty_end: '2026-12-31',
          warranty_type: 'Extended Warranty',
          status: 'active'
        },
        {
          id: '3',
          name: 'Office Scanner Pro',
          model: 'OSP-500',
          serial: 'OSP-500-2023-045',
          purchase_date: '2023-06-01',
          warranty_start: '2023-06-01',
          warranty_end: '2024-06-01',
          warranty_type: 'Standard Warranty',
          status: 'expired'
        }
      ];

      setClaims(mockClaims);
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading warranty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Settings className="w-4 h-4" />;
      case 'parts_ordered': return <Package className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'submitted': return 'info';
      case 'under_review': return 'warning';
      case 'approved': return 'success';
      case 'in_progress': return 'primary';
      case 'parts_ordered': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  const getWarrantyStatus = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'danger' as const };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring_soon', label: 'Expiring Soon', color: 'warning' as const };
    } else {
      return { status: 'active', label: 'Active', color: 'success' as const };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmitClaim = async () => {
    try {
      // In a real implementation, this would submit to the API
      console.log('Submitting claim:', newClaim);
      
      // Reset form
      setNewClaim({
        product_name: '',
        product_serial: '',
        product_model: '',
        issue_description: '',
        issue_type: '',
        severity: 'medium',
        warranty_type: 'product',
        attachments: []
      });
      
      setShowNewClaimModal(false);
      setActiveTab('claims');
      
      // Reload data
      await loadWarrantyData();
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    return {
      totalClaims: claims.length,
      activeClaims: claims.filter(c => !['resolved', 'closed', 'rejected'].includes(c.status)).length,
      resolvedClaims: claims.filter(c => ['resolved', 'closed'].includes(c.status)).length,
      activeProducts: products.filter(p => p.status === 'active').length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
          Warranty & Support
        </h1>
        <p className="text-white/60 mt-1">
          Manage your warranty claims and product coverage
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BrandCard className="p-4" borderGradient="primary">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalClaims}</div>
              <div className="text-sm text-white/60">Total Claims</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="warning">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeClaims}</div>
              <div className="text-sm text-white/60">Active Claims</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="success">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.resolvedClaims}</div>
              <div className="text-sm text-white/60">Resolved</div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="p-4" borderGradient="secondary">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeProducts}</div>
              <div className="text-sm text-white/60">Active Products</div>
            </div>
          </div>
        </BrandCard>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'claims', label: 'Claims', icon: Shield },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'new-claim', label: 'New Claim', icon: Plus }
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

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          {/* Filters */}
          <BrandCard className="p-4" borderGradient="secondary">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <BrandInput
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <BrandDropdown
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' }
                ]}
              />
            </div>
          </BrandCard>

          {/* Claims List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredClaims.length === 0 ? (
            <BrandCard className="p-12 text-center" borderGradient="secondary">
              <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No claims found</h3>
              <p className="text-white/60 mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'No warranty claims submitted yet'}
              </p>
              <BrandButton onClick={() => setActiveTab('new-claim')}>
                <Plus className="w-4 h-4 mr-2" />
                Submit New Claim
              </BrandButton>
            </BrandCard>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredClaims.map((claim) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <BrandCard className="p-6" borderGradient="primary">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-6 h-6 text-blue-400" />
                          <div>
                            <h3 className="font-semibold text-white">{claim.claim_number}</h3>
                            <p className="text-sm text-white/60">{claim.product_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <BrandBadge 
                            variant={getSeverityColor(claim.severity)}
                            className="text-xs"
                          >
                            {claim.severity.toUpperCase()}
                          </BrandBadge>
                          <BrandBadge 
                            variant={getStatusColor(claim.status)}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(claim.status)}
                            {claim.status.replace('_', ' ')}
                          </BrandBadge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-white/80">{claim.issue_description}</p>
                        
                        {claim.resolution_description && (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-200">
                              <strong>Resolution:</strong> {claim.resolution_description}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-white/50">
                          <div className="flex items-center gap-4">
                            <span>Submitted {formatDate(claim.created_at)}</span>
                            {claim.resolved_at && (
                              <span>Resolved {formatDate(claim.resolved_at)}</span>
                            )}
                          </div>
                          
                          {claim.attachments.length > 0 && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <FileText className="w-3 h-3" />
                              {claim.attachments.length} attachment{claim.attachments.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </BrandCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {products.map((product) => {
            const warrantyStatus = getWarrantyStatus(product.warranty_end);
            
            return (
              <BrandCard key={product.id} className="p-6" borderGradient="secondary">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-white/60">{product.model} - {product.serial}</p>
                    </div>
                  </div>
                  
                  <BrandBadge variant={warrantyStatus.color}>
                    {warrantyStatus.label}
                  </BrandBadge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-white/60">Purchase Date</div>
                    <div className="text-white">{formatDate(product.purchase_date)}</div>
                  </div>
                  <div>
                    <div className="text-white/60">Warranty Start</div>
                    <div className="text-white">{formatDate(product.warranty_start)}</div>
                  </div>
                  <div>
                    <div className="text-white/60">Warranty End</div>
                    <div className="text-white">{formatDate(product.warranty_end)}</div>
                  </div>
                  <div>
                    <div className="text-white/60">Coverage Type</div>
                    <div className="text-white">{product.warranty_type}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <BrandButton 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setActiveTab('new-claim')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Claim
                  </BrandButton>
                </div>
              </BrandCard>
            );
          })}
        </div>
      )}

      {/* New Claim Tab */}
      {activeTab === 'new-claim' && (
        <BrandCard className="p-6" borderGradient="primary">
          <h2 className="text-xl font-semibold text-white mb-6">Submit New Warranty Claim</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BrandInput
                label="Product Name"
                value={newClaim.product_name}
                onChange={(e) => setNewClaim(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="Enter product name"
              />
              
              <BrandInput
                label="Serial Number"
                value={newClaim.product_serial}
                onChange={(e) => setNewClaim(prev => ({ ...prev, product_serial: e.target.value }))}
                placeholder="Enter serial number"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BrandInput
                label="Model"
                value={newClaim.product_model}
                onChange={(e) => setNewClaim(prev => ({ ...prev, product_model: e.target.value }))}
                placeholder="Enter model number"
              />
              
              <BrandDropdown
                label="Severity"
                value={newClaim.severity}
                onChange={(value) => setNewClaim(prev => ({ ...prev, severity: value as any }))}
                options={[
                  { value: 'low', label: 'Low - Minor issue' },
                  { value: 'medium', label: 'Medium - Moderate impact' },
                  { value: 'high', label: 'High - Significant impact' },
                  { value: 'critical', label: 'Critical - System down' }
                ]}
              />
            </div>

            <BrandTextarea
              label="Issue Description"
              value={newClaim.issue_description}
              onChange={(e) => setNewClaim(prev => ({ ...prev, issue_description: e.target.value }))}
              placeholder="Please describe the issue in detail..."
              rows={4}
            />

            <div className="flex justify-between">
              <BrandButton 
                variant="ghost" 
                onClick={() => setActiveTab('claims')}
              >
                Cancel
              </BrandButton>
              
              <BrandButton onClick={handleSubmitClaim}>
                <Send className="w-4 h-4 mr-2" />
                Submit Claim
              </BrandButton>
            </div>
          </div>
        </BrandCard>
      )}
    </div>
  );
};

export default PortalWarranty;
