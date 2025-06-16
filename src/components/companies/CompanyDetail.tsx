import React, { useState } from 'react';
import { Building, Globe, Mail, Phone, MapPin, Calendar, Edit, Trash2, ArrowLeft, Linkedin, Twitter, Facebook, MessageSquare, Target, FileText, Plus, Bot, Check, X, Users, DollarSign, User, TrendingUp } from 'lucide-react';
import { Company } from '../../types/company';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import CompanyEnrichmentSection from '../companies/CompanyEnrichmentSection';
import { CompanyEnrichmentData } from '../../services/enrichmentService';

interface CompanyDetailProps {
  company: Company;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({
  company,
  onBack,
  onEdit,
  onDelete
}) => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'notes' | 'deals' | 'files' | 'enrichment'>('overview');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Sample data for the tabs
  const contacts = [
    {
      id: '1',
      name: 'John Smith',
      position: 'CTO',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'VP Sales',
      email: 'sarah@techcorp.com',
      phone: '+1 (555) 987-6543'
    }
  ];

  const notes = [
    {
      id: '1',
      author: 'Janar Kuusk',
      content: 'Had a meeting with their team. They are interested in our enterprise solution.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mentions: []
    },
    {
      id: '2',
      author: 'Sarah Wilson',
      content: 'Sent proposal to @John Smith. Waiting for feedback.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mentions: ['John Smith']
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
      name: 'Company_Overview.pdf',
      size: '3.2 MB',
      uploaded_by: 'Janar Kuusk',
      uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Technical_Requirements.docx',
      size: '1.5 MB',
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

  const handleEnrichmentComplete = (data: CompanyEnrichmentData) => {
    showToast({
      title: 'Company Enriched',
      description: 'Company data has been successfully enriched',
      type: 'success'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Company Information */}
            <Card className="bg-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {company.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Website</div>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Email</div>
                        <div className="text-white">{company.email}</div>
                      </div>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Phone</div>
                        <div className="text-white">{company.phone}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {company.industry && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Industry</div>
                        <div className="text-white">{company.industry}</div>
                      </div>
                    </div>
                  )}
                  
                  {company.size && (
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Company Size</div>
                        <div className="text-white">{company.size}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <div className="text-sm text-secondary-400">Created</div>
                      <div className="text-white">{company.created_at.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Address */}
            {(company.address || company.city || company.state || company.country) && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    {company.address && <div className="text-white">{company.address}</div>}
                    <div className="text-white">
                      {company.city && `${company.city}, `}
                      {company.state && `${company.state} `}
                      {company.postal_code && company.postal_code}
                    </div>
                    {company.country && <div className="text-white">{company.country}</div>}
                  </div>
                </div>
              </Card>
            )}
            
            {/* Social Profiles */}
            {(company.linkedin_url || company.twitter_url || company.facebook_url) && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Social Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.linkedin_url && (
                    <div className="flex items-start space-x-3">
                      <Linkedin className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">LinkedIn</div>
                        <a 
                          href={company.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {company.linkedin_url}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {company.twitter_url && (
                    <div className="flex items-start space-x-3">
                      <Twitter className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Twitter</div>
                        <a 
                          href={company.twitter_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {company.twitter_url}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {company.facebook_url && (
                    <div className="flex items-start space-x-3">
                      <Facebook className="w-5 h-5 text-primary-500 mt-1" />
                      <div>
                        <div className="text-sm text-secondary-400">Facebook</div>
                        <a 
                          href={company.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {company.facebook_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {/* Tags */}
            {company.tags.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Description */}
            {company.description && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                <p className="text-secondary-300 whitespace-pre-wrap">{company.description}</p>
              </Card>
            )}
            
            {/* Activity Timeline */}
            <Card className="bg-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Company Created</div>
                    <div className="text-sm text-secondary-400 mt-1">
                      {company.created_at.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {company.last_contacted_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Last Contacted</div>
                      <div className="text-sm text-secondary-400 mt-1">
                        {company.last_contacted_at.toLocaleString()}
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
                  <h3 className="font-medium text-white">Guru Company Insights</h3>
                  <p className="text-secondary-300 text-sm mt-2">
                    Ask SaleToruGuru for insights about this company, industry trends, and recommended approaches.
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
      
      case 'contacts':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Contacts</h3>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
              <div className="space-y-4">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.id} className="p-4 bg-secondary-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{contact.name}</div>
                            <div className="text-sm text-secondary-400">{contact.position}</div>
                            <div className="flex items-center space-x-3 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-secondary-500">
                                <Mail className="w-3 h-3" />
                                <span>{contact.email}</span>
                              </div>
                              {contact.phone && (
                                <div className="flex items-center space-x-1 text-xs text-secondary-500">
                                  <Phone className="w-3 h-3" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="btn-secondary text-sm">View</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                    <p className="text-secondary-400">No contacts yet</p>
                    <p className="text-secondary-500 text-sm mt-1">Add contacts to this company</p>
                  </div>
                )}
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
                placeholder="Add a note about this company... Use @name to mention team members"
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
                <h3 className="text-lg font-semibold text-white">Deals</h3>
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
            
            {/* Deal Summary */}
            {deals.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Deal Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary-700 rounded-lg text-center">
                    <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      ${deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-secondary-400">Total Value</div>
                  </div>
                  <div className="p-4 bg-secondary-700 rounded-lg text-center">
                    <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {deals.length}
                    </div>
                    <div className="text-sm text-secondary-400">Active Deals</div>
                  </div>
                  <div className="p-4 bg-secondary-700 rounded-lg text-center">
                    <TrendingUp className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {Math.round(deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length)}%
                    </div>
                    <div className="text-sm text-secondary-400">Avg. Probability</div>
                  </div>
                </div>
              </Card>
            )}
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
            <CompanyEnrichmentSection 
              companyId={company.id} 
              website={company.website || ''}
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
              <h2 className="text-2xl font-bold text-white">{company.name}</h2>
              {getStatusBadge(company.status)}
            </div>
            <p className="text-secondary-400 mt-1">
              {company.industry}{company.industry && company.size ? ' • ' : ''}{company.size}
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

      {/* Company Profile Card */}
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-primary-600 rounded-lg flex items-center justify-center">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name} 
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <Building className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-sm text-secondary-400">Contacts</div>
                  <div className="text-white">{company.contact_count}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-sm text-secondary-400">Deals</div>
                  <div className="text-white">{company.deal_count}</div>
                </div>
              </div>
              
              {company.total_deal_value && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="text-sm text-secondary-400">Total Value</div>
                    <div className="text-white">${company.total_deal_value.toLocaleString()}</div>
                  </div>
                </div>
              )}
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
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-secondary-400 hover:text-white'
          }`}
        >
          Contacts
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

export default CompanyDetail;