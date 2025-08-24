import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  Reply, 
  Forward, 
  Paperclip, 
  Star, 
  Archive, 
  Bot, 
  Target,
  Settings,
  RefreshCw,
  List,
  MessageSquare,
  User,
  Building,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Inbox,
  Flag
} from 'lucide-react';
import Container from '../components/layout/Container';
import EmptyState from '../components/common/EmptyState';
import OutlookEmailComposer from '../components/emails/OutlookEmailComposer';
import ExternalEmailIntegration from '../components/emails/ExternalEmailIntegration';
import { 
  BrandPageLayout, 
  BrandCard, 
  BrandButton, 
  BrandBadge, 
  BrandInput
} from '../contexts/BrandDesignContext';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  priority: 'low' | 'normal' | 'high';
  labels: string[];
  hasAttachments: boolean;
  threadId?: string;
  contactId?: string;
  dealId?: string;
  organizationId?: string;
  aiInsights?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    category: string;
    suggestedActions: string[];
  };
  relatedRecords?: {
    type: 'contact' | 'deal' | 'organization';
    id: string;
    name: string;
  }[];
}

const Emails: React.FC = () => {
  // State management
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLabel] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'conversation'>('list');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  // Load emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

    const fetchEmails = async () => {
      setIsLoading(true);
    // Simulated email data with brand-aligned structure
    const mockEmails: Email[] = [
            {
              id: '1',
        sender: 'john.smith@company.com',
        subject: 'Proposal Discussion - Q4 Partnership',
        preview: 'Hi there! I wanted to follow up on our discussion regarding the Q4 partnership proposal...',
        timestamp: '2024-01-20T10:30:00Z',
              isRead: false,
              isStarred: true,
        priority: 'high',
        labels: ['important', 'proposal'],
              hasAttachments: true,
        threadId: 'thread_1',
        contactId: 'contact_1',
        dealId: 'deal_1',
        aiInsights: {
              sentiment: 'positive',
          category: 'Sales Proposal',
          suggestedActions: ['Schedule follow-up meeting', 'Send proposal document']
        },
        relatedRecords: [
          { type: 'deal', id: 'deal_1', name: 'Q4 Partnership Deal' },
          { type: 'contact', id: 'contact_1', name: 'John Smith' }
        ]
          },
          {
            id: '2',
        sender: 'sarah.johnson@techcorp.com',
        subject: 'Meeting Confirmation - Product Demo',
        preview: 'Thanks for scheduling the product demo. I\'m excited to show you our latest features...',
        timestamp: '2024-01-19T14:15:00Z',
            isRead: true,
            isStarred: false,
        priority: 'normal',
        labels: ['meeting', 'demo'],
            hasAttachments: false,
        threadId: 'thread_2',
        contactId: 'contact_2',
        aiInsights: {
            sentiment: 'positive',
          category: 'Meeting Coordination',
          suggestedActions: ['Add to calendar', 'Prepare demo materials']
        },
        relatedRecords: [
          { type: 'contact', id: 'contact_2', name: 'Sarah Johnson' }
        ]
      }
    ];

    setTimeout(() => {
      setEmails(mockEmails);
      setFilteredEmails(mockEmails);
      setIsLoading(false);
    }, 1000);
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = emails;

    if (searchTerm) {
      filtered = filtered.filter(email => 
        email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'unread':
          filtered = filtered.filter(email => !email.isRead);
          break;
        case 'starred':
          filtered = filtered.filter(email => email.isStarred);
          break;
        case 'important':
          filtered = filtered.filter(email => email.priority === 'high');
          break;
        case 'attachments':
          filtered = filtered.filter(email => email.hasAttachments);
          break;
      }
    }

    if (selectedLabel) {
      filtered = filtered.filter(email => email.labels.includes(selectedLabel));
    }

    setFilteredEmails(filtered);
  }, [emails, searchTerm, selectedFilter, selectedLabel]);

  // Email actions
  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const toggleStar = (emailId: string) => {
      setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const archiveEmail = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
  };



  const openEmailComposer = () => {
    setIsComposerOpen(true);
  };

  // Enhanced Email List Item with brand design
  const EmailListItem = ({ email }: { email: Email }) => (
    <div 
      className="cursor-pointer transition-all duration-300 hover:scale-[1.01]"
      onClick={() => {
        setSelectedEmail(email);
        if (!email.isRead) markAsRead(email.id);
      }}
    >
      <BrandCard 
        className="p-6"
        borderGradient={!email.isRead ? 'primary' : 'secondary'}
    >
      <div className="flex items-start space-x-4">
        {/* Email Status Icons */}
        <div className="flex flex-col items-center space-y-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(email.id);
            }}
            className={`p-2 rounded-full transition-all duration-300 ${
              email.isStarred 
                ? 'text-yellow-400 hover:text-yellow-300' 
                : 'text-white/40 hover:text-yellow-400'
            }`}
          >
            <Star className={`w-4 h-4 ${email.isStarred ? 'fill-current' : ''}`} />
          </button>
          
          {email.priority === 'high' && (
            <Flag className="w-4 h-4 text-red-400" />
          )}
          
          {email.hasAttachments && (
            <Paperclip className="w-4 h-4 text-white/60" />
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {/* Sender Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                {email.sender.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex flex-col">
                <span className={`font-medium ${!email.isRead ? 'text-white' : 'text-white/80'}`}>
                  {email.sender}
                </span>
                <span className="text-sm text-white/60">
                  {new Date(email.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            {/* Email Labels */}
            <div className="flex items-center space-x-2">
              {email.labels.map((label) => (
                <BrandBadge key={label} variant="info" size="sm">
                  {label}
                </BrandBadge>
              ))}
              
              {email.aiInsights && (
                <BrandBadge variant="purple" size="sm">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </BrandBadge>
              )}
            </div>
          </div>
          
          {/* Subject */}
          <h3 className={`text-base font-semibold mb-2 ${!email.isRead ? 'text-white' : 'text-white/90'}`}>
            {email.subject}
          </h3>
          
          {/* Preview */}
          <p className="text-sm text-white/70 line-clamp-2 mb-3">
            {email.preview}
          </p>

          {/* Related Records */}
          {email.relatedRecords && email.relatedRecords.length > 0 && (
            <div className="flex items-center space-x-3 text-xs">
              {email.relatedRecords.map((record) => (
                <div key={record.id} className="flex items-center space-x-1 text-white/60">
                  {record.type === 'contact' && <User className="w-3 h-3" />}
                  {record.type === 'deal' && <Target className="w-3 h-3" />}
                  {record.type === 'organization' && <Building className="w-3 h-3" />}
                  <span>{record.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <BrandButton
            variant="ghost"
            size="sm"
            onClick={() => {
              openEmailComposer();
            }}
          >
            <Reply className="w-4 h-4" />
          </BrandButton>
          
          <BrandButton
            variant="ghost"
            size="sm"
            onClick={() => {
              archiveEmail(email.id);
            }}
          >
            <Archive className="w-4 h-4" />
          </BrandButton>
        </div>
      </div>
      </BrandCard>
    </div>
  );

  const sortedEmails = filteredEmails.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Container>
      <BrandPageLayout
        title="Email Management"
        subtitle="Manage all your email communications in one place"
        logoGradient={true}
        actions={
          <div className="flex items-center space-x-4">
            <BrandButton
              variant="secondary"
              onClick={() => setIsIntegrationModalOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Integrations
            </BrandButton>
            
            <BrandButton
              variant="primary"
              onClick={() => openEmailComposer()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose Email
            </BrandButton>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Email Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <BrandCard className="p-6" borderGradient="blue">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Inbox className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Total Emails</p>
                  <p className="text-2xl font-bold text-white">{emails.length}</p>
          </div>
        </div>
            </BrandCard>

            <BrandCard className="p-6" borderGradient="red">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <Mail className="w-6 h-6 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Unread</p>
                  <p className="text-2xl font-bold text-white">
                    {emails.filter(e => !e.isRead).length}
                  </p>
                </div>
              </div>
            </BrandCard>

            <BrandCard className="p-6" borderGradient="yellow">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Starred</p>
                  <p className="text-2xl font-bold text-white">
                    {emails.filter(e => e.isStarred).length}
                  </p>
                </div>
              </div>
            </BrandCard>

            <BrandCard className="p-6" borderGradient="green">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Bot className="w-6 h-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">AI Insights</p>
                  <p className="text-2xl font-bold text-white">
                    {emails.filter(e => e.aiInsights).length}
                  </p>
                </div>
              </div>
            </BrandCard>
          </div>

          {/* Search and Filters */}
          <BrandCard className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Search */}
              <div className="flex-1">
                  <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <BrandInput
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12"
                    />
                </div>
                  </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                  <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-black/20 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Emails</option>
                    <option value="unread">Unread</option>
                    <option value="starred">Starred</option>
                  <option value="important">Important</option>
                  <option value="attachments">With Attachments</option>
                  </select>

                <BrandButton
                  variant={viewMode === 'list' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                </BrandButton>
                
                <BrandButton
                  variant={viewMode === 'conversation' ? 'primary' : 'secondary'}
                      size="sm"
                  onClick={() => setViewMode('conversation')}
                >
                  <MessageSquare className="w-4 h-4" />
                </BrandButton>

                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={fetchEmails}
                >
                    <RefreshCw className="w-4 h-4" />
                </BrandButton>
              </div>
            </div>
          </BrandCard>

            {/* Email List */}
            {isLoading ? (
            <BrandCard className="p-12">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-white/80">Loading emails...</span>
                </div>
            </BrandCard>
            ) : sortedEmails.length === 0 ? (
            <BrandCard className="p-12">
                <EmptyState
                  icon={Mail}
                  title="No emails found"
                  description="Try adjusting your search or filters"
                  actionLabel="Compose Email"
                onAction={() => openEmailComposer()}
                />
            </BrandCard>
            ) : (
            <div className="space-y-4">
                  {sortedEmails.map((email) => (
                    <EmailListItem key={email.id} email={email} />
                  ))}
                </div>
            )}
        </div>
      </BrandPageLayout>

      {/* Email Composer Modal */}
      {isComposerOpen && (
        <OutlookEmailComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onSend={async (emailData) => {
            // Handle email send logic here
            console.log('Sending email:', emailData);
            setIsComposerOpen(false);
            return true;
          }}
        />
      )}

      {/* External Email Integration Modal */}
      <ExternalEmailIntegration
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
      />

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <BrandCard className="w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedEmail.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedEmail.subject}</h2>
                  <p className="text-white/70">{selectedEmail.sender}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BrandButton variant="green" size="sm">
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </BrandButton>
                <BrandButton variant="blue" size="sm">
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </BrandButton>
                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedEmail(null)}
                >
                  ×
                </BrandButton>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.preview}
                  
                  {"\n\n"}This is the full email content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  
                  {"\n\n"}Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  
                  {"\n\n"}Best regards,{"\n"}{selectedEmail.sender.split('@')[0]}
                </p>
              </div>

              {/* AI Insights */}
              {selectedEmail.aiInsights && (
                <BrandCard className="mt-6 p-4" borderGradient="purple">
                  <div className="flex items-center mb-3">
                    <Bot className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="font-semibold text-white">AI Insights</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <BrandBadge variant="info" size="sm">
                        {selectedEmail.aiInsights.sentiment}
                      </BrandBadge>
                      <BrandBadge variant="secondary" size="sm">
                        {selectedEmail.aiInsights.category}
                      </BrandBadge>
                    </div>
                    <div>
                      <p className="text-sm text-white/80 mb-2">Suggested Actions:</p>
                      <div className="space-y-1">
                        {selectedEmail.aiInsights.suggestedActions.map((action, index) => (
                          <BrandButton key={index} variant="secondary" size="sm" className="mr-2 mb-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {action}
                          </BrandButton>
                        ))}
                      </div>
                    </div>
                  </div>
                </BrandCard>
              )}

              {/* Related Records */}
              {selectedEmail.relatedRecords && selectedEmail.relatedRecords.length > 0 && (
                <BrandCard className="mt-6 p-4" borderGradient="green">
                  <div className="flex items-center mb-3">
                    <ExternalLink className="w-5 h-5 text-green-400 mr-2" />
                    <span className="font-semibold text-white">Related Records</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedEmail.relatedRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {record.type === 'contact' && <User className="w-4 h-4 text-blue-400" />}
                          {record.type === 'deal' && <Target className="w-4 h-4 text-green-400" />}
                          {record.type === 'organization' && <Building className="w-4 h-4 text-purple-400" />}
                          <span className="text-white/90">{record.name}</span>
                        </div>
                        <BrandButton variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </BrandButton>
                      </div>
                    ))}
                  </div>
                </BrandCard>
              )}
            </div>
          </BrandCard>
        </div>
      )}
    </Container>
  );
};

export default Emails;