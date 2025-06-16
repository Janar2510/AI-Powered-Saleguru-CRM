import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Send, Reply, Forward, Paperclip, Star, Archive, Trash2, Eye, Edit, MoreHorizontal, Bot, Check, X } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import EmailComposer from '../components/emails/EmailComposer';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  html_body?: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  linkedDeal?: string;
  linkedContact?: string;
  priority: 'low' | 'medium' | 'high';
  thread?: string;
  tracking_id?: string;
  status?: string;
}

const Emails: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [replyData, setReplyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch emails from Supabase
  useEffect(() => {
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        // Fetch emails from Supabase
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .order('sent_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedEmails = data.map(email => ({
            id: email.id,
            from: email.created_by ? 'janar@example.com' : email.to,
            to: [email.to],
            subject: email.subject,
            body: email.text_body || '',
            html_body: email.html_body,
            timestamp: new Date(email.sent_at || email.created_at),
            isRead: email.status !== 'sent',
            isStarred: false,
            hasAttachments: email.has_attachments,
            linkedDeal: email.deal_id,
            linkedContact: email.contact_id,
            priority: 'medium' as 'low' | 'medium' | 'high',
            thread: email.id,
            tracking_id: email.tracking_id,
            status: email.status
          }));
          
          setEmails(formattedEmails);
        } else {
          // Fallback to mock data
          setEmails([
            {
              id: '1',
              from: 'john.smith@techcorp.com',
              to: ['janar@example.com'],
              subject: 'Re: Enterprise Software Package Proposal',
              body: 'Hi Janar,\n\nThank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...',
              html_body: '<p>Hi Janar,</p><p>Thank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...</p>',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              isRead: false,
              isStarred: true,
              hasAttachments: true,
              linkedDeal: 'Enterprise Software Package',
              linkedContact: 'John Smith',
              priority: 'high',
              thread: 'thread-1',
              tracking_id: uuidv4()
            },
            {
              id: '2',
              from: 'sarah.johnson@startupxyz.com',
              to: ['janar@example.com'],
              subject: 'Demo Follow-up - Cloud Infrastructure',
              body: 'Hi Janar,\n\nGreat demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?',
              html_body: '<p>Hi Janar,</p><p>Great demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?</p>',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
              isRead: true,
              isStarred: false,
              hasAttachments: false,
              linkedDeal: 'Cloud Infrastructure',
              linkedContact: 'Sarah Johnson',
              priority: 'medium',
              thread: 'thread-2',
              tracking_id: uuidv4()
            },
            {
              id: '3',
              from: 'mike.wilson@financecore.com',
              to: ['janar@example.com'],
              subject: 'Contract Terms Discussion',
              body: 'Hello,\n\nI wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?',
              html_body: '<p>Hello,</p><p>I wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?</p>',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              isRead: true,
              isStarred: false,
              hasAttachments: false,
              linkedDeal: 'Financial Services',
              linkedContact: 'Mike Wilson',
              priority: 'low',
              tracking_id: uuidv4()
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching emails:', err);
        
        // Fallback to mock data
        setEmails([
          {
            id: '1',
            from: 'john.smith@techcorp.com',
            to: ['janar@example.com'],
            subject: 'Re: Enterprise Software Package Proposal',
            body: 'Hi Janar,\n\nThank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...',
            html_body: '<p>Hi Janar,</p><p>Thank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...</p>',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false,
            isStarred: true,
            hasAttachments: true,
            linkedDeal: 'Enterprise Software Package',
            linkedContact: 'John Smith',
            priority: 'high',
            thread: 'thread-1',
            tracking_id: uuidv4()
          },
          {
            id: '2',
            from: 'sarah.johnson@startupxyz.com',
            to: ['janar@example.com'],
            subject: 'Demo Follow-up - Cloud Infrastructure',
            body: 'Hi Janar,\n\nGreat demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?',
            html_body: '<p>Hi Janar,</p><p>Great demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?</p>',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            isRead: true,
            isStarred: false,
            hasAttachments: false,
            linkedDeal: 'Cloud Infrastructure',
            linkedContact: 'Sarah Johnson',
            priority: 'medium',
            thread: 'thread-2',
            tracking_id: uuidv4()
          },
          {
            id: '3',
            from: 'mike.wilson@financecore.com',
            to: ['janar@example.com'],
            subject: 'Contract Terms Discussion',
            body: 'Hello,\n\nI wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?',
            html_body: '<p>Hello,</p><p>I wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?</p>',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            isRead: true,
            isStarred: false,
            hasAttachments: false,
            linkedDeal: 'Financial Services',
            linkedContact: 'Mike Wilson',
            priority: 'low',
            tracking_id: uuidv4()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'unread':
        return !email.isRead && matchesSearch;
      case 'starred':
        return email.isStarred && matchesSearch;
      case 'priority':
        return email.priority === 'high' && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-secondary-400';
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      // Add the new email to the list
      const newEmail: Email = {
        id: emailData.email_id || Date.now().toString(),
        from: 'janar@example.com',
        to: [emailData.to],
        subject: emailData.subject,
        body: emailData.text_body,
        html_body: emailData.html_body,
        timestamp: new Date(),
        isRead: true,
        isStarred: false,
        hasAttachments: emailData.attachments.length > 0,
        priority: 'medium',
        thread: replyData?.thread || undefined,
        tracking_id: emailData.tracking_id,
        status: 'sent'
      };
      
      setEmails(prev => [newEmail, ...prev]);
      
      setShowCompose(false);
      setReplyData(null);
      
      return true;
    } catch (error) {
      console.error('Error handling sent email:', error);
      throw error;
    }
  };

  const handleReply = (email: Email) => {
    setReplyData({
      to: email.from,
      subject: `Re: ${email.subject}`,
      isReply: true,
      originalEmail: email,
      thread: email.thread,
      dealId: email.linkedDeal,
      contactId: email.linkedContact
    });
    setShowCompose(true);
  };

  const handleForward = (email: Email) => {
    setReplyData({
      subject: `Fwd: ${email.subject}`,
      body: `<p>---------- Forwarded message ----------</p>
             <p>From: ${email.from}<br>
             Date: ${email.timestamp.toLocaleString()}<br>
             Subject: ${email.subject}<br>
             To: ${email.to.join(', ')}</p>
             <br>
             ${email.html_body || email.body}`,
      isReply: false,
      dealId: email.linkedDeal,
      contactId: email.linkedContact
    });
    setShowCompose(true);
  };

  const handleArchive = async (email: Email) => {
    try {
      // Update email status in Supabase
      if (supabase) {
        const { error } = await supabase
          .from('emails')
          .update({ status: 'archived' })
          .eq('id', email.id);
        
        if (error) throw error;
      }
      
      // Remove from local state
      setEmails(prev => prev.filter(e => e.id !== email.id));
      
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
      }
      
      showToast({
        title: 'Email Archived',
        description: `"${email.subject}" has been archived.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error archiving email:', error);
      showToast({
        title: 'Archive Failed',
        description: 'Failed to archive email.',
        type: 'error'
      });
    }
  };

  const handleDelete = async (email: Email) => {
    try {
      // Delete email from Supabase
      if (supabase) {
        const { error } = await supabase
          .from('emails')
          .delete()
          .eq('id', email.id);
        
        if (error) throw error;
      }
      
      // Remove from local state
      setEmails(prev => prev.filter(e => e.id !== email.id));
      
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
      }
      
      setDeleteConfirm(null);
      
      showToast({
        title: 'Email Deleted',
        description: `"${email.subject}" has been deleted.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting email:', error);
      showToast({
        title: 'Delete Failed',
        description: 'Failed to delete email.',
        type: 'error'
      });
    }
  };

  const toggleStar = async (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, isStarred: !email.isStarred }
        : email
    ));
    
    // In a real app, update the star status in the database
    if (supabase) {
      try {
        const email = emails.find(e => e.id === emailId);
        if (email) {
          const { error } = await supabase
            .from('emails')
            .update({ is_starred: !email.isStarred })
            .eq('id', emailId);
          
          if (error) throw error;
        }
      } catch (error) {
        console.error('Error updating star status:', error);
      }
    }
  };

  const markAsRead = async (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, isRead: true }
        : email
    ));
    
    // In a real app, update the read status in the database
    if (supabase) {
      try {
        const { error } = await supabase
          .from('emails')
          .update({ status: 'read' })
          .eq('id', emailId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    }
  };

  const EmailListItem = ({ email }: { email: Email }) => (
    <div
      onClick={() => {
        setSelectedEmail(email);
        markAsRead(email.id);
      }}
      className={`p-4 border-b border-secondary-700 hover:bg-secondary-700/50 cursor-pointer transition-colors ${
        selectedEmail?.id === email.id ? 'bg-secondary-700' : ''
      } ${!email.isRead ? 'border-l-4 border-l-primary-600' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`font-medium ${!email.isRead ? 'text-white' : 'text-secondary-300'}`}>
              {activeTab === 'inbox' ? email.from : email.to.join(', ')}
            </span>
            {email.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            {email.hasAttachments && <Paperclip className="w-4 h-4 text-secondary-400" />}
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(email.priority)}`}></div>
            {email.status === 'opened' && (
              <Eye className="w-4 h-4 text-green-500" title="Email opened" />
            )}
          </div>
          <h4 className={`font-medium truncate ${!email.isRead ? 'text-white' : 'text-secondary-300'}`}>
            {email.subject}
          </h4>
          <p className="text-sm text-secondary-500 truncate mt-1">{email.body}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs text-secondary-500">
              {email.timestamp.toLocaleString()}
            </span>
            {email.linkedDeal && (
              <Badge variant="secondary" size="sm">{email.linkedDeal}</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Emails</h1>
            <p className="text-secondary-400 mt-1">Manage your email communications</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button
              onClick={() => {
                setShowCompose(true);
                setReplyData(null);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Compose</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
            }`}
          >
            Inbox ({emails.filter(e => !e.isRead).length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="all">All Emails</option>
            <option value="unread">Unread</option>
            <option value="starred">Starred</option>
            <option value="priority">High Priority</option>
          </select>
        </div>

        {/* Email Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email List */}
          <Card className="h-[600px] overflow-hidden bg-white/10 backdrop-blur-md">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-secondary-700">
                <h3 className="font-semibold text-white">
                  {activeTab === 'inbox' ? 'Inbox' : 'Sent'} ({filteredEmails.length})
                </h3>
                <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-secondary-400">Loading emails...</p>
                    </div>
                  </div>
                ) : filteredEmails.length > 0 ? (
                  filteredEmails.map((email) => (
                    <EmailListItem key={email.id} email={email} />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <EmptyState
                      icon={Mail}
                      title="No emails found"
                      description={searchTerm ? 'Try adjusting your search criteria' : 'No emails in this folder'}
                      guruSuggestion="Help me organize my emails"
                      showGuru={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Email Preview */}
          <Card className="h-[600px] overflow-hidden bg-white/10 backdrop-blur-md">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-secondary-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{selectedEmail.subject}</h3>
                      <p className="text-sm text-secondary-400 mt-1">
                        From: {selectedEmail.from}
                      </p>
                      <p className="text-sm text-secondary-400">
                        {selectedEmail.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => toggleStar(selectedEmail.id)}
                        className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                      >
                        <Star className={`w-4 h-4 ${selectedEmail.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleArchive(selectedEmail)}
                        className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(selectedEmail.id)}
                        className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {selectedEmail.linkedDeal && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="primary" size="sm">Deal: {selectedEmail.linkedDeal}</Badge>
                      <Badge variant="secondary" size="sm">Contact: {selectedEmail.linkedContact}</Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html_body || selectedEmail.body.replace(/\n/g, '<br>') }}
                  />
                </div>
                <div className="p-4 border-t border-secondary-700">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleReply(selectedEmail)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                    <button 
                      onClick={() => handleForward(selectedEmail)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Forward className="w-4 h-4" />
                      <span>Forward</span>
                    </button>
                    <button 
                      onClick={openGuru}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Bot className="w-4 h-4" />
                      <span>AI Assist</span>
                    </button>
                  </div>
                  
                  {/* Delete confirmation */}
                  {deleteConfirm === selectedEmail.id && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                      <p className="text-sm text-red-300 mb-2">Are you sure you want to delete this email?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(selectedEmail)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-secondary-600 hover:bg-secondary-500 text-white text-sm rounded-lg flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
                  <p className="text-secondary-400">Select an email to view</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Email Composer */}
        {showCompose && (
          <EmailComposer
            isOpen={showCompose}
            onClose={() => {
              setShowCompose(false);
              setReplyData(null);
            }}
            onSend={handleSendEmail}
            initialData={replyData}
          />
        )}
      </div>
    </Container>
  );
};

export default Emails;