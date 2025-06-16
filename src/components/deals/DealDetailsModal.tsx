import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Edit, Trash2, Target, CheckSquare, User, Bot, MessageSquare, Mail, FolderOpen, DollarSign, TrendingUp, Check, Save, ArrowRight, Phone, Globe, Tag, Building } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: {
    id: string;
    deal_id: string;
    title: string;
    company: string;
    value: number;
    stage: string;
    stage_id: string;
    contact: string;
    lastActivity: string;
    probability: number;
    drive_url?: string;
    created_at: Date;
    notes_count: number;
    emails_count: number;
    team_members: string[];
    priority: 'low' | 'medium' | 'high';
    next_action?: string;
    next_action_date?: string;
  };
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({
  isOpen,
  onClose,
  deal
}) => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'emails' | 'files' | 'tasks' | 'edit'>('overview');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields state
  const [editableFields, setEditableFields] = useState({
    title: deal.title,
    company: deal.company,
    contact: deal.contact,
    value: deal.value,
    stage_id: deal.stage_id,
    probability: deal.probability,
    priority: deal.priority,
    next_action: deal.next_action || '',
    next_action_date: deal.next_action_date || ''
  });

  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 border-red-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'low': return 'text-green-500 border-green-500';
      default: return 'text-secondary-400 border-secondary-400';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (startString: string, endString: string) => {
    const start = new Date(startString);
    const end = new Date(endString);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes` 
        : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const handleEditDeal = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      // Update deal in Supabase
      const { error } = await supabase
        .from('deals')
        .update({
          title: editableFields.title,
          company: editableFields.company,
          contact: editableFields.contact,
          value: editableFields.value,
          stage_id: editableFields.stage_id,
          probability: editableFields.probability,
          priority: editableFields.priority,
          next_action: editableFields.next_action || null,
          next_action_date: editableFields.next_action_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);
      
      if (error) throw error;
      
      showToast({
        type: 'success',
        title: 'Deal Updated',
        message: 'Deal information has been updated successfully'
      });
      
      setIsEditing(false);
      
      // In a real app, we would refresh the deal data here
    } catch (error) {
      console.error('Error updating deal:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update deal information'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset editable fields to original values
    setEditableFields({
      title: deal.title,
      company: deal.company,
      contact: deal.contact,
      value: deal.value,
      stage_id: deal.stage_id,
      probability: deal.probability,
      priority: deal.priority,
      next_action: deal.next_action || '',
      next_action_date: deal.next_action_date || ''
    });
    
    setIsEditing(false);
  };

  const handleDeleteDeal = async () => {
    try {
      // Delete deal from Supabase
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', deal.id);
      
      if (error) throw error;
      
      showToast({
        type: 'success',
        title: 'Deal Deleted',
        message: 'Deal has been deleted successfully'
      });
      
      onClose();
    } catch (error) {
      console.error('Error deleting deal:', error);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete deal'
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAskGuru = () => {
    openGuru();
    // In a real implementation, this would send a specific query to Guru
  };

  const handleOpenFolder = () => {
    if (deal.drive_url) {
      window.open(deal.drive_url, '_blank');
    } else {
      showToast({
        type: 'info',
        title: 'No Folder',
        message: 'This deal does not have an associated folder'
      });
    }
  };

  const stages = [
    { id: 'lead', name: 'Lead', probability: 10 },
    { id: 'qualified', name: 'Qualified', probability: 25 },
    { id: 'proposal', name: 'Proposal', probability: 50 },
    { id: 'negotiation', name: 'Negotiation', probability: 75 },
    { id: 'closed-won', name: 'Closed Won', probability: 100 },
    { id: 'closed-lost', name: 'Closed Lost', probability: 0 }
  ];

  // Sample notes for the Notes tab
  const notes = [
    {
      id: '1',
      author: 'Janar Kuusk',
      content: 'Had a great call with John today. He mentioned they are very interested in our enterprise package and will discuss with their team.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mentions: ['John Smith']
    },
    {
      id: '2',
      author: 'Sarah Wilson',
      content: 'Sent the technical specifications as requested. @Mike Chen please review the security requirements they asked about.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mentions: ['Mike Chen']
    },
    {
      id: '3',
      author: 'Janar Kuusk',
      content: 'Contract terms look good. Waiting for legal review from their side. Should hear back by Friday.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      mentions: []
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800/90 backdrop-blur-md rounded-lg w-full max-w-6xl h-[90vh] flex flex-col border border-secondary-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          {!isEditing ? (
            <>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-mono text-primary-400 bg-primary-600/10 px-2 py-1 rounded">
                      {deal.deal_id}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(deal.priority)}`}>
                      {deal.priority} priority
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{deal.title}</h3>
                  <p className="text-secondary-400">{deal.company} • {deal.contact}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAskGuru}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask Guru</span>
                </button>
                {deal.drive_url && (
                  <button
                    onClick={handleOpenFolder}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Open Folder</span>
                  </button>
                )}
                <button 
                  onClick={handleEditDeal}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Deal</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold text-white">Edit Deal</h3>
                <p className="text-secondary-400 text-sm">Update deal information</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="btn-primary flex items-center space-x-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Deal Title
                  </label>
                  <input
                    type="text"
                    value={editableFields.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editableFields.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={editableFields.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Deal Value
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="number"
                      value={editableFields.value}
                      onChange={(e) => handleInputChange('value', parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Stage
                  </label>
                  <select
                    value={editableFields.stage_id}
                    onChange={(e) => {
                      const stage = stages.find(s => s.id === e.target.value);
                      handleInputChange('stage_id', e.target.value);
                      if (stage) {
                        handleInputChange('probability', stage.probability);
                      }
                    }}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSaving}
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name} ({stage.probability}%)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Probability
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editableFields.probability}
                      onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
                      className="w-full pl-10 pr-8 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      disabled={isSaving}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={editableFields.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSaving}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Next Action
                  </label>
                  <input
                    type="text"
                    value={editableFields.next_action}
                    onChange={(e) => handleInputChange('next_action', e.target.value)}
                    placeholder="e.g., Follow up with client"
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Next Action Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="date"
                      value={editableFields.next_action_date}
                      onChange={(e) => handleInputChange('next_action_date', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-secondary-700">
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="btn-secondary text-red-400 hover:text-red-300 flex items-center space-x-2"
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Deal</span>
                </button>
                
                {showConfirmDelete && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-secondary-800 rounded-lg p-6 max-w-md">
                      <h3 className="text-lg font-semibold text-white mb-4">Confirm Deletion</h3>
                      <p className="text-secondary-300 mb-6">
                        Are you sure you want to delete this deal? This action cannot be undone.
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowConfirmDelete(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteDeal}
                          className="btn-primary bg-red-600 hover:bg-red-700"
                        >
                          Delete Deal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-secondary-400 text-sm">Deal Value</p>
                      <p className="text-xl font-bold text-white">${deal.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-secondary-400 text-sm">Probability</p>
                      <p className="text-xl font-bold text-white">{deal.probability}%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-secondary-400 text-sm">Notes</p>
                      <p className="text-xl font-bold text-white">{deal.notes_count}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-secondary-400 text-sm">Emails</p>
                      <p className="text-xl font-bold text-white">{deal.emails_count}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pipeline Progress */}
              <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-6 border border-secondary-600/50">
                <h4 className="font-semibold text-white mb-4">Pipeline Progress</h4>
                <div className="flex items-center justify-between mb-4">
                  {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'].map((stage, index) => (
                    <div key={stage} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= 2 ? ['bg-gray-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-green-500'][index] : 'bg-secondary-600'
                      }`}>
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                      </div>
                      {index < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          index < 2 ? 'bg-green-500' : 'bg-secondary-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-secondary-400">
                  {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'].map((stage) => (
                    <span key={stage} className={stage === 'Proposal' ? 'text-white font-medium' : ''}>
                      {stage}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-6 border border-secondary-600/50">
                <h4 className="font-semibold text-white mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <div className="text-sm text-secondary-400">Primary Contact</div>
                      <div className="text-white font-medium">{deal.contact}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">contact@example.com</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <div className="text-sm text-secondary-400">Company</div>
                      <div className="text-white font-medium">{deal.company}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Globe className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">www.example.com</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">Technology</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-6 border border-secondary-600/50">
                <h4 className="font-semibold text-white mb-4">Team Members</h4>
                <div className="flex flex-wrap gap-3">
                  {deal.team_members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-secondary-600/60 backdrop-blur-sm rounded-lg p-3 border border-secondary-500/50">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-white font-medium">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Action */}
              {deal.next_action && (
                <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-6 border border-secondary-600/50">
                  <h4 className="font-semibold text-white mb-4">Next Action</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{deal.next_action}</p>
                      <p className="text-secondary-400 text-sm">Due: {deal.next_action_date}</p>
                    </div>
                    <button 
                      onClick={() => {
                        showToast({
                          title: 'Action Completed',
                          description: 'Next action has been marked as complete',
                          type: 'success'
                        });
                      }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Notes */}
              <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-6 border border-secondary-600/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Recent Notes</h4>
                  <button 
                    onClick={() => setActiveTab('notes')}
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {notes.slice(0, 2).map(note => (
                    <div key={note.id} className="p-3 bg-secondary-600/60 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {note.author.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{note.author}</div>
                            <div className="text-xs text-secondary-400">
                              {note.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-secondary-200">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Guru Deal Insights</h4>
                    <p className="text-secondary-300 text-sm mt-2">
                      This deal is in the {deal.stage} stage with a {deal.probability}% probability. Based on similar deals, 
                      the next action should be to schedule a follow-up call to discuss implementation timeline.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-300">Strengths: Good engagement, multiple stakeholders involved</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-300">Risks: No activity in the last 5 days</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button 
                        onClick={handleAskGuru}
                        className="btn-primary text-sm"
                      >
                        Ask Guru for Details
                      </button>
                      <button 
                        onClick={() => {
                          showToast({
                            title: 'Next Steps',
                            description: 'Generating next steps for this deal',
                            type: 'info'
                          });
                        }}
                        className="btn-secondary text-sm"
                      >
                        Generate Next Steps
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailsModal;