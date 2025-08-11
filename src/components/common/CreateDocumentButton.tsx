import React, { useState } from 'react';
import { enhancedDocumentService } from '../../services/enhancedDocumentService';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Quote, 
  Receipt, 
  CreditCard, 
  Plus,
  ChevronDown
} from 'lucide-react';

interface CreateDocumentButtonProps {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  contactName?: string;
  companyName?: string;
  dealName?: string;
  className?: string;
}

const CreateDocumentButton: React.FC<CreateDocumentButtonProps> = ({
  contactId,
  companyId,
  dealId,
  contactName,
  companyName,
  dealName,
  className = ''
}) => {
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateDocument = async (type: 'quote' | 'invoice' | 'proforma' | 'receipt') => {
    if (!user?.id) {
      showToast({
        title: 'Error',
        description: 'You must be logged in to create documents',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const document = await enhancedDocumentService.createFromTemplate(
        type,
        contactId,
        companyId,
        dealId
      );

      showToast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
        type: 'success'
      });

      // Navigate to document builder
      window.location.href = `/document-templates?documentId=${document.id}`;
    } catch (error) {
      console.error('Error creating document:', error);
      showToast({
        title: 'Error',
        description: 'Failed to create document',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const getButtonText = () => {
    if (contactName) return `Create for ${contactName}`;
    if (companyName) return `Create for ${companyName}`;
    if (dealName) return `Create for ${dealName}`;
    return 'Create Document';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        <span>{loading ? 'Creating...' : getButtonText()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
              Create Document
            </div>
            
            <button
              onClick={() => handleCreateDocument('quote')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 rounded-md transition-colors"
            >
              <Quote className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Quote</div>
                <div className="text-xs text-gray-500">Professional quote</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateDocument('invoice')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-green-50 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Invoice</div>
                <div className="text-xs text-gray-500">Payment request</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateDocument('proforma')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-orange-50 rounded-md transition-colors"
            >
              <CreditCard className="w-4 h-4 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">Pro Forma</div>
                <div className="text-xs text-gray-500">Advance payment</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateDocument('receipt')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-purple-50 rounded-md transition-colors"
            >
              <Receipt className="w-4 h-4 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Receipt</div>
                <div className="text-xs text-gray-500">Payment confirmation</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CreateDocumentButton;
