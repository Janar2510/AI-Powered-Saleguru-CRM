import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, Edit, Trash2, Plus, 
  MessageSquare, Star, Flag, Tag, Building, Globe, Link, 
  ChevronRight, ChevronDown, MoreHorizontal, Settings, Download,
  Share2, Copy, Eye, EyeOff, Lock, Unlock, Archive, RefreshCw,
  Linkedin, Twitter, Target, FileText, ArrowLeft, Bot, Check, X, PhoneCall
} from 'lucide-react';
import CreateDocumentButton from '../common/CreateDocumentButton';
import DocumentsCard from '../common/DocumentsCard';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import EnhancedEmailComposer from '../emails/EnhancedEmailComposer';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuruContext } from '../../contexts/GuruContext';
import { BRAND } from '../../constants/theme';
import { Contact } from '../../types/contact';
import ContactEnrichmentSection from '../contacts/ContactEnrichmentSection';
import { ContactEnrichmentData } from '../../services/enrichmentService';
import CallTranscriptionModal from '../calls/CallTranscriptionModal';
import CallHistory from '../calls/CallHistory';
import CallInsightsWidget from '../calls/CallInsightsWidget';
import { SocialFeed } from '../social/SocialFeed';

interface ContactDetailProps {
  contact: Contact;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  onBack,
  onEdit,
  onDelete
}) => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuruContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'deals' | 'files' | 'enrichment' | 'calls' | 'social' | 'documents'>('overview');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showCallTranscription, setShowCallTranscription] = useState(false);

  // Sample data for the tabs
  const notes = [
    {
      id: '1',
      author: 'Janar Kuusk',
      content: 'Had a great call today. Discussed potential partnership opportunities.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mentions: []
    },
    {
      id: '2',
      author: 'Sarah Wilson',
      content: 'Sent follow-up email with pricing details. @Janar Kuusk please review.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mentions: ['Janar Kuusk']
    }
  ];

  const deals = [
    {
      id: '1',
      title: 'Enterprise Software Package',
      value: 75000,
      stage: 'Proposal',
      probability: 50,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Support Renewal',
      value: 25000,
      stage: 'Negotiation',
      probability: 75,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  ];

  const files = [
    {
      id: '1',
      name: 'Proposal_Document.pdf',
      size: '2.4 MB',
      uploaded_by: 'Janar Kuusk',
      uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Meeting_Notes.docx',
      size: '1.1 MB',
      uploaded_by: 'Sarah Wilson',
      uploaded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" size="sm">Inactive</Badge>;
      case 'lead':
        return <Badge variant="warning" size="sm">Lead</Badge>;
      case 'customer':
        return <Badge variant="primary" size="sm">Customer</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    // In a real implementation, this would save the note to the database
    showToast({
      title: 'Note Added',
      description: 'Your note has been added successfully',
      type: 'success'
    });
    
    setNewNote('');
  };

  const handleAskGuru = () => {
    openGuru();
    // In a real implementation, this would send a specific query to Guru
  };

  const handleEnrichmentComplete = (data: ContactEnrichmentData) => {
    showToast({
      title: 'Contact Enriched',
      description: 'Contact data has been successfully enriched',
      type: 'success'
    });
  };

  const handleSendEmail = async (emailData: any) => {
    // Handle email sending
    showToast({
      title: 'Email Sent',
      description: 'Email has been sent successfully',
      type: 'success'
    });
    return true;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-[#a259ff] mt-1" />
                    <div>
                      <div className="text-sm text-[#b0b0d0]">Email</div>
                      <div className="text-white">{contact.email}</div>
                    </div>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-[#a259ff] mt-1" />
                      <div>
                        <div className="text-sm text-[#b0b0d0]">Phone</div>
                        <div className="text-white">{contact.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {contact.position && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-[#a259ff] mt-1" />
                      <div>
                        <div className="text-sm text-[#b0b0d0]">Position</div>
                        <div className="text-white">{contact.position}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {contact.company && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-[#a259ff] mt-1" />
                      <div>
                        <div className="text-sm text-[#b0b0d0]">Company</div>
                        <div className="text-white">{contact.company}</div>
                      </div>
                    </div>
                  )}
                  
                  {contact.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-[#a259ff] mt-1" />
                      <div>
                        <div className="text-sm text-[#b0b0d0]">Website</div>
                        <a 
                          href={contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#a259ff] hover:text-[#8b5cf6] transition-colors"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.linkedin_url && (
                    <div className="flex items-start space-x-3">
                      <Linkedin className="w-5 h-5 text-[#a259ff] mt-1" />
                      <div>
                        <div className="text-sm text-[#b0b0d0]">LinkedIn</div>
                        <a 
                          href={contact.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#a259ff] hover:text-[#8b5cf6] transition-colors"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Activity Summary */}
            <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#23233a]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[#a259ff]">{deals.length}</div>
                  <div className="text-[#b0b0d0] text-sm">Active Deals</div>
                </div>
                <div className="text-center p-4 bg-[#23233a]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[#43e7ad]">{notes.length}</div>
                  <div className="text-[#b0b0d0] text-sm">Notes</div>
                </div>
                <div className="text-center p-4 bg-[#23233a]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[#f59e0b]">{files.length}</div>
                  <div className="text-[#b0b0d0] text-sm">Files</div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            {/* Add Note */}
            <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Add Note</h3>
              <div className="space-y-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this contact..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddNote}
                    variant="gradient"
                    size="sm"
                    icon={Plus}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-white">{note.author}</span>
                        <span className="text-[#b0b0d0] text-sm">
                          {note.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white">{note.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'deals':
        return (
          <div className="space-y-6">
            <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Deals</h3>
                <Button
                  variant="gradient"
                  size="sm"
                  icon={Plus}
                >
                  Add Deal
                </Button>
              </div>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 bg-[#23233a]/30 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{deal.title}</div>
                      <div className="text-[#b0b0d0] text-sm">
                        ${deal.value.toLocaleString()} • {deal.stage} • {deal.probability}% probability
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#a259ff] font-medium">${deal.value.toLocaleString()}</div>
                      <div className="text-[#b0b0d0] text-sm">{deal.created_at.toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'calls':
        return (
          <div className="space-y-6">
            <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Call History</h3>
                <Button
                  variant="gradient"
                  size="sm"
                  icon={PhoneCall}
                >
                  Schedule Call
                </Button>
              </div>
              <CallHistory contactId={contact.id} />
            </Card>
            
            <CallInsightsWidget contactId={contact.id} />
          </div>
        );

      case 'files':
        return (
          <div className="space-y-6">
            <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Files</h3>
                <Button
                  variant="gradient"
                  size="sm"
                  icon={Plus}
                >
                  Upload File
                </Button>
              </div>
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-[#23233a]/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#a259ff]" />
                      <div>
                        <div className="font-medium text-white">{file.name}</div>
                        <div className="text-[#b0b0d0] text-sm">
                          {file.size} • Uploaded by {file.uploaded_by}
                        </div>
                      </div>
                    </div>
                    <div className="text-[#b0b0d0] text-sm">
                      {file.uploaded_at.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'enrichment':
        return (
          <ContactEnrichmentSection
            contactId={contact.id}
            email={contact.email}
            onEnrichmentComplete={handleEnrichmentComplete}
          />
        );

      case 'social':
        return (
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <h3 className="text-lg font-semibold text-white mb-4">Social Activity</h3>
            <SocialFeed contactId={contact.id} />
          </Card>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            {/* Create Document Button */}
            <div className="flex justify-end">
              <CreateDocumentButton
                contactId={contact.id}
                contactName={contact.name}
                className="mb-4"
              />
            </div>
            
            {/* Documents Card */}
            <DocumentsCard
              contactId={contact.id}
              title={`Documents for ${contact.name}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onBack}
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{contact.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(contact.status)}
              {contact.lead_score && (
                <Badge variant="primary" size="sm">
                  Score: {contact.lead_score}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowEmailComposer(true)}
            variant="gradient"
            size="sm"
            icon={MessageSquare}
          >
            Send Email
          </Button>
          <Button
            onClick={handleAskGuru}
            variant="secondary"
            size="sm"
            icon={Bot}
          >
            Ask Guru
          </Button>
          <Button
            onClick={onEdit}
            variant="secondary"
            size="sm"
            icon={Edit}
          >
            Edit
          </Button>
          {showConfirmDelete ? (
            <div className="flex items-center space-x-2 bg-[#ef4444]/20 border border-[#ef4444]/30 rounded-lg p-2">
              <span className="text-[#ef4444] text-sm">Confirm?</span>
              <Button
                onClick={onDelete}
                variant="danger"
                size="sm"
                icon={Check}
                className="text-[#ef4444] hover:text-[#ef4444]"
              />
              <Button
                onClick={() => setShowConfirmDelete(false)}
                variant="secondary"
                size="sm"
                icon={X}
              />
            </div>
          ) : (
            <Button
              onClick={() => setShowConfirmDelete(true)}
              variant="secondary"
              size="sm"
              icon={Trash2}
              className="text-[#ef4444] hover:text-[#ef4444]"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Contact Profile Card */}
      <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-[#a259ff] rounded-full flex items-center justify-center">
            {contact.avatar_url ? (
              <img 
                src={contact.avatar_url} 
                alt={contact.name} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#a259ff]" />
                <div>
                  <div className="text-sm text-[#b0b0d0]">Email</div>
                  <div className="text-white">{contact.email}</div>
                </div>
              </div>
              
              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#a259ff]" />
                  <div>
                    <div className="text-sm text-[#b0b0d0]">Phone</div>
                    <div className="text-white">{contact.phone}</div>
                  </div>
                </div>
              )}
              
              {contact.company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-[#a259ff]" />
                  <div>
                    <div className="text-sm text-[#b0b0d0]">Company</div>
                    <div className="text-white">{contact.company}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#a259ff]" />
                <div>
                  <div className="text-sm text-[#b0b0d0]">Created</div>
                  <div className="text-white">{contact.created_at.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#23233a]/30">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'notes'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'deals'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Deals
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'calls'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Calls
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'documents'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'files'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab('enrichment')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'enrichment'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Enrichment
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'social'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Social
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {renderTabContent()}
      </div>

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <EnhancedEmailComposer
          isOpen={showEmailComposer}
          onClose={() => setShowEmailComposer(false)}
          onSend={handleSendEmail}
          initialData={{
            to: contact.email,
            contactId: contact.id,
            subject: `Follow-up: ${contact.name}`,
            body: ''
          }}
        />
      )}

      {/* Call Transcription Modal */}
      {showCallTranscription && (
        <CallTranscriptionModal
          isOpen={showCallTranscription}
          onClose={() => setShowCallTranscription(false)}
          contactId={contact.id}
        />
      )}
    </div>
  );
};

export default ContactDetail;