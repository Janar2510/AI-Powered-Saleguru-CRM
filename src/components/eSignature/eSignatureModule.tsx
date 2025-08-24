import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Eye, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  User,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  PenTool,
  Move,
  Trash2,
  Plus,
  Save,
  Share2,
  Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import DocumentPreview from './DocumentPreview';

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'date' | 'text' | 'checkbox';
  label: string;
  required: boolean;
  signer: 'internal' | 'customer';
  value?: string;
  signed?: boolean;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'nda' | 'quote' | 'invoice' | 'sales_order';
  file_url: string;
  status: 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';
  created_at: string;
  expires_at?: string;
  internal_signer?: string;
  customer_signer?: string;
  signature_fields: SignatureField[];
  related_order_id?: string;
  related_deal_id?: string;
  related_contract_id?: string;
}

interface Signer {
  id: string;
  name: string;
  email: string;
  role: 'internal' | 'customer';
  company?: string;
  phone?: string;
}

const ESignatureModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [currentSigner, setCurrentSigner] = useState<Signer | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentData, setDocumentData] = useState({
    name: '',
    type: 'contract' as const,
    expires_at: '',
    internal_signer: '',
    customer_signer: '',
    notes: ''
  });
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents on component mount
  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      showToast({ title: 'Error loading documents', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) throw error;

      const fileUrl = `${supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl}`;
      
      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          type: documentData.type,
          file_url: fileUrl,
          status: 'draft',
          expires_at: documentData.expires_at || null,
          internal_signer: documentData.internal_signer,
          customer_signer: documentData.customer_signer,
          signature_fields: [],
          notes: documentData.notes
        })
        .select()
        .single();

      if (docError) throw docError;

      showToast({ title: 'Document uploaded successfully', type: 'success' });
      setShowUploadModal(false);
      setUploadedFile(null);
      setDocumentData({
        name: '',
        type: 'contract',
        expires_at: '',
        internal_signer: '',
        customer_signer: '',
        notes: ''
      });
      loadDocuments();
    } catch (error) {
      showToast({ title: 'Error uploading document', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const addSignatureField = (field: Omit<SignatureField, 'id'>) => {
    const newField: SignatureField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setSignatureFields([...signatureFields, newField]);
  };

  const updateSignatureField = (id: string, updates: Partial<SignatureField>) => {
    setSignatureFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeSignatureField = (id: string) => {
    setSignatureFields(prev => prev.filter(field => field.id !== id));
  };

  const saveSignatureFields = async () => {
    if (!selectedDocument) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ signature_fields: signatureFields })
        .eq('id', selectedDocument.id);

      if (error) throw error;

      showToast({ title: 'Signature fields saved', type: 'success' });
      loadDocuments();
    } catch (error) {
      showToast({ title: 'Error saving signature fields', type: 'error' });
    }
  };

  const sendForSignature = async () => {
    if (!selectedDocument) return;

    setIsSigning(true);
    try {
      // Update document status to pending
      const { error } = await supabase
        .from('documents')
        .update({ status: 'pending' })
        .eq('id', selectedDocument.id);

      if (error) throw error;

      // Send email notifications (simulated)
      showToast({ title: 'Document sent for signature', type: 'success' });
      loadDocuments();
    } catch (error) {
      showToast({ title: 'Error sending document', type: 'error' });
    } finally {
      setIsSigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'secondary';
      case 'expired': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return FileText;
      case 'nda': return AlertTriangle;
      case 'quote': return Building;
      case 'invoice': return Download;
      case 'sales_order': return CheckCircle;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            eSignature Management
          </h1>
          <p className="text-[#b0b0d0]">
            Upload, sign, and manage documents with electronic signatures
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#23233a]/30 rounded-lg p-1">
        {[
          { id: 'documents', label: 'Documents', icon: FileText },
                     { id: 'signatures', label: 'Signatures', icon: PenTool },
          { id: 'templates', label: 'Templates', icon: Save },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Filters */}
          <div className="flex items-center space-x-4">
            <span className="text-[#b0b0d0]">Filter by:</span>
            <div className="flex space-x-2">
              {['all', 'draft', 'pending', 'signed', 'expired'].map((status) => (
                <button
                  key={status}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    status === 'all'
                      ? 'bg-[#a259ff] text-white'
                      : 'bg-[#23233a]/50 text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => {
              const Icon = getDocumentTypeIcon(document.type);
              return (
                <Card key={document.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="relative">
                    {/* Document Preview */}
                    <div className="h-48 bg-gradient-to-br from-[#a259ff]/20 to-[#764ba2]/20 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Icon className="w-12 h-12 text-[#a259ff] mx-auto mb-2" />
                        <h3 className="text-white font-medium">{document.name}</h3>
                        <Badge variant={getStatusColor(document.status) as any} size="sm" className="mt-2">
                          {document.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">{document.name}</h3>
                        <Badge variant={getStatusColor(document.status) as any} size="sm">
                          {document.status}
                        </Badge>
                      </div>
                      
                      <p className="text-[#b0b0d0] text-sm">
                        {document.type.replace('_', ' ')} • {new Date(document.created_at).toLocaleDateString()}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedDocument(document);
                            setSignatureFields(document.signature_fields || []);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="primary" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowSignatureModal(true);
                          }}
                          disabled={document.status === 'signed'}
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          Sign
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Signatures Tab */}
      {activeTab === 'signatures' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Signature Management</h2>
          <Card>
            <div className="p-6">
              <p className="text-[#b0b0d0]">Signature templates and management will be implemented here.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Document Templates</h2>
          <Card>
            <div className="p-6">
              <p className="text-[#b0b0d0]">Document templates will be implemented here.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">eSignature Settings</h2>
          <Card>
            <div className="p-6">
              <p className="text-[#b0b0d0]">eSignature settings will be implemented here.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Document Name</label>
                <input
                  type="text"
                  value={documentData.name}
                  onChange={(e) => setDocumentData({...documentData, name: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                  placeholder="Document name"
                />
              </div>

              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Document Type</label>
                <select
                  value={documentData.type}
                  onChange={(e) => setDocumentData({...documentData, type: e.target.value as any})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                >
                  <option value="contract">Contract</option>
                  <option value="nda">NDA</option>
                  <option value="quote">Quote</option>
                  <option value="invoice">Invoice</option>
                  <option value="sales_order">Sales Order</option>
                </select>
              </div>

              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Expires At</label>
                <input
                  type="date"
                  value={documentData.expires_at}
                  onChange={(e) => setDocumentData({...documentData, expires_at: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Notes</label>
                <textarea
                  value={documentData.notes}
                  onChange={(e) => setDocumentData({...documentData, notes: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => uploadedFile && handleFileUpload(uploadedFile)}
                disabled={!uploadedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Sign Document: {selectedDocument.name}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Preview */}
              <div>
                <h4 className="text-white font-medium mb-3">Document Preview</h4>
                <div className="bg-white rounded-lg p-4 border border-[#23233a]/30">
                  <DocumentPreview 
                    document={selectedDocument}
                    signatureFields={signatureFields}
                    onFieldUpdate={updateSignatureField}
                  />
                </div>
              </div>

              {/* Signature Tools */}
              <div>
                <h4 className="text-white font-medium mb-3">Signature Tools</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Add Signature Field</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => addSignatureField({
                          x: 100,
                          y: 100,
                          width: 200,
                          height: 50,
                          type: 'signature',
                          label: 'Signature',
                          required: true,
                          signer: 'internal'
                        })}
                      >
                                                 <PenTool className="w-4 h-4 mr-2" />
                         Signature
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => addSignatureField({
                          x: 100,
                          y: 150,
                          width: 150,
                          height: 30,
                          type: 'date',
                          label: 'Date',
                          required: true,
                          signer: 'internal'
                        })}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Date
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Signature Fields</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {signatureFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-2 bg-[#23233a]/30 rounded">
                          <div>
                            <span className="text-white text-sm">{field.label}</span>
                            <span className="text-[#b0b0d0] text-xs ml-2">({field.signer})</span>
                          </div>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeSignatureField(field.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-[#23233a]/30">
                    <Button variant="secondary" onClick={() => setShowSignatureModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={saveSignatureFields}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Fields
                    </Button>
                    <Button variant="primary" onClick={sendForSignature}>
                      <Send className="w-4 h-4 mr-2" />
                      Send for Signature
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESignatureModule; 