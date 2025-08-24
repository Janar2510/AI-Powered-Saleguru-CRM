import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Plus, Send, Paperclip, Mail, Clock, User, Building, 
  ChevronDown, ChevronUp, Eye, EyeOff, Download, Archive,
  Trash2, Star, Flag, Reply, ReplyAll, Forward, MoreHorizontal, Search
} from 'lucide-react';
import EnhancedEmailComposer from '../emails/EnhancedEmailComposer';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';

interface DealEmail {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  recipient_id: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  timestamp: Date;
  is_read: boolean;
  has_attachments: boolean;
  thread_id?: string;
  is_outbound: boolean;
}

interface DealEmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: {
    id: string;
    deal_id: string;
    title: string;
    company: string;
    contact: string;
  };
}

const DealEmailsModal: React.FC<DealEmailsModalProps> = ({ isOpen, onClose, deal }) => {
  const [emails, setEmails] = useState<DealEmail[]>([
    {
      id: '1',
      sender_id: 'john-smith',
      sender_name: 'John Smith',
      sender_email: 'john.smith@techcorp.com',
      recipient_id: 'janar-kuusk',
      recipient_name: 'Janar Kuusk',
      recipient_email: 'janar@saletoru.com',
      subject: 'Re: Enterprise Software Package Proposal',
      body: 'Hi Janar,\n\nThank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline and training process.\n\nCould we schedule a call this week to discuss?\n\nBest regards,\nJohn',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      is_read: true,
      has_attachments: false,
      thread_id: 'thread-1',
      is_outbound: false
    },
    {
      id: '2',
      sender_id: 'janar-kuusk',
      sender_name: 'Janar Kuusk',
      sender_email: 'janar@saletoru.com',
      recipient_id: 'john-smith',
      recipient_name: 'John Smith',
      recipient_email: 'john.smith@techcorp.com',
      subject: 'Enterprise Software Package Proposal',
      body: 'Hi John,\n\nI hope this email finds you well. As discussed in our meeting last week, I\'m attaching our comprehensive proposal for the Enterprise Software Package.\n\nKey highlights:\n• Complete CRM solution\n• Advanced analytics dashboard\n• 24/7 support included\n• Implementation within 6 weeks\n\nI\'d be happy to schedule a follow-up call to address any questions.\n\nBest regards,\nJanar',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      is_read: true,
      has_attachments: true,
      thread_id: 'thread-1',
      is_outbound: true
    },
    {
      id: '3',
      sender_id: 'janar-kuusk',
      sender_name: 'Janar Kuusk',
      sender_email: 'janar@saletoru.com',
      recipient_id: 'john-smith',
      recipient_name: 'John Smith',
      recipient_email: 'john.smith@techcorp.com',
      subject: 'Welcome to SaleToru - Next Steps',
      body: 'Hi John,\n\nGreat meeting you at the conference! As promised, here\'s some information about how SaleToru can help TechCorp streamline your sales process.\n\nI\'ve attached our case study with a similar company in your industry.\n\nLooking forward to our call next week.\n\nBest,\nJanar',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      is_read: true,
      has_attachments: true,
      thread_id: 'thread-2',
      is_outbound: true
    }
  ]);

  const [selectedEmail, setSelectedEmail] = useState<DealEmail | null>(emails[0]);
  const [showComposer, setShowComposer] = useState(false);
  const [composerData, setComposerData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const { showToast } = useToastContext();

  const handleSendEmail = async (emailData: any) => {
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast({
        title: 'Email Sent',
        description: 'Your email has been sent successfully',
        type: 'success'
      });
      setShowComposer(false);
      return true;
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to send email',
        type: 'error'
      });
      return false;
    }
  };

  const openComposer = () => {
    setComposerData({
      to: deal.contact,
      subject: `Re: ${deal.title}`,
      dealId: deal.id
    });
    setShowComposer(true);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setComposerData(null);
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.sender_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'inbound':
        return !email.is_outbound && matchesSearch;
      case 'outbound':
        return email.is_outbound && matchesSearch;
      case 'unread':
        return !email.is_read && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const groupedEmails = filteredEmails.reduce((groups, email) => {
    const threadId = email.thread_id || email.id;
    if (!groups[threadId]) {
      groups[threadId] = [];
    }
    groups[threadId].push(email);
    return groups;
  }, {} as Record<string, DealEmail[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Deal Emails</h3>
            <p className="text-secondary-400 text-sm mt-1">
              {deal.deal_id} - {deal.title} ({deal.company})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openComposer}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Compose</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-secondary-700 bg-secondary-750">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All Emails</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className="w-1/3 border-r border-secondary-700 overflow-y-auto">
            <div className="p-4">
              <h4 className="font-medium text-white mb-3">
                Email Threads ({Object.keys(groupedEmails).length})
              </h4>
              <div className="space-y-2">
                {Object.entries(groupedEmails).map(([threadId, threadEmails]) => {
                  const latestEmail = threadEmails.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
                  return (
                    <button
                      key={threadId}
                      onClick={() => setSelectedEmail(latestEmail)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedEmail?.thread_id === threadId || selectedEmail?.id === threadId
                          ? 'bg-primary-600/20 border border-primary-600/30'
                          : 'bg-secondary-700 hover:bg-secondary-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${latestEmail.is_outbound ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                          <span className="text-sm font-medium text-white truncate">
                            {latestEmail.is_outbound ? latestEmail.recipient_name : latestEmail.sender_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {latestEmail.has_attachments && <Paperclip className="w-3 h-3 text-secondary-400" />}
                          <Badge variant="secondary" size="sm">{threadEmails.length}</Badge>
                        </div>
                      </div>
                      <h5 className="font-medium text-white text-sm truncate mb-1">
                        {latestEmail.subject}
                      </h5>
                      <p className="text-xs text-secondary-400 truncate">
                        {latestEmail.body.substring(0, 80)}...
                      </p>
                      <div className="text-xs text-secondary-500 mt-2">
                        {latestEmail.timestamp.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 flex flex-col">
            {selectedEmail ? (
              <>
                {/* Email Header */}
                <div className="p-4 border-b border-secondary-700 bg-secondary-750">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{selectedEmail.subject}</h4>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-secondary-400">
                        <span>
                          From: {selectedEmail.sender_name} ({selectedEmail.sender_email})
                        </span>
                        <span>•</span>
                        <span>
                          To: {selectedEmail.recipient_name} ({selectedEmail.recipient_email})
                        </span>
                      </div>
                      <div className="text-xs text-secondary-500 mt-1">
                        {selectedEmail.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedEmail.is_outbound ? 'primary' : 'success'} size="sm">
                        {selectedEmail.is_outbound ? 'Outbound' : 'Inbound'}
                      </Badge>
                      <button className="p-1 text-secondary-400 hover:text-white">
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-secondary-200 leading-relaxed">
                    {selectedEmail.body}
                  </div>
                  
                  {selectedEmail.has_attachments && (
                    <div className="mt-4 p-3 bg-secondary-700 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-secondary-300">
                        <Paperclip className="w-4 h-4" />
                        <span>Attachments:</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer">
                          📄 Enterprise_Proposal_v2.pdf (2.3 MB)
                        </div>
                        <div className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer">
                          📊 Implementation_Timeline.xlsx (1.1 MB)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Actions */}
                <div className="p-4 border-t border-secondary-700 bg-secondary-750">
                  <div className="flex space-x-2">
                    <button className="btn-primary flex items-center space-x-2">
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                    <button className="btn-secondary flex items-center space-x-2">
                      <Forward className="w-4 h-4" />
                      <span>Forward</span>
                    </button>
                    <button className="btn-secondary">Mark as Unread</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
                  <p className="text-secondary-400">Select an email to view</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Composer */}
        {showComposer && composerData && (
          <EnhancedEmailComposer
            isOpen={showComposer}
            onClose={closeComposer}
            onSend={handleSendEmail}
            initialData={composerData}
          />
        )}
      </div>
    </div>
  );
};

export default DealEmailsModal;