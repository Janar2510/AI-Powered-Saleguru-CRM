import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Send, Paperclip, Bot, User, ChevronDown, Mail, Bell, ArrowRight, Edit, Users } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import EmailAttachmentUploader from './EmailAttachmentUploader';
import EmailTemplateSelector from './EmailTemplateSelector';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: any) => Promise<boolean>;
  initialData?: {
    to?: string;
    subject?: string;
    body?: string;
    isReply?: boolean;
    originalEmail?: any;
    dealId?: string;
    contactId?: string;
  } | null;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  onSend,
  initialData
}) => {
  const { showToast } = useToastContext();
  const emailFormRef = useRef<HTMLFormElement>(null);
  
  // Safely handle initialData that might be null or undefined
  const safeInitialData = initialData || {};
  
  const [formData, setFormData] = useState({
    to: safeInitialData.to || '',
    cc: '',
    bcc: '',
    subject: safeInitialData.subject || '',
    body: safeInitialData.body || '',
    attachments: [] as File[],
    template: '',
    showCc: false,
    showBcc: false,
    dealId: safeInitialData.dealId || '',
    contactId: safeInitialData.contactId || '',
    trackingId: uuidv4()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [deals, setDeals] = useState<{id: string, title: string}[]>([]);
  const [contacts, setContacts] = useState<{id: string, name: string, email: string}[]>([]);

  // Fetch deals and contacts for linking
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('id, title')
          .order('title');
        
        if (dealsError) throw dealsError;
        
        if (dealsData) {
          setDeals(dealsData);
        }
        
        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('id, name, email')
          .order('name');
        
        if (contactsError) throw contactsError;
        
        if (contactsData) {
          setContacts(contactsData);
        }
      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };
    
    if (isOpen) {
      fetchRelatedData();
    }
  }, [isOpen]);

  // Templates
  const emailTemplates = [
    { id: '', name: 'Select a template...' },
    { id: 'follow-up', name: 'Follow-up Template' },
    { id: 'proposal', name: 'Proposal Template' },
    { id: 'thank-you', name: 'Thank You Template' }
  ];

  // AI suggestions
  const aiSuggestions = [
    { id: 'summarize', label: 'Summarize thread', description: 'Create a concise summary of the email thread' },
    { id: 'friendly', label: 'Rewrite more friendly', description: 'Make the tone warmer and more personable' },
    { id: 'shorten', label: 'Shorten response', description: 'Create a more concise version of your draft' },
    { id: 'professional', label: 'More professional', description: 'Adjust tone to be more formal and business-like' }
  ];

  // Set up auto-save
  useEffect(() => {
    if (isDirty && formData.to && formData.subject) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formData, isDirty]);

  useEffect(() => {
    if (safeInitialData.isReply && safeInitialData.originalEmail) {
      // Format original email as blockquote
      const originalEmailHtml = `
        <p>On ${new Date(safeInitialData.originalEmail.timestamp).toLocaleString()}, ${safeInitialData.originalEmail.from} wrote:</p>
        <blockquote style="border-left: 2px solid #6d28d9; padding-left: 1rem; margin-left: 0.5rem; color: #94a3b8;">
          ${safeInitialData.originalEmail.body}
        </blockquote>
        <p><br></p>
      `;
      
      setFormData(prev => ({
        ...prev,
        body: originalEmailHtml
      }));
    }
  }, [safeInitialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) return;
    
    // In a real app, these would be fetched from the database
    const templates: {[key: string]: {subject: string, body: string}} = {
      'follow-up': {
        subject: 'Following up on our recent discussion',
        body: `<p>Hi {{contact_name}},</p>
               <p>I hope this email finds you well. I wanted to follow up on our recent discussion about {{topic}}.</p>
               <p>As we discussed, here are the key points:</p>
               <ul>
                 <li>{{point_1}}</li>
                 <li>{{point_2}}</li>
                 <li>{{point_3}}</li>
               </ul>
               <p>Please let me know if you have any questions or if you'd like to schedule a follow-up call.</p>
               <p>Best regards,<br>{{user_name}}</p>`
      },
      'proposal': {
        subject: 'Proposal: {{deal_name}}',
        body: `<p>Dear {{contact_name}},</p>
               <p>Thank you for the opportunity to present this proposal for {{company_name}}.</p>
               <p>Based on our discussions, I've outlined a solution that addresses your needs:</p>
               <ul>
                 <li><strong>{{feature_1}}</strong>: {{description_1}}</li>
                 <li><strong>{{feature_2}}</strong>: {{description_2}}</li>
                 <li><strong>{{feature_3}}</strong>: {{description_3}}</li>
               </ul>
               <p>The investment for this solution would be <strong>{{price}}</strong>.</p>
               <p>I'm confident this proposal will help {{company_name}} achieve {{goal}}.</p>
               <p>Please let me know if you have any questions.</p>
               <p>Best regards,<br>{{user_name}}</p>`
      },
      'thank-you': {
        subject: 'Thank you for your time',
        body: `<p>Hi {{contact_name}},</p>
               <p>I wanted to thank you for taking the time to meet with me today to discuss {{topic}}.</p>
               <p>I found our conversation very insightful, and I'm excited about the possibility of working together.</p>
               <p>As promised, I'll send over the additional information we discussed by {{date}}.</p>
               <p>In the meantime, please don't hesitate to reach out if you have any questions.</p>
               <p>Best regards,<br>{{user_name}}</p>`
      }
    };
    
    const template = templates[templateId];
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        body: template.body
      }));
      setIsDirty(true);
    }
  };

  const handleAttachmentsChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
    setIsDirty(true);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.to.trim()) {
      newErrors.to = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.to)) {
      newErrors.to = 'Invalid email format';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Message body is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAutoSave = async () => {
    try {
      // Generate plain text version
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formData.body;
      const plainText = tempElement.textContent || tempElement.innerText || '';
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('emails')
        .upsert({
          to: formData.to,
          cc: formData.cc,
          bcc: formData.bcc,
          subject: formData.subject,
          html_body: formData.body,
          text_body: plainText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'draft',
          deal_id: formData.dealId || null,
          contact_id: formData.contactId || null,
          tracking_id: formData.trackingId
        })
        .select();
      
      if (error) {
        console.error('Error saving draft to Supabase:', error);
      }
      
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate plain text version
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formData.body;
      const plainText = tempElement.textContent || tempElement.innerText || '';
      
      // Call the send-email edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: formData.to,
          cc: formData.cc || undefined,
          bcc: formData.bcc || undefined,
          subject: formData.subject,
          html: formData.body,
          text: plainText,
          dealId: formData.dealId || undefined,
          contactId: formData.contactId || undefined,
          trackingId: formData.trackingId
        }
      });
      
      if (error) {
        throw new Error(`Error calling send-email function: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      // Call the original onSend callback
      const emailData = {
        to: formData.to,
        cc: formData.cc,
        bcc: formData.bcc,
        subject: formData.subject,
        html_body: formData.body,
        text_body: plainText,
        attachments: formData.attachments,
        sent_at: new Date(),
        status: 'sent',
        deal_id: formData.dealId,
        contact_id: formData.contactId,
        tracking_id: formData.trackingId,
        email_id: data.emailId
      };
      
      await onSend(emailData);
      
      // Reset form
      setFormData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        attachments: [],
        template: '',
        showCc: false,
        showBcc: false,
        dealId: '',
        contactId: '',
        trackingId: uuidv4()
      });
      
      setShowCompose(false);
      setReplyData(null);
      
      showToast({
        title: 'Email Sent',
        description: 'Your email has been sent successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      showToast({
        title: 'Send Failed',
        description: error instanceof Error ? error.message : 'Failed to send email. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Generate plain text version
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formData.body;
      const plainText = tempElement.textContent || tempElement.innerText || '';
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('emails')
        .upsert({
          to: formData.to,
          cc: formData.cc,
          bcc: formData.bcc,
          subject: formData.subject,
          html_body: formData.body,
          text_body: plainText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'draft',
          deal_id: formData.dealId || null,
          contact_id: formData.contactId || null,
          tracking_id: formData.trackingId,
          has_attachments: formData.attachments.length > 0
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      showToast({
        title: 'Draft Saved',
        description: 'Your email draft has been saved',
        type: 'success'
      });
      
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast({
        title: 'Save Failed',
        description: 'Failed to save draft. Please try again.',
        type: 'error'
      });
    }
  };

  const applyAiSuggestion = async (suggestionId: string) => {
    // In a real app, this would call an OpenAI API
    showToast({
      title: 'AI Processing',
      description: 'Applying AI suggestion to your email...',
      type: 'info'
    });
    
    try {
      // Call the OpenAI proxy function
      const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are an AI email assistant. You are helping a sales professional improve their email. 
              Apply the following transformation: "${suggestionId}" to the email text.
              Return only the transformed email text in HTML format, with no additional commentary.`
            },
            {
              role: 'user',
              content: formData.body
            }
          ],
          model: 'gpt-4o',
          temperature: 0.7
        }
      });
      
      if (error) throw error;
      
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const newBody = data.choices[0].message.content;
        setFormData(prev => ({ ...prev, body: newBody }));
        setShowAiSuggestions(false);
        setIsDirty(true);
        
        showToast({
          title: 'AI Suggestion Applied',
          description: 'Your email has been updated with the AI suggestion',
          type: 'success'
        });
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error applying AI suggestion:', error);
      
      // Fallback to simulated AI processing
      setTimeout(() => {
        let newBody = formData.body;
        
        switch (suggestionId) {
          case 'summarize':
            newBody = `<p>Here's a quick summary of our discussion:</p>
                     <ul>
                       <li>We discussed the implementation timeline</li>
                       <li>You requested more information about pricing</li>
                       <li>We agreed to schedule a follow-up call next week</li>
                     </ul>
                     <p>Let me know if you have any other questions!</p>`;
            break;
          case 'friendly':
            newBody = `<p>Hey there!</p>
                     <p>I hope you're having a fantastic day! 😊 I just wanted to touch base about our recent conversation.</p>
                     <p>I'm really excited about the possibility of working together on this project. Your ideas are brilliant!</p>
                     <p>Looking forward to chatting more soon!</p>
                     <p>Cheers,<br>Janar</p>`;
            break;
          case 'shorten':
            newBody = `<p>Hi,</p>
                     <p>Following up on our discussion. I've attached the requested information.</p>
                     <p>Available for questions.</p>
                     <p>Best,<br>Janar</p>`;
            break;
          case 'professional':
            newBody = `<p>Dear Recipient,</p>
                     <p>I am writing to follow up regarding our recent discussion about the project requirements.</p>
                     <p>Please find attached the documentation you requested. I have included detailed specifications as per your requirements.</p>
                     <p>Should you require any clarification or have additional questions, please do not hesitate to contact me.</p>
                     <p>Best regards,<br>Janar Kuusk<br>Sales Manager<br>SaleToru Inc.</p>`;
            break;
        }
        
        setFormData(prev => ({ ...prev, body: newBody }));
        setShowAiSuggestions(false);
        setIsDirty(true);
        
        showToast({
          title: 'AI Suggestion Applied',
          description: 'Your email has been updated with the AI suggestion',
          type: 'success'
        });
      }, 1500);
    }
  };

  const handleSelectTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
    setShowTemplateSelector(false);
    setIsDirty(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-secondary-700 bg-secondary-750">
          <h3 className="text-lg font-semibold text-white">
            {safeInitialData.isReply ? 'Reply to Email' : 'Compose Email'}
          </h3>
          <div className="flex items-center space-x-2">
            {isDirty && !lastSaved && (
              <span className="text-xs text-secondary-400">Unsaved changes</span>
            )}
            {lastSaved && (
              <span className="text-xs text-secondary-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form ref={emailFormRef} onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Recipients */}
            <div>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-secondary-300 w-16">To:</label>
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={formData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  {errors.to && (
                    <div className="absolute -bottom-5 left-0 text-xs text-red-400 flex items-center">
                      {errors.to}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, showCc: !prev.showCc }))}
                  className="ml-2 text-xs text-secondary-400 hover:text-white px-2 py-1 rounded hover:bg-secondary-700"
                >
                  {formData.showCc ? 'Hide CC/BCC' : 'Show CC/BCC'}
                </button>
              </div>
            </div>
            
            {/* CC/BCC Fields */}
            {formData.showCc && (
              <>
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-secondary-300 w-16">CC:</label>
                  <input
                    type="text"
                    value={formData.cc}
                    onChange={(e) => handleInputChange('cc', e.target.value)}
                    placeholder="cc@example.com"
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-secondary-300 w-16">BCC:</label>
                  <input
                    type="text"
                    value={formData.bcc}
                    onChange={(e) => handleInputChange('bcc', e.target.value)}
                    placeholder="bcc@example.com"
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </>
            )}
            
            {/* Subject */}
            <div className="flex items-center">
              <label className="block text-sm font-medium text-secondary-300 w-16">Subject:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                {errors.subject && (
                  <div className="absolute -bottom-5 left-0 text-xs text-red-400 flex items-center">
                    {errors.subject}
                  </div>
                )}
              </div>
            </div>
            
            {/* Related Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related Deal */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Related Deal
                </label>
                <select
                  value={formData.dealId}
                  onChange={(e) => handleInputChange('dealId', e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">None</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>{deal.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Related Contact */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Related Contact
                </label>
                <select
                  value={formData.contactId}
                  onChange={(e) => {
                    const contactId = e.target.value;
                    handleInputChange('contactId', contactId);
                    
                    // Auto-fill recipient email if contact is selected
                    if (contactId && !formData.to) {
                      const selectedContact = contacts.find(c => c.id === contactId);
                      if (selectedContact?.email) {
                        handleInputChange('to', selectedContact.email);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">None</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Template Selector */}
            <div className="flex items-center">
              <label className="block text-sm font-medium text-secondary-300 w-16">Template:</label>
              <div className="flex-1 flex space-x-2">
                <select
                  value={formData.template}
                  onChange={(e) => {
                    handleInputChange('template', e.target.value);
                    handleTemplateChange(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  {emailTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(true)}
                  className="btn-secondary text-sm"
                >
                  Browse
                </button>
              </div>
            </div>
            
            {/* Rich Text Editor */}
            <div className="relative">
              {errors.body && (
                <div className="absolute -top-5 left-0 text-xs text-red-400 flex items-center">
                  {errors.body}
                </div>
              )}
              <RichTextEditor
                content={formData.body}
                onChange={(html) => handleInputChange('body', html)}
                placeholder="Compose your email..."
                minHeight="300px"
              />
            </div>
            
            {/* Attachments */}
            <EmailAttachmentUploader
              onAttachmentsChange={handleAttachmentsChange}
              currentFiles={formData.attachments}
            />
            
            {/* AI Suggestions */}
            {showAiSuggestions && (
              <div className="mt-4 p-4 bg-primary-600/10 border border-primary-600/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-primary-400" />
                    <h4 className="font-medium text-white">AI Writing Suggestions</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiSuggestions(false)}
                    className="text-secondary-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => applyAiSuggestion(suggestion.id)}
                      className="text-left p-3 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-white">{suggestion.label}</div>
                      <p className="text-xs text-secondary-400 mt-1">{suggestion.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-secondary-700 bg-secondary-750 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                  className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <Bot className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-1 p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs">Janar Kuusk</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Save Draft
              </button>
              
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-secondary-700">
              <h3 className="text-lg font-semibold text-white">Select Template</h3>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EmailTemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplateSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;