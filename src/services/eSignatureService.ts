import { supabase } from './supabase';

export interface Document {
  id: string;
  name: string;
  document_type: string;
  file_url?: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  content?: string;
  partner_id?: string;
  signer_email?: string;
  signer_name?: string;
  signed_at?: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SignatureField {
  id: string;
  x: number;
  y: number;
  type: 'signature' | 'date' | 'initial';
  signed_by?: string;
  signed_at?: string;
}

class ESignatureService {
  // Documents
  async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Signature Operations
  async addSignatureField(documentId: string, field: Omit<SignatureField, 'id'>): Promise<SignatureField> {
    const document = await this.getDocumentById(documentId);
    if (!document) throw new Error('Document not found');

    const newField: SignatureField = {
      id: crypto.randomUUID(),
      ...field
    };

    // For now, we'll store signature data in the content field
    const updatedContent = document.content ? document.content + '\n[SIGNATURE_FIELD_ADDED]' : '[SIGNATURE_FIELD_ADDED]';

    await this.updateDocument(documentId, {
      content: updatedContent
    });

    return newField;
  }

  async signField(documentId: string, fieldId: string, signatureData: string): Promise<void> {
    const document = await this.getDocumentById(documentId);
    if (!document) throw new Error('Document not found');

    const updatedFields = document.signature_fields?.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          signed_by: 'current_user', // This would be the actual user ID
          signed_at: new Date().toISOString()
        };
      }
      return field;
    });

    // Check if all fields are signed
    const allSigned = updatedFields?.every(field => field.signed_by);
    const newStatus = allSigned ? 'signed' : 'pending';

    await this.updateDocument(documentId, {
      signature_fields: updatedFields,
      status: newStatus
    });
  }

  async sendForSignature(documentId: string, recipientEmail: string): Promise<void> {
    await this.updateDocument(documentId, {
      status: 'pending'
    });

    // In a real implementation, this would send an email with a signing link
    console.log(`Sending document ${documentId} for signature to ${recipientEmail}`);
  }

  // Document Upload
  async uploadDocument(file: File, name: string, type: string): Promise<Document> {
    // In a real implementation, this would upload to Supabase Storage
    const filePath = `documents/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return this.createDocument({
      name,
      type,
      file_path: filePath,
      status: 'draft'
    });
  }

  // Analytics
  async getSignatureAnalytics(): Promise<{
    totalDocuments: number;
    pendingSignatures: number;
    completedSignatures: number;
    averageSigningTime: number;
  }> {
    const documents = await this.getDocuments();
    
    const totalDocuments = documents.length;
    const pendingSignatures = documents.filter(doc => doc.status === 'pending').length;
    const completedSignatures = documents.filter(doc => doc.status === 'signed').length;
    
    // Calculate average signing time (simplified)
    const signedDocs = documents.filter(doc => doc.status === 'signed');
    const averageSigningTime = signedDocs.length > 0 ? 2.5 : 0; // Mock data

    return {
      totalDocuments,
      pendingSignatures,
      completedSignatures,
      averageSigningTime
    };
  }

  // Template Management
  async createSignatureTemplate(name: string, fields: SignatureField[]): Promise<Document> {
    return this.createDocument({
      name,
      type: 'template',
      status: 'draft',
      signature_fields: fields
    });
  }

  // Bulk Operations
  async bulkSendForSignature(documentIds: string[], recipientEmail: string): Promise<void> {
    for (const documentId of documentIds) {
      await this.sendForSignature(documentId, recipientEmail);
    }
  }
}

export const eSignatureService = new ESignatureService(); 