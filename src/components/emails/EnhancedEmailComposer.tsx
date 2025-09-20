import React from 'react';
import OutlookEmailComposer from './OutlookEmailComposer';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: any) => Promise<boolean>;
  reply?: any;
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

const EnhancedEmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  onSend,
  reply,
  initialData
}) => {
  // Use the new Outlook-style composer with all the advanced features
  return (
    <OutlookEmailComposer
      isOpen={isOpen}
      onClose={onClose}
      onSend={onSend}
      replyToEmail={reply}
      initialTo={initialData?.to}
      initialSubject={initialData?.subject}
      dealId={initialData?.dealId}
      contactId={initialData?.contactId}
    />
  );
};

export default EnhancedEmailComposer; 


