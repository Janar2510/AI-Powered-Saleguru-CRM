import { useState, useCallback } from 'react';
import { useToastContext } from '../contexts/ToastContext';

interface EmailData {
  to?: string;
  subject?: string;
  body?: string;
  isReply?: boolean;
  originalEmail?: any;
  dealId?: string;
  contactId?: string;
  templateId?: string;
  category?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

interface UseEmailIntegrationReturn {
  isComposerOpen: boolean;
  composerData: EmailData | null;
  openEmailComposer: (data?: EmailData) => void;
  closeEmailComposer: () => void;
  openReplyComposer: (originalEmail: any) => void;
  openTemplateEmail: (templateId: string, data?: Partial<EmailData>) => void;
  openDealEmail: (dealId: string, data?: Partial<EmailData>) => void;
  openContactEmail: (contactId: string, data?: Partial<EmailData>) => void;
  openBulkEmail: (recipients: string[], data?: Partial<EmailData>) => void;
  openFollowUpEmail: (contactId: string, dealId?: string) => void;
  openProposalEmail: (dealId: string, contactId: string) => void;
  openThankYouEmail: (contactId: string, dealId?: string) => void;
  openMeetingEmail: (contactId: string, meetingData: any) => void;
  openSupportEmail: (contactId: string, issueData: any) => void;
  openMarketingEmail: (recipients: string[], campaignData: any) => void;
}

export const useEmailIntegration = (): UseEmailIntegrationReturn => {
  const { showToast } = useToastContext();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerData, setComposerData] = useState<EmailData | null>(null);
  const [emailQueue, setEmailQueue] = useState<EmailData[]>([]);

  const openEmailComposer = useCallback((data?: EmailData) => {
    try {
      // Create a safe, serializable version of the data
      const safeData = data ? {
        to: data.to,
        subject: data.subject,
        body: data.body,
        isReply: data.isReply,
        dealId: data.dealId,
        contactId: data.contactId,
        templateId: data.templateId,
        category: data.category,
        tags: data.tags,
        priority: data.priority,
        // Only include originalEmail if it's a simple object
        originalEmail: data.originalEmail && typeof data.originalEmail === 'object' && !data.originalEmail.nodeType ? {
          from: data.originalEmail.from,
          subject: data.originalEmail.subject,
          body: data.originalEmail.body,
          dealId: data.originalEmail.dealId,
          contactId: data.originalEmail.contactId
        } : undefined
      } : null;
      
      setComposerData(safeData);
      setIsComposerOpen(true);
      
      showToast({
        title: 'Email Composer',
        description: 'Opening email composer...',
        type: 'info'
      });
    } catch (error) {
      console.error('Error opening email composer:', error);
      showToast({
        title: 'Error',
        description: 'Failed to open email composer',
        type: 'error'
      });
    }
  }, [showToast]);

  const closeEmailComposer = useCallback(() => {
    setIsComposerOpen(false);
    setComposerData(null);
  }, []);

  const openReplyComposer = useCallback((originalEmail: any) => {
    const replyData: EmailData = {
      to: originalEmail.from,
      subject: `Re: ${originalEmail.subject}`,
      body: '',
      isReply: true,
      originalEmail,
      dealId: originalEmail.dealId,
      contactId: originalEmail.contactId
    };
    
    openEmailComposer(replyData);
  }, [openEmailComposer]);

  const openTemplateEmail = useCallback((templateId: string, data?: Partial<EmailData>) => {
    const templateData: EmailData = {
      ...data,
      templateId,
      subject: data?.subject || `Template: ${templateId}`,
      body: data?.body || ''
    };
    
    openEmailComposer(templateData);
  }, [openEmailComposer]);

  const openDealEmail = useCallback((dealId: string, data?: Partial<EmailData>) => {
    const dealEmailData: EmailData = {
      ...data,
      dealId,
      subject: data?.subject || 'Deal Update',
      body: data?.body || '',
      category: 'deal',
      tags: [...(data?.tags || []), 'deal']
    };
    
    openEmailComposer(dealEmailData);
  }, [openEmailComposer]);

