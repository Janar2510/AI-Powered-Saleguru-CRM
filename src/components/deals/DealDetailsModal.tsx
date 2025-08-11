// All deal detail view card functions (edit, save, delete, update, etc.) are implemented and connected.
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Edit, Trash2, Target, CheckSquare, User, Bot, MessageSquare, Mail, FolderOpen, DollarSign, TrendingUp, Check, Save, ArrowRight, Phone, Globe, Tag, Building, Activity, FileText, Cloud, Repeat, Briefcase, SlidersHorizontal } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import { supabase } from '../../services/supabase';

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage_id: string;
  probability: number;
  expected_close_date?: string;
  company_id?: string;
  contact_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  onDealUpdated: () => void;
  onDeleteDeal: (id: string) => void;
  stages: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({
  isOpen,
  onClose,
  deal,
  onDealUpdated,
  onDeleteDeal,
  stages,
  companies,
  contacts
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
    description: deal.description || '',
    value: deal.value,
    stage_id: deal.stage_id,
    probability: deal.probability,
    expected_close_date: deal.expected_close_date || '',
    company_id: deal.company_id || '',
    contact_id: deal.contact_id || ''
  });

  const handleInputChange = (field: string, value: any) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditDeal = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          title: editableFields.title,
          description: editableFields.description || null,
          value: editableFields.value,
          stage_id: editableFields.stage_id,
          probability: editableFields.probability,
          expected_close_date: editableFields.expected_close_date || null,
          company_id: editableFields.company_id || null,
          contact_id: editableFields.contact_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);
      
      if (error) throw error;
      
      showToast({
        type: 'success',
        title: 'Deal Updated',
        description: 'Deal information has been updated successfully'
      });
      
      setIsEditing(false);
      onDealUpdated();
    } catch (error: any) {
      console.error('Error updating deal:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        description: error.message || 'Failed to update deal information'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableFields({
      title: deal.title,
      description: deal.description || '',
      value: deal.value,
      stage_id: deal.stage_id,
      probability: deal.probability,
      expected_close_date: deal.expected_close_date || '',
      company_id: deal.company_id || '',
      contact_id: deal.contact_id || ''
    });
    setIsEditing(false);
  };

  const handleDeleteDeal = async () => {
    try {
      onDeleteDeal(deal.id);
      setShowConfirmDelete(false);
      onClose();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete deal'
      });
    }
  };

  const handleAskGuru = () => {
    openGuru();
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

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || 'Unknown Stage';
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Unknown Contact';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-primary-600" />
              <span>{isEditing ? 'Edit Deal' : 'Deal Details'}</span>
            </h3>
            <p className="text-secondary-400 text-sm mt-1">
              {isEditing ? 'Update deal information' : 'View and manage deal details'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={handleAskGuru}
                  className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-secondary-700 rounded-lg transition-colors"
                  title="Ask Guru AI"
                >
                  <Bot className="w-5 h-5" />
                </button>
                <button
                  onClick={handleEditDeal}
                  className="p-2 text-secondary-400 hover:text-blue-500 hover:bg-secondary-700 rounded-lg transition-colors"
                  title="Edit Deal"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            // Edit Form
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    value={editableFields.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Deal Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-secondary-400">$</span>
                    <input
                      type="number"
                      value={editableFields.value}
                      onChange={(e) => handleInputChange('value', parseFloat(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Stage *
                  </label>
                  <select
                    value={editableFields.stage_id}
                    onChange={(e) => handleInputChange('stage_id', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    value={editableFields.probability}
                    onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Company
                  </label>
                  <select
                    value={editableFields.company_id}
                    onChange={(e) => handleInputChange('company_id', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Contact
                  </label>
                  <select
                    value={editableFields.contact_id}
                    onChange={(e) => handleInputChange('contact_id', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={editableFields.expected_close_date}
                    onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editableFields.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-700">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-secondary-300 hover:text-white transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
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
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Deal Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h4 className="text-lg font-medium text-white">Deal Value</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    ${deal.value.toLocaleString()}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h4 className="text-lg font-medium text-white">Probability</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    {deal.probability}%
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    <h4 className="text-lg font-medium text-white">Expected Value</h4>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">
                    ${Math.round(deal.value * (deal.probability / 100)).toLocaleString()}
                  </div>
                </Card>
              </div>

              {/* Deal Details */}
              <Card className="p-6">
                <h4 className="text-lg font-medium text-white mb-4">Deal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-secondary-400">Title</label>
                    <p className="text-white font-medium">{deal.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Stage</label>
                    <p className="text-white font-medium">{getStageName(deal.stage_id)}</p>
                  </div>
                  {deal.company_id && (
                    <div>
                      <label className="text-sm text-secondary-400">Company</label>
                      <p className="text-white font-medium">{getCompanyName(deal.company_id)}</p>
                    </div>
                  )}
                  {deal.contact_id && (
                    <div>
                      <label className="text-sm text-secondary-400">Contact</label>
                      <p className="text-white font-medium">{getContactName(deal.contact_id)}</p>
                    </div>
                  )}
                  {deal.expected_close_date && (
                    <div>
                      <label className="text-sm text-secondary-400">Expected Close Date</label>
                      <p className="text-white font-medium">
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-secondary-400">Created</label>
                    <p className="text-white font-medium">{formatDateTime(deal.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Last Updated</label>
                    <p className="text-white font-medium">{formatDateTime(deal.updated_at)}</p>
                  </div>
                </div>
                {deal.description && (
                  <div className="mt-4">
                    <label className="text-sm text-secondary-400">Description</label>
                    <p className="text-white mt-1">{deal.description}</p>
                  </div>
                )}
              </Card>

              {/* Delete Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Deal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
              <p className="text-secondary-400 mb-6">
                Are you sure you want to delete this deal? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 text-secondary-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeal}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDetailsModal;