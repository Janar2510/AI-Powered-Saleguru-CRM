import React, { useState, useEffect } from 'react';
import { enhancedDocumentService } from '../../services/enhancedDocumentService';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Quote, 
  Receipt, 
  CreditCard, 
  Plus,
  Eye,
  Download,
  CheckCircle
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'quote' | 'invoice' | 'proforma' | 'receipt';
  description: string;
  preview: string;
  isDefault: boolean;
}

interface TemplateChooserProps {
  onTemplateSelected?: (template: Template) => void;
  onUseTemplate?: (template: Template) => void;
  className?: string;
}

const TemplateChooser: React.FC<TemplateChooserProps> = ({ 
  onTemplateSelected,
  onUseTemplate,
  className = ''
}) => {
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Define built-in templates
      const builtInTemplates: Template[] = [
        {
          id: 'quote-modern',
          name: 'Modern Quote',
          type: 'quote',
          description: 'Professional quote template with modern design',
          preview: 'Clean, professional layout with company branding',
          isDefault: true
        },
        {
          id: 'invoice-standard',
          name: 'Standard Invoice',
          type: 'invoice',
          description: 'Traditional invoice layout with payment terms',
          preview: 'Classic invoice design with clear payment instructions',
          isDefault: true
        },
        {
          id: 'proforma-advance',
          name: 'Pro Forma Invoice',
          type: 'proforma',
          description: 'Pro forma invoice for advance payments',
          preview: 'Advance payment invoice with clear terms',
          isDefault: false
        },
        {
          id: 'receipt-simple',
          name: 'Simple Receipt',
          type: 'receipt',
          description: 'Clean receipt template for completed transactions',
          preview: 'Simple receipt layout with payment confirmation',
          isDefault: false
        },
        {
          id: 'quote-premium',
          name: 'Premium Quote',
          type: 'quote',
          description: 'Premium quote template with advanced features',
          preview: 'High-end quote design with detailed sections',
          isDefault: false
        },
        {
          id: 'invoice-detailed',
          name: 'Detailed Invoice',
          type: 'invoice',
          description: 'Comprehensive invoice with itemized breakdown',
          preview: 'Detailed invoice with comprehensive itemization',
          isDefault: false
        }
      ];

      setTemplates(builtInTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load templates',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (onTemplateSelected) {
      onTemplateSelected(template);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    if (onUseTemplate) {
      onUseTemplate(template);
      return;
    }

    if (!user?.id) {
      showToast({
        title: 'Error',
        description: 'You must be logged in to create documents',
        type: 'error'
      });
      return;
    }

    try {
      const document = await enhancedDocumentService.createFromTemplate(
        template.type,
        undefined, // contactId
        undefined, // companyId
        undefined  // dealId
      );

      showToast({
        title: 'Success',
        description: `Document created from ${template.name}`,
        type: 'success'
      });

      // Navigate to document builder with the new document
      window.location.href = `/document-templates?documentId=${document.id}`;
    } catch (error) {
      console.error('Error creating document from template:', error);
      showToast({
        title: 'Error',
        description: 'Failed to create document from template',
        type: 'error'
      });
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    // This would open a preview modal or navigate to preview page
    showToast({
      title: 'Preview',
      description: `Previewing ${template.name}`,
      type: 'info'
    });
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'quote': return <Quote className="w-6 h-6 text-blue-600" />;
      case 'invoice': return <FileText className="w-6 h-6 text-green-600" />;
      case 'proforma': return <CreditCard className="w-6 h-6 text-orange-600" />;
      case 'receipt': return <Receipt className="w-6 h-6 text-purple-600" />;
      default: return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTemplateGradient = (type: string) => {
    switch (type) {
      case 'quote': return 'from-blue-500 to-blue-600';
      case 'invoice': return 'from-green-500 to-green-600';
      case 'proforma': return 'from-orange-500 to-orange-600';
      case 'receipt': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Template</h2>
          <p className="text-gray-300">Select a template to create your document</p>
        </div>
        
        {selectedTemplate && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Selected:</span>
            <span className="font-medium text-white">{selectedTemplate.name}</span>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white/5 backdrop-blur-xl rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                selectedTemplate?.id === template.id 
                  ? 'border-purple-500/50 shadow-lg' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Header */}
              <div className={`p-6 bg-gradient-to-r ${getTemplateGradient(template.type)} rounded-t-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTemplateIcon(template.type)}
                    <div>
                      <h3 className="text-white font-semibold">{template.name}</h3>
                      <p className="text-blue-100 text-sm capitalize">{template.type}</p>
                    </div>
                  </div>
                  {template.isDefault && (
                    <div className="bg-white/20 px-2 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Template Content */}
              <div className="p-6">
                <p className="text-gray-300 mb-4">{template.description}</p>
                <p className="text-sm text-gray-400 mb-4">{template.preview}</p>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-lg hover:from-purple-700/80 hover:to-indigo-700/80 transition-colors backdrop-blur-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Template Actions */}
      {selectedTemplate && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Ready to create: {selectedTemplate.name}
              </h3>
              <p className="text-gray-300 mt-1">
                This template will be used to create your new {selectedTemplate.type}
              </p>
            </div>
            <button
              onClick={() => handleUseTemplate(selectedTemplate)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-lg hover:from-purple-700/80 hover:to-indigo-700/80 transition-colors font-medium backdrop-blur-sm"
            >
              Create Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateChooser;
