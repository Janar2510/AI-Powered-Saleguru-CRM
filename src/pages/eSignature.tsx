import React, { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Spline from '@splinetool/react-spline';
import { eSignatureService } from '../services/eSignatureService';
import { useToastContext } from '../contexts/ToastContext';
import { 
  PenTool, 
  FileText, 
  User, 
  Send, 
  CheckCircle, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Zap,
  AlertCircle,
  Target,
  Users,
  Calendar,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Shield,
  Lock,
  Settings,
  Bell,
  Edit3,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  PieChart,
  LineChart,
  BarChart,
  Bot,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Move,
  PackageCheck,
  PackageX,
  Send as SendIcon,
  Receipt,
  Calculator,
  FileText as FileTextIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Bot as BotIcon,
  Sparkles as SparklesIcon,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  Heart,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Timer
} from 'lucide-react';

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  gradient: string;
}> = ({ icon: Icon, label, onClick, gradient }) => (
  <button
    onClick={onClick}
    className={`${gradient} p-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center space-y-3 min-h-[120px]`}
  >
    <Icon className="w-8 h-8" />
    <span>{label}</span>
  </button>
);

const eSignature: React.FC = () => {
  const { showToast } = useToastContext();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'templates' | 'analytics' | 'settings'>('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await eSignatureService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      showToast({ title: 'Failed to load documents', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = async () => {
    try {
      const newDocument = await eSignatureService.createDocument({
        name: 'New Document for Signature',
        type: 'contract',
        status: 'pending'
      });
      
      showToast({ title: 'Document created for signature', type: 'success' });
      loadDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      showToast({ title: 'Failed to create document', type: 'error' });
    }
  };

  const handleSendForSignature = async () => {
    try {
      await eSignatureService.sendForSignature('sample-doc-id', 'signer@example.com');
      showToast({ title: 'Document sent for signature', type: 'success' });
    } catch (error) {
      console.error('Error sending for signature:', error);
      showToast({ title: 'Failed to send for signature', type: 'error' });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const template = await eSignatureService.createSignatureTemplate('New Signature Template', []);
      showToast({ title: 'Signature template created', type: 'success' });
    } catch (error) {
      console.error('Error creating template:', error);
      showToast({ title: 'Failed to create template', type: 'error' });
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const analytics = await eSignatureService.getSignatureAnalytics();
      showToast({ title: 'Analytics generated successfully', type: 'success' });
      setActiveTab('analytics');
    } catch (error) {
      console.error('Error generating analytics:', error);
      showToast({ title: 'Failed to generate analytics', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const quickActions = [
    { 
      icon: PenTool, 
      label: 'Sign Document', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: handleSignDocument
    },
    { 
      icon: Send, 
      label: 'Send for Signature', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: handleSendForSignature
    },
    { 
      icon: FileText, 
      label: 'Create Template', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: handleCreateTemplate
    },
    { 
      icon: Shield, 
      label: 'AI Analytics', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: handleAIAnalysis
    },
  ];

  // Quick Actions
  const handleCreateDocument = () => {
    showToast({
      title: 'Create Document',
      description: 'Opening document creation wizard...',
      type: 'info'
    });
    // In a real app, this would open a document creation modal
  };

  const handleUploadDocument = () => {
    showToast({
      title: 'Upload Document',
      description: 'Opening document upload...',
      type: 'info'
    });
    // In a real app, this would open a file upload modal
  };

  const handleSignatureWorkflow = () => {
    showToast({
      title: 'Signature Workflow',
      description: 'Configuring signature workflow...',
      type: 'info'
    });
    // In a real app, this would open a workflow configuration modal
  };

  const handleTemplateLibrary = () => {
    showToast({
      title: 'Template Library',
      description: 'Opening document templates...',
      type: 'info'
    });
    // In a real app, this would open a template library modal
  };

  const handleAuditTrail = () => {
    showToast({
      title: 'Audit Trail',
      description: 'Viewing signature audit trail...',
      type: 'info'
    });
    // In a real app, this would open an audit trail modal
  };

  const handleIntegration = () => {
    showToast({
      title: 'Integration',
      description: 'Managing eSignature integrations...',
      type: 'info'
    });
    // In a real app, this would open an integration settings modal
  };

  // Mock signature data
  const mockDocuments = [
    { id: '1', name: 'Contract A-001', status: 'signed', signer: 'John Doe', date: '2024-01-15', type: 'Contract', signers: 2, completion: 100 },
    { id: '2', name: 'Agreement B-002', status: 'pending', signer: 'Jane Smith', date: '2024-01-14', type: 'Agreement', signers: 3, completion: 67 },
    { id: '3', name: 'Proposal C-003', status: 'draft', signer: 'Bob Wilson', date: '2024-01-13', type: 'Proposal', signers: 1, completion: 0 },
    { id: '4', name: 'Invoice D-004', status: 'signed', signer: 'Alice Johnson', date: '2024-01-12', type: 'Invoice', signers: 1, completion: 100 },
    { id: '5', name: 'Terms E-005', status: 'expired', signer: 'Charlie Brown', date: '2024-01-10', type: 'Terms', signers: 2, completion: 50 },
  ];

  const filteredDocuments = mockDocuments.filter(document => {
    const matchesStatus = filterStatus === 'all' || document.status === filterStatus;
    const matchesType = filterType === 'all' || document.type === filterType;
    const matchesSearch = (document.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (document.signer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for:`, selectedDocuments);
  };

  const handleDocumentAction = (documentId: string, action: string) => {
    console.log(`${action} for document ${documentId}`);
  };

  return (
    <Container>
      <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
        {/* Spline Background */}
        <div className="fixed inset-0 z-0">
          <Spline
            scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">eSignature</h1>
                  <p className="text-[#b0b0d0] mt-1 text-sm lg:text-base">Digital signature management and verification</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="gradient" onClick={() => setActiveTab('overview')}>
                  <Activity className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <QuickActionButton
                        key={index}
                        icon={action.icon}
                        label={action.label}
                        onClick={action.action}
                        gradient={action.gradient}
                      />
                    ))}
                  </div>
                </div>

                {/* Signature Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Total Documents</p>
                          <p className="text-2xl font-bold text-white">847</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Signed Documents</p>
                          <p className="text-2xl font-bold text-white">723</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <FileCheck className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Pending Signatures</p>
                          <p className="text-2xl font-bold text-white">45</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Timer className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Active Signers</p>
                          <p className="text-2xl font-bold text-white">156</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Document List with Filters */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                      Document Management
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        <Eye className="w-4 h-4 mr-2" />
                        {viewMode === 'grid' ? 'List' : 'Grid'}
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="mb-6 p-4 bg-[#23233a]/60 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Status</label>
                          <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          >
                            <option value="all">All Status</option>
                            <option value="signed">Signed</option>
                            <option value="pending">Pending</option>
                            <option value="draft">Draft</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Document Type</label>
                          <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          >
                            <option value="all">All Types</option>
                            <option value="Contract">Contract</option>
                            <option value="Agreement">Agreement</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Invoice">Invoice</option>
                            <option value="Terms">Terms</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Search</label>
                          <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  {selectedDocuments.length > 0 && (
                    <div className="mb-4 p-3 bg-[#a259ff]/20 border border-[#a259ff]/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">
                          {selectedDocuments.length} document(s) selected
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('export')}>
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('send')}>
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('delete')}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {filteredDocuments.map(document => (
                      <div key={document.id} className="flex items-center justify-between p-4 bg-[#23233a]/60 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(document.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, document.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== document.id));
                              }
                            }}
                            className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]"
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            document.status === 'signed' ? 'bg-green-500' :
                            document.status === 'pending' ? 'bg-yellow-500' :
                            document.status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                          }`}>
                            {document.status === 'signed' ? <FileCheck className="w-5 h-5 text-white" /> :
                             document.status === 'pending' ? <Timer className="w-5 h-5 text-white" /> :
                             document.status === 'draft' ? <Edit3 className="w-5 h-5 text-white" /> :
                             <FileX className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{document.name}</p>
                            <p className="text-sm text-[#b0b0d0]">{document.signer} • {document.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-[#b0b0d0] flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {document.date}
                            </p>
                            <p className="text-sm text-[#b0b0d0]">
                              {document.signers} signers • {document.completion}% complete
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            document.status === 'signed' ? 'bg-green-500 text-black' :
                            document.status === 'pending' ? 'bg-yellow-500 text-black' :
                            document.status === 'draft' ? 'bg-gray-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {document.status}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button variant="secondary" size="sm" onClick={() => handleDocumentAction(document.id, 'view')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleDocumentAction(document.id, 'edit')}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleDocumentAction(document.id, 'send')}>
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* AI Analysis Header */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-[#a259ff]" />
                      AI-Powered eSignature Analytics
                    </h3>
                    <Button 
                      variant="gradient" 
                      onClick={handleAIAnalysis}
                      disabled={aiLoading}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {aiLoading ? 'Analyzing...' : 'Generate AI Report'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'Signature Activity', icon: BarChart, gradient: 'from-green-500 to-emerald-600' },
                      { name: 'Document Status Trends', icon: LineChart, gradient: 'from-blue-500 to-cyan-600' },
                      { name: 'Signer Analytics', icon: PieChart, gradient: 'from-purple-500 to-indigo-600' },
                      { name: 'Completion Time', icon: Timer, gradient: 'from-orange-500 to-red-600' },
                      { name: 'Security Audit', icon: Shield, gradient: 'from-red-500 to-pink-600' },
                      { name: 'Compliance Report', icon: Lock, gradient: 'from-teal-500 to-green-600' },
                    ].map((report, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50 hover:border-[#a259ff]/30 group">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`w-10 h-10 bg-gradient-to-br ${report.gradient} rounded-lg flex items-center justify-center mr-3`}>
                              <report.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{report.name}</h3>
                              <p className="text-sm text-[#b0b0d0]">AI-generated insights</p>
                            </div>
                          </div>
                          <Button 
                            variant="gradient" 
                            className="w-full group-hover:scale-105 transition-transform"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#a259ff]" />
                    eSignature Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Default Expiry (days)</label>
                          <input type="number" className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white" defaultValue="30" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Reminder Frequency (hours)</label>
                          <input type="number" className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white" defaultValue="24" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Signature Style</label>
                          <select className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white">
                            <option value="cursive">Cursive</option>
                            <option value="print">Print</option>
                            <option value="digital">Digital</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">Security & Compliance</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-[#b0b0d0]">Require 2FA for signing</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Audit Trail</p>
                            <p className="text-sm text-[#b0b0d0]">Track all signature activities</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">GDPR Compliance</p>
                            <p className="text-sm text-[#b0b0d0]">EU data protection compliance</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default eSignature; 