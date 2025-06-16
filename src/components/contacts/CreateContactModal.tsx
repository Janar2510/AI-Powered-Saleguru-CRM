import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Contact, ContactFormData } from '../../types/contact';
import ContactForm from './ContactForm';
import { useToastContext } from '../../contexts/ToastContext';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (contact: Contact) => void;
  initialData?: Partial<Contact>;
  isEditing?: boolean;
}

const CreateContactModal: React.FC<CreateContactModalProps> = ({
  isOpen,
  onClose,
  onContactCreated,
  initialData,
  isEditing = false
}) => {
  const { showToast } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<Contact[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [formData, setFormData] = useState<ContactFormData | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDuplicates([]);
      setShowDuplicateWarning(false);
      setFormData(null);
    }
  }, [isOpen]);

  const handleSubmit = async (data: ContactFormData) => {
    setFormData(data);
    
    // Check for duplicates (in a real app, this would call the findDuplicates function)
    const potentialDuplicates: Contact[] = [];
    
    // Simulate finding duplicates
    if (data.email === 'john.smith@techcorp.com' || data.email === 'john@example.com') {
      potentialDuplicates.push({
        id: 'duplicate-1',
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        company: 'TechCorp Inc.',
        position: 'CTO',
        tags: ['Enterprise', 'Decision Maker'],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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

  const processSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContact = {
        id: isEditing && initialData?.id ? initialData.id : `contact-${Date.now()}`,
        ...data,
        created_at: isEditing && initialData?.created_at ? initialData.created_at : new Date(),
        updated_at: new Date()
      } as Contact;
      
      onContactCreated(newContact);
      onClose();
      
      showToast({
        title: isEditing ? 'Contact Updated' : 'Contact Created',
        description: `${newContact.name} has been ${isEditing ? 'updated' : 'added to your contacts'}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error submitting contact:', error);
      showToast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} contact`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmartLookup = () => {
    // This would be implemented in the ContactForm component
    showToast({
      title: 'Smart Lookup',
      description: 'Looking up contact information...',
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
    // In a real app, this would merge the contact data
    showToast({
      title: 'Contact Merged',
      description: 'Contact information has been merged successfully',
      type: 'success'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning */}
        {showDuplicateWarning && duplicates.length > 0 && (
          <div className="p-6 border-b border-secondary-700 bg-yellow-900/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-white">Potential Duplicate Found</h4>
                <p className="text-secondary-300 text-sm mt-1">
                  We found {duplicates.length} contact{duplicates.length > 1 ? 's' : ''} with similar information:
                </p>
                
                <div className="mt-3 space-y-3">
                  {duplicates.map((duplicate) => (
                    <div key={duplicate.id} className="p-3 bg-secondary-700 rounded-lg">
                      <div className="font-medium text-white">{duplicate.name}</div>
                      <div className="text-sm text-secondary-400 mt-1">
                        {duplicate.email} • {duplicate.company} • {duplicate.position}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleMergeDuplicate}
                    className="btn-primary"
                  >
                    Merge Contacts
                  </button>
                  <button
                    onClick={handleContinueWithDuplicate}
                    className="btn-secondary"
                  >
                    Create Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <ContactForm
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
};

export default CreateContactModal;