  const openContactEmail = useCallback((contactId: string, data?: Partial<EmailData>) => {
    const contactEmailData: EmailData = {
      ...data,
      contactId,
      subject: data?.subject || 'Contact Update',
      body: data?.body || '',
      category: 'contact',
      tags: [...(data?.tags || []), 'contact']
    };
    
    openEmailComposer(contactEmailData);
  }, [openEmailComposer]);

  const openBulkEmail = useCallback((recipients: string[], data?: Partial<EmailData>) => {
    const bulkEmailData: EmailData = {
      ...data,
      to: recipients.join(', '),
      subject: data?.subject || 'Bulk Email',
      body: data?.body || '',
      category: 'bulk',
      tags: [...(data?.tags || []), 'bulk'],
      priority: 'normal'
    };
    
    openEmailComposer(bulkEmailData);
  }, [openEmailComposer]);

  const openFollowUpEmail = useCallback((contactId: string, dealId?: string) => {
    const followUpData: EmailData = {
      contactId,
      dealId,
      subject: 'Following up on our recent discussion',
      body: '',
      category: 'follow-up',
      tags: ['follow-up', 'sales'],
      priority: 'normal'
    };
    
    openEmailComposer(followUpData);
  }, [openEmailComposer]);

  const openProposalEmail = useCallback((dealId: string, contactId: string) => {
    const proposalData: EmailData = {
      dealId,
      contactId,
      subject: 'Proposal for your consideration',
      body: '',
      category: 'proposal',
      tags: ['proposal', 'sales', 'deal'],
      priority: 'high'
    };
    
    openEmailComposer(proposalData);
  }, [openEmailComposer]);

  const openThankYouEmail = useCallback((contactId: string, dealId?: string) => {
    const thankYouData: EmailData = {
      contactId,
      dealId,
      subject: 'Thank you for your business',
      body: '',
      category: 'thank-you',
      tags: ['thank-you', 'relationship'],
      priority: 'normal'
    };
    
    openEmailComposer(thankYouData);
  }, [openEmailComposer]);

  const openMeetingEmail = useCallback((contactId: string, meetingData: any) => {
    const meetingEmailData: EmailData = {
      contactId,
      subject: `Meeting: ${meetingData.title || 'Follow-up'}`,
      body: '',
      category: 'meeting',
      tags: ['meeting', 'calendar'],
      priority: meetingData.priority || 'normal'
    };
    
    openEmailComposer(meetingEmailData);
  }, [openEmailComposer]);

  const openSupportEmail = useCallback((contactId: string, issueData: any) => {
    const supportEmailData: EmailData = {
      contactId,
      subject: `Support: ${issueData.title || 'Issue Resolution'}`,
      body: '',
      category: 'support',
      tags: ['support', 'help'],
      priority: issueData.priority || 'normal'
    };
    
    openEmailComposer(supportEmailData);
  }, [openEmailComposer]);

  const openMarketingEmail = useCallback((recipients: string[], campaignData: any) => {
    const marketingEmailData: EmailData = {
      to: recipients.join(', '),
      subject: campaignData.subject || 'Marketing Update',
      body: '',
      category: 'marketing',
      tags: ['marketing', 'campaign'],
      priority: 'low'
    };
    
    openEmailComposer(marketingEmailData);
  }, [openEmailComposer]);

  return {
    isComposerOpen,
    composerData,
    openEmailComposer,
    closeEmailComposer,
    openReplyComposer,
    openTemplateEmail,
    openDealEmail,
    openContactEmail,
    openBulkEmail,
    openFollowUpEmail,
    openProposalEmail,
    openThankYouEmail,
    openMeetingEmail,
    openSupportEmail,
    openMarketingEmail
  };
}; 