import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { Company, CompanyFormData } from '../../types/company';
import CompanyForm from './CompanyForm';
import Button from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import { useModal } from '../../contexts/ModalContext';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: (company: Company) => void;
  initialData?: Partial<Company>;
  isEditing?: boolean;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onCompanyCreated,
  initialData,
  isEditing = false
}) => {
  const { showToast } = useToastContext();
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<Company[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDuplicates([]);
      setShowDuplicateWarning(false);
      setFormData(null);
    }
  }, [isOpen]);

  const handleSubmit = async (data: CompanyFormData) => {
    setFormData(data);
    
    // Check for duplicates (in a real app, this would call the findDuplicates function)
    const potentialDuplicates: Company[] = [];
    
    // Simulate finding duplicates
    if (data.name === 'TechCorp Inc.' || data.website === 'https://techcorp.com') {
      potentialDuplicates.push({
        id: 'duplicate-1',
        name: 'TechCorp Inc.',
        website: 'https://techcorp.com',
        industry: 'Technology',
        size: 'Enterprise (1000+)',
        tags: ['Enterprise', 'Software', 'B2B'],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        contact_count: 5,
        deal_count: 2,
        status: 'active'
      });
    }
    
    if (potentialDuplicates.length > 0 && !isEditing) {
      setDuplicates(potentialDuplicates);
      setShowDuplicateWarning(true);
      return;
    }
    
    await processSubmit(data);
  };

  const processSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCompany = {
        id: isEditing && initialData?.id ? initialData.id : `company-${Date.now()}`,
        ...data,
        created_at: isEditing && initialData?.created_at ? initialData.created_at : new Date(),
        updated_at: new Date(),
        contact_count: initialData?.contact_count || 0,
        deal_count: initialData?.deal_count || 0,
        total_deal_value: initialData?.total_deal_value || 0
      } as Company;
      
      onCompanyCreated(newCompany);
      onClose();
      
      showToast({
        title: isEditing ? 'Company Updated' : 'Company Created',
        description: `${newCompany.name} has been ${isEditing ? 'updated' : 'added to your companies'}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error submitting company:', error);
      showToast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} company`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmartLookup = () => {
    // This would be implemented in the CompanyForm component
    showToast({
      title: 'Smart Lookup',
      description: 'Looking up company information...',
      type: 'info'
    });
  };

  const handleContinueWithDuplicate = () => {
    if (formData) {
      processSubmit(formData);
    }
    setShowDuplicateWarning(false);
  };

  const handleMergeDuplicate = () => {
    // In a real app, this would merge the company data
    showToast({
      title: 'Company Merged',
      description: 'Company information has been merged successfully',
      type: 'success'
    });
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Company' : 'Add New Company'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning */}
        {showDuplicateWarning && duplicates.length > 0 && (
          <div className="p-6 border-b border-[#23233a]/30 bg-[#f59e0b]/10">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-[#f59e0b] mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-white">Potential Duplicate Found</h4>
                <p className="text-[#b0b0d0] text-sm mt-1">
                  We found {duplicates.length} company{duplicates.length > 1 ? 'ies' : ''} with similar information:
                </p>
                
                <div className="mt-3 space-y-3">
                  {duplicates.map((duplicate) => (
                    <div key={duplicate.id} className="p-3 bg-[#23233a]/50 rounded-lg border border-[#23233a]/30">
                      <div className="font-medium text-white">{duplicate.name}</div>
                      <div className="text-sm text-[#b0b0d0] mt-1">
                        {duplicate.website} • {duplicate.industry} • {duplicate.size}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    onClick={handleMergeDuplicate}
                    variant="gradient"
                    size="lg"
                  >
                    Merge Companies
                  </Button>
                  <Button
                    onClick={handleContinueWithDuplicate}
                    variant="secondary"
                    size="lg"
                  >
                    Create Anyway
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <CompanyForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            onSmartLookup={handleSmartLookup}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateCompanyModal;