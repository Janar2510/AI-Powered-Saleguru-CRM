import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, CheckCircle, AlertTriangle, ArrowRight, Merge, User, Mail, Phone, Building, Calendar } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  lead_score: number;
  status: string;
  created_at: Date;
  last_contacted_at?: Date;
  notes?: string;
  tags?: string[];
}

interface LeadMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryLead: Lead;
  duplicateLeads: Lead[];
  onMerge: (mergedLead: Lead) => void;
}

const LeadMergeModal: React.FC<LeadMergeModalProps> = ({ 
  isOpen, 
  onClose, 
  primaryLead, 
  duplicateLeads, 
  onMerge 
}) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [mergedLead, setMergedLead] = useState<Lead>(primaryLead);
  const [selectedFields, setSelectedFields] = useState<{[key: string]: string}>({});
  const [isMerging, setIsMerging] = useState(false);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  useEffect(() => {
    if (isOpen) {
      setMergedLead(primaryLead);
      setSelectedFields({});
    }
  }, [isOpen, primaryLead]);

  const handleFieldSelection = (field: string, value: string, source: 'primary' | 'duplicate') => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: source
    }));

    setMergedLead(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMerge = async () => {
    setIsMerging(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add merged data from duplicates
      const allNotes = [primaryLead.notes, ...duplicateLeads.map(l => l.notes)].filter(Boolean).join('\n\n');
      const allTags = [...new Set([
        ...(primaryLead.tags || []),
        ...duplicateLeads.flatMap(l => l.tags || [])
      ])];
      
      const finalMergedLead = {
        ...mergedLead,
        notes: allNotes,
        tags: allTags,
        lead_score: Math.max(primaryLead.lead_score, ...duplicateLeads.map(l => l.lead_score))
      };

      onMerge(finalMergedLead);
      
      showToast({
        title: 'Leads Merged Successfully',
        description: `${duplicateLeads.length + 1} leads have been merged into one record`,
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      showToast({
        title: 'Merge Failed',
        description: 'Failed to merge leads. Please try again.',
        type: 'error'
      });
    } finally {
      setIsMerging(false);
    }
  };

  const getFieldValue = (lead: Lead, field: string) => {
    switch (field) {
      case 'name': return lead.name;
      case 'email': return lead.email;
      case 'phone': return lead.phone || '';
      case 'company': return lead.company || '';
      case 'title': return lead.title || '';
      case 'source': return lead.source;
      case 'lead_score': return lead.lead_score;
      default: return '';
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'name': return User;
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'company': return Building;
      case 'title': return User;
      case 'source': return Calendar;
      case 'lead_score': return CheckCircle;
      default: return User;
    }
  };

  const fields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'title', label: 'Title', required: false },
    { key: 'source', label: 'Source', required: false },
    { key: 'lead_score', label: 'Lead Score', required: false }
  ];

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Merge className="w-5 h-5 text-[#a259ff]" />
              <span>Merge Duplicate Leads</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Merge {duplicateLeads.length + 1} leads into a single record
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Lead */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#a259ff]" />
                <h4 className="text-lg font-semibold text-white">Primary Lead</h4>
              </div>
              
              <Card className="p-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-white">{primaryLead.name}</h5>
                    <p className="text-sm text-[#b0b0d0]">{primaryLead.email}</p>
                    {primaryLead.company && (
                      <p className="text-sm text-[#b0b0d0]">{primaryLead.company}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">
                      Score: {primaryLead.lead_score}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {primaryLead.source}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-[#b0b0d0]">
                    Created: {primaryLead.created_at.toLocaleDateString()}
                  </div>
                </div>
              </Card>
            </div>

            {/* Merge Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-5 h-5 text-[#a259ff]" />
                <h4 className="text-lg font-semibold text-white">Merge Options</h4>
              </div>
              
              <div className="space-y-4">
                {fields.map(field => {
                  const Icon = getFieldIcon(field.key);
                  const primaryValue = getFieldValue(primaryLead, field.key);
                  const duplicateValues = duplicateLeads.map(lead => getFieldValue(lead, field.key)).filter(Boolean);
                  
                  return (
                    <Card key={field.key} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-[#a259ff]" />
                          <h6 className="font-medium text-white">{field.label}</h6>
                          {field.required && (
                            <Badge variant="danger" size="sm">Required</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`${field.key}-primary`}
                              name={field.key}
                              checked={selectedFields[field.key] === 'primary' || !selectedFields[field.key]}
                              onChange={() => handleFieldSelection(field.key, primaryValue, 'primary')}
                              className="text-[#a259ff]"
                            />
                            <label htmlFor={`${field.key}-primary`} className="text-sm text-white">
                              {primaryValue || 'Not provided'}
                            </label>
                          </div>
                          
                          {duplicateValues.map((value, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`${field.key}-duplicate-${index}`}
                                name={field.key}
                                checked={selectedFields[field.key] === 'duplicate'}
                                onChange={() => handleFieldSelection(field.key, value, 'duplicate')}
                                className="text-[#a259ff]"
                              />
                              <label htmlFor={`${field.key}-duplicate-${index}`} className="text-sm text-white">
                                {value}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Duplicate Leads */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                <h4 className="text-lg font-semibold text-white">Duplicate Leads ({duplicateLeads.length})</h4>
              </div>
              
              <div className="space-y-3">
                {duplicateLeads.map((lead, index) => (
                  <Card key={lead.id} className="p-4">
                    <div className="space-y-2">
                      <div>
                        <h6 className="font-medium text-white">{lead.name}</h6>
                        <p className="text-sm text-[#b0b0d0]">{lead.email}</p>
                        {lead.company && (
                          <p className="text-sm text-[#b0b0d0]">{lead.company}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" size="sm">
                          Score: {lead.lead_score}
                        </Badge>
                        <Badge variant="warning" size="sm">
                          {lead.source}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-[#b0b0d0]">
                        Created: {lead.created_at.toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Merge Summary */}
          <div className="mt-6 p-4 bg-[#a259ff]/10 rounded-lg border border-[#a259ff]/20">
            <h5 className="font-medium text-white mb-2">Merge Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#b0b0d0]">Total Leads:</span>
                <span className="text-white ml-2 font-medium">{duplicateLeads.length + 1}</span>
              </div>
              <div>
                <span className="text-[#b0b0d0]">Primary Lead:</span>
                <span className="text-white ml-2 font-medium">{primaryLead.name}</span>
              </div>
              <div>
                <span className="text-[#b0b0d0]">Merged Score:</span>
                <span className="text-white ml-2 font-medium">{Math.max(primaryLead.lead_score, ...duplicateLeads.map(l => l.lead_score))}</span>
              </div>
              <div>
                <span className="text-[#b0b0d0]">Combined Notes:</span>
                <span className="text-white ml-2 font-medium">{[primaryLead.notes, ...duplicateLeads.map(l => l.notes)].filter(Boolean).length}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#23233a]/30">
            <div className="text-sm text-[#b0b0d0]">
              This action will merge all duplicate leads into the primary lead record
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isMerging}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                icon={Merge}
                onClick={handleMerge}
                disabled={isMerging}
              >
                {isMerging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Merging...</span>
                  </>
                ) : (
                  <span>Merge Leads</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LeadMergeModal; 