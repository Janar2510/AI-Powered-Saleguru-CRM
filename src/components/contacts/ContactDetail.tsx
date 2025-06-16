import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Globe, MapPin, Calendar, Edit, Trash2, ArrowLeft, Linkedin, Twitter, MessageSquare, Target, FileText, Plus, Bot, Check, X } from 'lucide-react';
import { Contact } from '../../types/contact';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import ContactEnrichmentSection from '../contacts/ContactEnrichmentSection';
import { ContactEnrichmentData } from '../../services/enrichmentService';

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
  const { openGuru } = useGuru();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'deals' | 'files' | 'enrichment'>('overview');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [newNote, setNewNote] = useState('');

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <div className="text-sm text-secondary-400">Email</div>
                      <div className="text-white">{contact.email}</div>
                    </div>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Phone</div>
                        <div className="text-white">{contact.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {contact.position && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Position</div>
                        <div className="text-white">{contact.position}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {contact.company && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Company</div>
                        <div className="text-white">{contact.company}</div>
                      </div>
                    </div>
                  )}
                  
                  {contact.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Website</div>
                        <a 
                          href={contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.industry && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Industry</div>
                        <div className="text-white">{contact.industry}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Social Profiles */}
            {(contact.linkedin_url || contact.twitter_url) && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Social Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contact.linkedin_url && (
                    <div className="flex items-start space-x-3">
                      <Linkedin className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">LinkedIn</div>
                        <a 
                          href={contact.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {contact.linkedin_url}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.twitter_url && (
                    <div className="flex items-start space-x-3">
                      <Twitter className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Twitter</div>
                        <a 
                          href={contact.twitter_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {contact.twitter_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {/* Tags */}
            {contact.tags.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Notes */}
            {contact.notes && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                <p className="text-secondary-300 whitespace-pre-wrap">{contact.notes}</p>
              </Card>
            )}
            
            {/* Activity Timeline */}
            <Card className="bg-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Contact Created</div>
                    <div className="text-sm text-secondary-400 mt-1">
                      {contact.created_at.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {contact.last_contacted_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Last Contacted</div>
                      <div className="text-sm text-secondary-400 mt-1">
                        {contact.last_contacted_at.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* AI Insights */}
            <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Guru Contact Insights</h3>
                  <p className="text-secondary-300 text-sm mt-2">
                    Ask SaleToruGuru for insights about this contact, engagement history, and recommended next steps.
                  </p>
                  <button 
                    onClick={handleAskGuru}
                    className="btn-primary text-sm mt-3"
                  >
                    Ask Guru
                  </button>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case 'notes':
        return (
          <div className="space-y-6">
            {/* Add Note Form */}
            <Card className="bg-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Add Note</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this contact... Use @name to mention team members"
                rows={4}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </Card>
            
            {/* Notes List */}
            <Card className="bg-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Notes History</h3>
              <div className="space-y-4">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note.id} className="p-4 bg-secondary-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{note.author}</div>
                            <div className="text-xs text-secondary-400">
                              {note.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-secondary-400 hover:text-white transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-secondary-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-secondary-200">
                        {note.content.split('@').map((part, i) => {
                          if (i === 0) return part;
                          const mentionEnd = part.indexOf(' ');
                          if (mentionEnd === -1) return `@${part}`;
                          
                          const mention = part.substring(0, mentionEnd);
                          const rest = part.substring(mentionEnd);
                          
                          return (
                            <React.Fragment key={i}>
                              <span className="bg-primary-600/20 text-primary-300 px-1 rounded">@{mention}</span>
                              {rest}
                            </React.Fragment>
                          );
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                    <p className="text-secondary-400">No notes yet</p>
                    <p className="text-secondary-500 text-sm mt-1">Add the first note to start collaborating</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      
      case 'deals':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Related Deals</h3>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Deal</span>
                </button>
              </div>
              <div className="space-y-4">
                {deals.length > 0 ? (
                  deals.map((deal) => (
                    <div key={deal.id} className="p-4 bg-secondary-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-white">{deal.title}</div>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="text-sm text-secondary-400">
                              Stage: {deal.stage}
                            </div>
                            <div className="text-sm text-green-500">
                              ${deal.value.toLocaleString()}
                            </div>
                            <div className="text-sm text-secondary-400">
                              {deal.probability}% probability
                            </div>
                          </div>
                          <div className="text-xs text-secondary-500 mt-1">
                            Created: {deal.created_at.toLocaleDateString()}
                          </div>
                        </div>
                        <button className="btn-secondary text-sm">View Deal</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                    <p className="text-secondary-400">No deals yet</p>
                    <p className="text-secondary-500 text-sm mt-1">Create a deal to start tracking opportunities</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      
      case 'files':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Files</h3>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
              </div>
              <div className="space-y-4">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div key={file.id} className="p-4 bg-secondary-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-primary-500" />
                          <div>
                            <div className="font-medium text-white">{file.name}</div>
                            <div className="text-sm text-secondary-400">
                              {file.size} • Uploaded by {file.uploaded_by} • {file.uploaded_at.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button className="btn-secondary text-sm">Download</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                    <p className="text-secondary-400">No files yet</p>
                    <p className="text-secondary-500 text-sm mt-1">Upload files to share with your team</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      
      case 'enrichment':
        return (
          <div className="space-y-6">
            <ContactEnrichmentSection 
              contactId={contact.id} 
              email={contact.email}
              onEnrichmentComplete={handleEnrichmentComplete}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-secondary-700 hover:bg-secondary-600 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white">{contact.name}</h2>
              {getStatusBadge(contact.status)}
            </div>
            <p className="text-secondary-400 mt-1">
              {contact.position}{contact.position && contact.company ? ' at ' : ''}{contact.company}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          {showConfirmDelete ? (
            <div className="flex items-center space-x-2 bg-red-900/20 border border-red-600/30 rounded-lg p-2">
              <span className="text-red-300 text-sm">Confirm?</span>
              <button
                onClick={onDelete}
                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="p-1 bg-secondary-600 text-white rounded hover:bg-secondary-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="btn-secondary flex items-center space-x-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Contact Profile Card */}
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
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
                <Mail className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-sm text-secondary-400">Email</div>
                  <div className="text-white">{contact.email}</div>
                </div>
              </div>
              
              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="text-sm text-secondary-400">Phone</div>
                    <div className="text-white">{contact.phone}</div>
                  </div>
                </div>
              )}
              
              {contact.company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="text-sm text-secondary-400">Company</div>
                    <div className="text-white">{contact.company}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-sm text-secondary-400">Created</div>
                  <div className="text-white">{contact.created_at.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-secondary-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-secondary-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'notes'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-secondary-400 hover:text-white'
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'deals'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-secondary-400 hover:text-white'
          }`}
        >
          Deals
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'files'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-secondary-400 hover:text-white'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab('enrichment')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'enrichment'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-secondary-400 hover:text-white'
          }`}
        >
          Enrichment
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ContactDetail;