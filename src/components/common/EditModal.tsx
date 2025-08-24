import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  User, 
  Building, 
  DollarSign, 
  Tag, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  entityType: 'contact' | 'company' | 'lead' | 'deal' | 'product' | 'invoice' | 'sales_order' | 'document';
  onSave: (updatedEntity: any) => Promise<void>;
  fields?: string[];
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  entity,
  entityType,
  onSave,
  fields
}) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();
  
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      openModal();
      setFormData({ ...entity });
      setErrors({});
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal, entity]);

  const getEntityIcon = () => {
    const icons = {
      contact: User,
      company: Building,
      lead: User,
      deal: DollarSign,
      product: Tag,
      invoice: FileText,
      sales_order: FileText,
      document: FileText
    };
    return icons[entityType as keyof typeof icons] || User;
  };

  const getEntityColor = () => {
    const colors = {
      contact: 'text-blue-400',
      company: 'text-green-400',
      lead: 'text-yellow-400',
      deal: 'text-purple-400',
      product: 'text-orange-400',
      invoice: 'text-red-400',
      sales_order: 'text-indigo-400',
      document: 'text-gray-400'
    };
    return colors[entityType as keyof typeof colors] || 'text-blue-400';
  };

  const getDefaultFields = () => {
    const fieldConfigs = {
      contact: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'company', label: 'Company', type: 'text' },
        { name: 'position', label: 'Position', type: 'text' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'city', label: 'City', type: 'text' },
        { name: 'state', label: 'State', type: 'text' },
        { name: 'postal_code', label: 'Postal Code', type: 'text' },
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'website', label: 'Website', type: 'url' },
        { name: 'linkedin_url', label: 'LinkedIn', type: 'url' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ],
      company: [
        { name: 'company_name', label: 'Company Name', type: 'text', required: true },
        { name: 'contact_name', label: 'Contact Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'city', label: 'City', type: 'text' },
        { name: 'state', label: 'State', type: 'text' },
        { name: 'postal_code', label: 'Postal Code', type: 'text' },
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'industry', label: 'Industry', type: 'text' },
        { name: 'website', label: 'Website', type: 'url' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ],
      lead: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'company', label: 'Company', type: 'text' },
        { name: 'position', label: 'Position', type: 'text' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'source', label: 'Source', type: 'select', options: [
          'website', 'linkedin', 'referral', 'cold-email', 'demo-request', 'import', 'manual'
        ]},
        { name: 'industry', label: 'Industry', type: 'text' },
        { name: 'deal_value_estimate', label: 'Deal Value Estimate', type: 'number' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ],
      deal: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'value', label: 'Value', type: 'number', required: true },
        { name: 'probability', label: 'Probability (%)', type: 'number', min: 0, max: 100 },
        { name: 'expected_close_date', label: 'Expected Close Date', type: 'date' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ],
      product: [
        { name: 'name', label: 'Product Name', type: 'text', required: true },
        { name: 'sku', label: 'SKU', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'cost', label: 'Cost', type: 'number' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'inventory_count', label: 'Inventory Count', type: 'number' },
        { name: 'min_stock_level', label: 'Min Stock Level', type: 'number' },
        { name: 'max_stock_level', label: 'Max Stock Level', type: 'number' }
      ],
      invoice: [
        { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          'draft', 'sent', 'paid', 'overdue', 'cancelled'
        ]},
        { name: 'due_date', label: 'Due Date', type: 'date' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ],
      sales_order: [
        { name: 'order_number', label: 'Order Number', type: 'text', required: true },
        { name: 'total_amount', label: 'Total Amount', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          'draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
        ]},
        { name: 'order_date', label: 'Order Date', type: 'date' },
        { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ],
      document: [
        { name: 'name', label: 'Document Name', type: 'text', required: true },
        { name: 'document_type', label: 'Document Type', type: 'select', options: [
          'contract', 'agreement', 'invoice', 'proposal', 'nda', 'general'
        ]},
        { name: 'status', label: 'Status', type: 'select', options: [
          'draft', 'sent', 'signed', 'completed'
        ]},
        { name: 'content', label: 'Content', type: 'textarea' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ]
    };
    return fieldConfigs[entityType as keyof typeof fieldConfigs] || [];
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev: any) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fieldConfig = getDefaultFields();
    
    fieldConfig.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.name] && !/\S+@\S+\.\S+/.test(formData[field.name])) {
        newErrors[field.name] = 'Please enter a valid email address';
      }
      
      if (field.type === 'url' && formData[field.name] && !/^https?:\/\/.+/.test(formData[field.name])) {
        newErrors[field.name] = 'Please enter a valid URL';
      }
      
      if (field.type === 'number' && formData[field.name] && isNaN(Number(formData[field.name]))) {
        newErrors[field.name] = 'Please enter a valid number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
      showToast({
        title: 'Success',
        description: `${entityType.replace('_', ' ')} updated successfully`,
        type: 'success'
      });
      onClose();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: any) => {
    const { name, label, type, required, options, min, max } = field;
    const value = formData[name] || '';
    const error = errors[name];
    
    const commonProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(name, e.target.value),
      className: `w-full px-3 py-2 bg-[#23233a]/50 border rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500' : 'border-[#23233a]/30'
      }`
    };

    switch (type) {
      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <textarea
              {...commonProps}
              rows={4}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <select {...commonProps}>
              <option value="">Select {label.toLowerCase()}</option>
              {options?.map((option: string) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      
      case 'number':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
              {...commonProps}
              type="number"
              min={min}
              max={max}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      
      case 'date':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
              {...commonProps}
              type="date"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      
      default:
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
              {...commonProps}
              type={type}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
    }
  };

  const renderTags = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">Tags</label>
      <div className="space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button variant="secondary" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        
                 {formData.tags && formData.tags.length > 0 && (
           <div className="flex flex-wrap gap-2">
             {formData.tags.map((tag: string, index: number) => (
               <button
                 key={index}
                 onClick={() => removeTag(tag)}
                 className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#23233a]/50 text-[#b0b0d0] hover:bg-[#23233a]/70 hover:text-white transition-colors cursor-pointer"
               >
                 {tag} ×
               </button>
             ))}
           </div>
         )}
      </div>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl border border-[#23233a]/60 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-[#23233a]/50 ${getEntityColor()}`}>
              {React.createElement(getEntityIcon(), { className: "w-5 h-5" })}
            </div>
            <h2 className="text-xl font-semibold text-white">
              Edit {entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getDefaultFields().map(renderField)}
          </div>
          
          {renderTags()}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-[#23233a]/30">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditModal; 