import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import Container from '../layout/Container';
import Spline from '@splinetool/react-spline';
import { useDocuments } from '../../hooks/useDocuments';
import { useTemplates } from '../../hooks/useTemplates';
import { useBranding } from '../../hooks/useBranding';
import { 
  FileText, 
  Download, 
  Save, 
  Bot, 
  Plus, 
  Eye, 
  Settings,
  Upload,
  Palette,
  Image as ImageIcon,
  Trash2,
  Copy,
  Share2,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Calendar,
  CheckSquare
} from 'lucide-react';

// Quick Action Button Component matching dashboard design
const QuickActionButton: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  gradient: string;
  className?: string;
}> = ({ icon: Icon, label, onClick, gradient, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`${gradient} p-4 rounded-xl text-white w-full min-h-[72px] flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span className="font-medium text-base md:text-lg lg:text-xl">{label}</span>
    </button>
  );
};

const DocumentTemplateSelector: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'branding' | 'settings'>('templates');
  const [aiLoading, setAiLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Custom hooks
  const { 
    documents, 
    loading: documentsLoading, 
    saving, 
    createDocument, 
    updateDocument, 
    deleteDocument 
  } = useDocuments();

  const { 
    templates, 
    loading: templatesLoading, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate 
  } = useTemplates();

  const { 
    brandSettings, 
    loading: brandingLoading, 
    saving: brandingSaving, 
    uploadLogo, 
    removeLogo, 
    updateBrandSettings 
  } = useBranding();

  const editor = useEditor({
    extensions: [StarterKit],
    content: selectedDocument?.content || '<h1>Document Builder</h1><p>Start creating your document...</p>',
    onUpdate: ({ editor }) => {
      if (selectedDocument) {
        setSelectedDocument({
          ...selectedDocument,
          content: editor.getHTML()
        });
      }
    }
  });

  // Update editor content when document changes
  useEffect(() => {
    if (selectedDocument && editor) {
      editor.commands.setContent(selectedDocument.content);
    }
  }, [selectedDocument, editor]);

  const handleAIAssist = async () => {
    if (!editor) return;
    
    setAiLoading(true);
    try {
      const { generateDocumentContent } = await import('../../lib/ai');
      
      const request = {
        documentType: selectedDocument?.type || 'invoice',
        context: editor.getText(),
        customerInfo: {
          name: 'Customer Name',
          email: 'customer@example.com',
          address: 'Customer Address'
        },
        items: [
          {
            description: 'Sample Item',
            quantity: 1,
            price: 100
          }
        ],
        totalAmount: 100
      };
      
      const response = await generateDocumentContent(request);
      editor.commands.insertContent(response.content);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedDocument || !editor) return;
    
    try {
      await updateDocument(selectedDocument.id, {
        content: editor.getHTML(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleCreateDocument = async (type: 'invoice' | 'proforma' | 'receipt' | 'quote') => {
    try {
      const newDoc = {
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: `<h1>New ${type.charAt(0).toUpperCase() + type.slice(1)}</h1><p>Start editing...</p>`,
        format: 'html' as const,
        status: 'draft' as const
      };

      const createdDoc = await createDocument(newDoc);
      setSelectedDocument(createdDoc);
      setActiveTab('builder');
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const newDoc = {
        type: template.type,
        title: `New ${template.name}`,
        content: template.content,
        format: 'html' as const,
        status: 'draft' as const
      };

      const createdDoc = await createDocument(newDoc);
      setSelectedDocument(createdDoc);
      setActiveTab('builder');
    } catch (error) {
      console.error('Error creating document from template:', error);
    }
  };

  const handleExportDocument = async (format: 'pdf' | 'docx' | 'html') => {
    if (!selectedDocument) return;
    
    setExporting(true);
    try {
      // Call the Edge Function for document generation
      const response = await fetch('/api/generateDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: selectedDocument.content,
          format,
          documentId: selectedDocument.id,
          userId: (await import('../../services/supabase')).supabase.auth.getUser().then(r => r.data.user?.id)
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDocument.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback to HTML download
      const blob = new Blob([selectedDocument.content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDocument.title}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setExporting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await uploadLogo(file);
    } catch (error) {
      console.error('Failed to upload logo:', error);
    }
  };

  const quickActions = [
    { 
      icon: FileText, 
      label: 'New Invoice', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: () => handleCreateDocument('invoice')
    },
    { 
      icon: FileText, 
      label: 'New Pro Forma', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: () => handleCreateDocument('proforma')
    },
    { 
      icon: FileText, 
      label: 'New Receipt', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: () => handleCreateDocument('receipt')
    },
    { 
      icon: FileText, 
      label: 'New Quote', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: () => handleCreateDocument('quote')
    },
  ];

  return (
    <Container>
      <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
        {/* Spline Background - Same as Dashboard */}
        <div className="fixed inset-0 z-0">
          <Spline
            scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        
        {/* Gradient Overlay - Same as Dashboard */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Document Builder</h1>
                  <p className="text-[#b0b0d0] mt-1 text-sm lg:text-base">Create and manage professional documents</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => setActiveTab('branding')}>
                  <Palette className="w-4 h-4 mr-2" />
                  Branding
                </Button>
                <Button variant="gradient" onClick={() => setActiveTab('templates')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </div>
            </div>

            {activeTab === 'templates' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <QuickActionButton
                        key={index}
                        icon={action.icon}
                        label={action.label}
                        onClick={action.action}
                        gradient={action.gradient}
                      />
                    ))}
                  </div>
                </div>

                {/* Templates Section */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                      Document Templates
                    </h3>
                    <Button 
                      variant="secondary" 
                      onClick={() => window.location.reload()}
                      disabled={templatesLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${templatesLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {templatesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
                      <p className="mt-4 text-[#b0b0d0]">Loading templates...</p>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-20 h-20 text-[#b0b0d0] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-white">No Templates Found</h3>
                      <p className="text-[#b0b0d0] mb-6">No document templates are available. Please check your database setup.</p>
                      <Button variant="gradient" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Templates
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templates.map(template => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50 hover:border-[#a259ff]/30 group">
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center mr-3">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{template.name}</h3>
                                <p className="text-sm text-[#b0b0d0] capitalize">{template.type}</p>
                                {template.is_default && (
                                  <span className="inline-block bg-[#43e7ad] text-black text-xs px-2 py-1 rounded mt-1">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <div 
                                className="text-sm text-[#b0b0d0] line-clamp-3"
                                dangerouslySetInnerHTML={{ 
                                  __html: template.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                                }}
                              />
                            </div>
                            <Button 
                              variant="gradient" 
                              className="w-full group-hover:scale-105 transition-transform"
                              onClick={() => handleCreateFromTemplate(template)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'builder' && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="secondary" 
                        onClick={handleAIAssist} 
                        disabled={aiLoading}
                        className="bg-gradient-to-r from-[#a259ff]/20 to-[#377dff]/20 border-[#a259ff]/30"
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        {aiLoading ? 'Generating...' : 'AI Assist'}
                      </Button>
                      <Button 
                        variant="gradient" 
                        onClick={handleSaveDocument}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => handleExportDocument('html')}
                        disabled={exporting}
                        className="bg-gradient-to-r from-[#43e7ad]/20 to-[#10b981]/20 border-[#43e7ad]/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export HTML
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleExportDocument('pdf')}
                        disabled={exporting}
                        className="bg-gradient-to-r from-[#377dff]/20 to-[#3b82f6]/20 border-[#377dff]/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleExportDocument('docx')}
                        disabled={exporting}
                        className="bg-gradient-to-r from-[#f59e0b]/20 to-[#d97706]/20 border-[#f59e0b]/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export DOCX
                      </Button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="bg-[#23233a]/60 backdrop-blur-sm rounded-lg border border-[#23233a]/50 p-6">
                    <EditorContent 
                      editor={editor} 
                      className="prose prose-invert max-w-none h-96 overflow-y-auto prose-headings:text-white prose-p:text-[#b0b0d0] prose-strong:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#a259ff]" />
                    Company Branding
                  </h3>
                  
                  {brandingLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a259ff] mx-auto"></div>
                      <p className="mt-2 text-[#b0b0d0]">Loading brand settings...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Company Logo</label>
                        <div className="flex items-center space-x-3">
                          {brandSettings?.logo_url && (
                            <img 
                              src={brandSettings.logo_url} 
                              alt="Logo" 
                              className="w-16 h-16 object-contain border border-[#23233a] rounded-lg bg-white p-2"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="block w-full text-sm text-[#b0b0d0] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#a259ff] file:to-[#377dff] file:text-white hover:file:from-[#8040C0] hover:file:to-[#2d5fcc]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandSettings?.primary_color || '#a259ff'}
                            onChange={(e) => updateBrandSettings({ primary_color: e.target.value })}
                            className="w-12 h-10 rounded border border-[#23233a] bg-[#23233a]"
                          />
                          <span className="text-sm text-[#b0b0d0]">{brandSettings?.primary_color || '#a259ff'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Company Name</label>
                        <input
                          type="text"
                          value={brandSettings?.company_name || ''}
                          onChange={(e) => updateBrandSettings({ company_name: e.target.value })}
                          className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white focus:border-[#a259ff] focus:ring-1 focus:ring-[#a259ff] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Email</label>
                        <input
                          type="email"
                          value={brandSettings?.email || ''}
                          onChange={(e) => updateBrandSettings({ email: e.target.value })}
                          className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white focus:border-[#a259ff] focus:ring-1 focus:ring-[#a259ff] transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-white">Address</label>
                        <textarea
                          value={brandSettings?.address || ''}
                          onChange={(e) => updateBrandSettings({ address: e.target.value })}
                          className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white focus:border-[#a259ff] focus:ring-1 focus:ring-[#a259ff] transition-colors"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DocumentTemplateSelector; 