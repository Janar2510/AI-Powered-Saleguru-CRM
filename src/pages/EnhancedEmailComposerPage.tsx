import React, { useState } from 'react';
import EnhancedEmailComposer from '../components/emails/EnhancedEmailComposer';
import { useToastContext } from '../contexts/ToastContext';

const EnhancedEmailComposerPage: React.FC = () => {
  const { showToast } = useToastContext();
  const [isComposerOpen, setIsComposerOpen] = useState(true);

  const handleSend = async (emailData: any) => {
    try {
      // Handle email sending logic here
      console.log('Sending email:', emailData);
      
      showToast({
        title: 'Email Sent',
        description: 'Your email has been sent successfully',
        type: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      
      showToast({
        title: 'Send Failed',
        description: 'Failed to send email. Please try again.',
        type: 'error'
      });
      
      return false;
    }
  };

  const handleClose = () => {
    setIsComposerOpen(false);
    // Navigate back or to a different page
    window.history.back();
  };

  return (
    <EnhancedEmailComposer
      isOpen={isComposerOpen}
      onClose={handleClose}
      onSend={handleSend}
      initialData={null}
    />
  );
};

export default EnhancedEmailComposerPage; 