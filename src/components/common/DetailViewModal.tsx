import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Building, 
  DollarSign, 
  Tag, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  FileText,
  Activity,
  MessageSquare,
  Paperclip,
  Download,
  Share2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  entityType: 'contact' | 'company' | 'lead' | 'deal' | 'product' | 'invoice' | 'sales_order' | 'document';
  onEdit?: (entity: any) => void;
  onDelete?: (id: string) => void;
  onExport?: () => void;
  onShare?: () => void;
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({
  isOpen,
  onClose,
  entity,
  entityType,
  onEdit,
  onDelete,
  onExport,
  onShare
}) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes' | 'files' | 'analytics'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const getEntityIcon = () => {
    const icons = {
      contact: User,
      company: Building,
      lead: User,
      deal: DollarSign,
      product: Tag,
      invoice: FileText,
      sales_order: FileText,
      document: FileText
    };
    return icons[entityType as keyof typeof icons] || User;
  };

  const getEntityColor = () => {
    const colors = {
      contact: 'text-blue-400',
      company: 'text-green-400',
      lead: 'text-yellow-400',
      deal: 'text-purple-400',
      product: 'text-orange-400',
      invoice: 'text-red-400',
      sales_order: 'text-indigo-400',
      document: 'text-gray-400'
    };
    return colors[entityType as keyof typeof colors] || 'text-blue-400';
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-gray-500/20 text-gray-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      draft: 'bg-gray-500/20 text-gray-400',
      sent: 'bg-blue-500/20 text-blue-400',
      signed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400';
  };

  const renderOverview = () => {
    const Icon = getEntityIcon();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-[#23233a]/50 ${getEntityColor()}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {entity.name || entity.title || entity.company_name || entity.order_number || 'Untitled'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusBadge(entity.status)}>
                  {entity.status || 'Unknown'}
                </Badge>
                {entity.created_at && (
                  <span className="text-[#b0b0d0] text-sm">
                    Created {new Date(entity.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(entity)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="secondary" size="sm" onClick={() => onDelete(entity.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Basic Information</h4>
            <div className="space-y-3">
              {entity.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-[#b0b0d0]">{entity.email}</span>
                </div>
              )}
              {entity.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-[#b0b0d0]">{entity.phone}</span>
                </div>
              )}
              {entity.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-[#b0b0d0]">{entity.address}</span>
                </div>
              )}
              {entity.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-[#b0b0d0]">{entity.website}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Additional Details</h4>
            <div className="space-y-3">
              {entity.value && (
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Value</span>
                  <span className="text-white font-medium">
                    ${entity.value.toLocaleString()}
                  </span>
                </div>
              )}
              {entity.probability && (
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Probability</span>
                  <span className="text-white font-medium">{entity.probability}%</span>
                </div>
              )}
              {entity.expected_close_date && (
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Expected Close</span>
                  <span className="text-white font-medium">
                    {new Date(entity.expected_close_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {entity.total_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Total Amount</span>
                  <span className="text-white font-medium">
                    ${entity.total_amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {entity.tags && entity.tags.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {entity.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {entity.description && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">Description</h4>
            <p className="text-[#b0b0d0] leading-relaxed">{entity.description}</p>
          </div>
        )}
      </div>
    );
  };

  const renderActivity = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Recent Activity</h4>
        <Button variant="secondary" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {/* Sample activity items */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-start space-x-3 p-3 bg-[#23233a]/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-white text-sm">
                {item === 1 && 'Email sent to john@example.com'}
                {item === 2 && 'Status updated to "In Progress"'}
                {item === 3 && 'Note added by Sarah Johnson'}
              </p>
              <p className="text-[#b0b0d0] text-xs mt-1">
                {item === 1 && '2 hours ago'}
                {item === 2 && '1 day ago'}
                {item === 3 && '3 days ago'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Notes</h4>
        <Button variant="secondary" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>
      
      <div className="space-y-4">
        {/* Sample notes */}
        {[1, 2].map((item) => (
          <div key={item} className="p-4 bg-[#23233a]/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Sarah Johnson</span>
              <span className="text-[#b0b0d0] text-sm">
                {item === 1 ? '2 hours ago' : '1 day ago'}
              </span>
            </div>
            <p className="text-[#b0b0d0] text-sm">
              {item === 1 && 'Follow up call scheduled for next week. Customer showed interest in premium package.'}
              {item === 2 && 'Initial contact made. Customer requested product demo and pricing information.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Files & Documents</h4>
        <Button variant="secondary" size="sm">
          <Paperclip className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
      
      <div className="space-y-3">
        {/* Sample files */}
        {[
          { name: 'Contract_2024.pdf', size: '2.4 MB', type: 'PDF' },
          { name: 'Proposal_Draft.docx', size: '1.8 MB', type: 'DOCX' },
          { name: 'Meeting_Notes.txt', size: '12 KB', type: 'TXT' }
        ].map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-[#23233a]/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#b0b0d0]" />
              <div>
                <p className="text-white text-sm">{file.name}</p>
                <p className="text-[#b0b0d0] text-xs">{file.size} • {file.type}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h4 className="text-white font-medium">Analytics & Insights</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#23233a]/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">Engagement</span>
          </div>
          <p className="text-2xl font-bold text-white">87%</p>
          <p className="text-[#b0b0d0] text-sm">+12% from last month</p>
        </div>
        
        <div className="p-4 bg-[#23233a]/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">Response Time</span>
          </div>
          <p className="text-2xl font-bold text-white">2.4h</p>
          <p className="text-[#b0b0d0] text-sm">Average response</p>
        </div>
        
        <div className="p-4 bg-[#23233a]/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium">Conversion</span>
          </div>
          <p className="text-2xl font-bold text-white">23%</p>
          <p className="text-[#b0b0d0] text-sm">Lead to deal rate</p>
        </div>
      </div>
      
      <div className="p-4 bg-[#23233a]/30 rounded-lg">
        <h5 className="text-white font-medium mb-3">AI Insights</h5>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-[#b0b0d0] text-sm">High engagement potential based on interaction patterns</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-[#b0b0d0] text-sm">Consider follow-up within 48 hours for optimal conversion</span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl border border-[#23233a]/60 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-[#23233a]/50 ${getEntityColor()}`}>
              {React.createElement(getEntityIcon(), { className: "w-5 h-5" })}
            </div>
            <h2 className="text-xl font-semibold text-white">
              {entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Details
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {onShare && (
              <Button variant="secondary" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            {onExport && (
              <Button variant="secondary" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#23233a]/30">
          <div className="flex space-x-1 p-6 pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'activity' && renderActivity()}
          {activeTab === 'notes' && renderNotes()}
          {activeTab === 'files' && renderFiles()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DetailViewModal; 