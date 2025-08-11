import React, { useState, useEffect } from 'react';
import EnhancedDocumentBuilder from '../components/document-templates/EnhancedDocumentBuilder';
import TemplateChooser from '../components/document-templates/TemplateChooser';
import DocumentsCard from '../components/common/DocumentsCard';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import Spline from '@splinetool/react-spline';
import { useSearchParams } from 'react-router-dom';

const DocumentTemplates: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'documents' | 'branding'>('builder');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Check for documentId in URL params
  useEffect(() => {
    const documentId = searchParams.get('documentId');
    if (documentId) {
      setSelectedDocumentId(documentId);
      setActiveTab('builder');
    }
  }, [searchParams]);

  const handleTemplateSelected = (template: any) => {
    setSelectedTemplate(template);
    showToast({
      title: 'Template Selected',
      description: `Selected ${template.name} template`,
      type: 'success'
    });
  };

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setActiveTab('builder');
    showToast({
      title: 'Template Applied',
      description: `Now editing ${template.name} template`,
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
      {/* 3D Spline Background */}
      <div className="absolute inset-0 z-0">
        <Spline 
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Document Templates</h1>
            <p className="text-gray-300">Create and manage professional documents with full integration</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'builder'
                  ? 'bg-gradient-to-r from-purple-500/80 via-purple-600/80 to-indigo-700/80 text-white shadow-lg backdrop-blur-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Document Builder
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-purple-500/80 via-purple-600/80 to-indigo-700/80 text-white shadow-lg backdrop-blur-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-purple-500/80 via-purple-600/80 to-indigo-700/80 text-white shadow-lg backdrop-blur-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              My Documents
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'branding'
                  ? 'bg-gradient-to-r from-purple-500/80 via-purple-600/80 to-indigo-700/80 text-white shadow-lg backdrop-blur-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Branding
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-6 pb-8">
          {activeTab === 'builder' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              <EnhancedDocumentBuilder selectedTemplate={selectedTemplate} />
            </div>
          )}
          
          {activeTab === 'templates' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden p-8">
              <TemplateChooser 
                onTemplateSelected={handleTemplateSelected}
                onUseTemplate={handleUseTemplate}
              />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden p-8">
              <DocumentsCard title="My Documents" />
            </div>
          )}
          
          {activeTab === 'branding' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Company Branding</h2>
              <p className="text-gray-300 mb-6">Customize your company branding for all documents</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <span className="text-gray-400">Logo</span>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-lg hover:from-purple-700/80 hover:to-indigo-700/80 transition-colors backdrop-blur-sm">
                          Upload Logo
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                        <input
                          type="color"
                          className="w-full h-10 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                        <input
                          type="color"
                          className="w-full h-10 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  <div className="border border-white/10 rounded-lg p-4 min-h-[300px] bg-white/5 backdrop-blur-sm">
                    <div className="text-center text-gray-400">
                      Brand preview will appear here
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

export default DocumentTemplates; 