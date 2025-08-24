import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Bot, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Target, 
  User, 
  Building,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useEmailIntegration } from '../../hooks/useEmailIntegration';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  BrandCard, 
  BrandButton, 
  BrandBadge, 
  BRAND_COLORS 
} from '../../contexts/BrandDesignContext';

interface EmailIntegrationProps {
  type: 'contact' | 'deal' | 'organization';
  recordId: string;
  recordTitle: string;
  recordEmail?: string;
  primaryContact?: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

interface EmailSuggestion {
  id: string;
  type: 'follow-up' | 'proposal' | 'meeting' | 'check-in' | 'thank-you';
  title: string;
  description: string;
  icon: React.ReactNode;
  urgency: 'low' | 'medium' | 'high';
  estimatedTime: string;
  template?: string;
}

const EmailIntegration: React.FC<EmailIntegrationProps> = ({
  type,
  recordId,
  recordTitle,
  recordEmail,
  primaryContact,
  className = ''
}) => {
  const { 
    openContactEmail, 
    openDealEmail, 
    openFollowUpEmail, 
    openProposalEmail,
    openThankYouEmail,
    openMeetingEmail
  } = useEmailIntegration();
  const { showToast } = useToastContext();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // AI-powered email suggestions based on context
  const emailSuggestions: EmailSuggestion[] = [
    {
      id: 'follow-up',
      type: 'follow-up',
      title: 'Send Follow-up',
      description: 'Follow up on recent conversation',
      icon: <Clock className="w-4 h-4" />,
      urgency: 'medium',
      estimatedTime: '2 min',
      template: 'follow-up'
    },
    {
      id: 'proposal',
      type: 'proposal',
      title: 'Send Proposal',
      description: 'Share detailed proposal document',
      icon: <FileText className="w-4 h-4" />,
      urgency: 'high',
      estimatedTime: '5 min',
      template: 'proposal'
    },
    {
      id: 'meeting',
      type: 'meeting',
      title: 'Schedule Meeting',
      description: 'Invite to meeting or demo',
      icon: <Calendar className="w-4 h-4" />,
      urgency: 'medium',
      estimatedTime: '3 min',
      template: 'meeting'
    },
    {
      id: 'check-in',
      type: 'check-in',
      title: 'Quick Check-in',
      description: 'Casual relationship building',
      icon: <MessageSquare className="w-4 h-4" />,
      urgency: 'low',
      estimatedTime: '1 min',
      template: 'check-in'
    },
    {
      id: 'thank-you',
      type: 'thank-you',
      title: 'Thank You',
      description: 'Express gratitude and appreciation',
      icon: <CheckCircle className="w-4 h-4" />,
      urgency: 'low',
      estimatedTime: '2 min',
      template: 'thank-you'
    }
  ];

  const handleQuickEmail = () => {
    const emailData = {
      to: recordEmail || primaryContact?.email || '',
      subject: `Regarding ${recordTitle}`,
      body: '',
      [type === 'deal' ? 'dealId' : 'contactId']: recordId
    };

    if (type === 'deal' && primaryContact) {
      openDealEmail(recordId, emailData);
    } else if (type === 'contact') {
      openContactEmail(recordId, emailData);
    } else {
      showToast({
        title: 'Email Integration',
        description: 'Opening email composer...',
        type: 'info'
      });
    }
  };

  const handleSuggestionClick = (suggestion: EmailSuggestion) => {
    const baseData = {
      to: recordEmail || primaryContact?.email || '',
      templateId: suggestion.template
    };

    switch (suggestion.type) {
      case 'follow-up':
        if (type === 'deal') {
          openFollowUpEmail(primaryContact?.id || '', recordId);
        } else {
          openFollowUpEmail(recordId);
        }
        break;
      case 'proposal':
        if (type === 'deal' && primaryContact) {
          openProposalEmail(recordId, primaryContact.id);
        }
        break;
      case 'thank-you':
        if (type === 'deal') {
          openThankYouEmail(primaryContact?.id || '', recordId);
        } else {
          openThankYouEmail(recordId);
        }
        break;
      case 'meeting':
        openMeetingEmail(primaryContact?.id || recordId, { 
          title: `Meeting about ${recordTitle}`,
          priority: suggestion.urgency 
        });
        break;
      default:
        handleQuickEmail();
    }

    setShowSuggestions(false);
    showToast({
      title: 'Email Composer',
      description: `Opening ${suggestion.title.toLowerCase()}...`,
      type: 'info'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-[#ef4444]';
      case 'medium': return 'text-[#f59e0b]';
      case 'low': return 'text-[#43e7ad]';
      default: return 'text-[#b0b0d0]';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'deal': return <Target className="w-4 h-4" />;
      case 'contact': return <User className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const recipientEmail = recordEmail || primaryContact?.email;

  if (!recipientEmail) {
    return (
      <div className={`${className}`}>
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
            <span className="text-sm text-[#ef4444]">No email address available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-2xl shadow-sm">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                {getTypeIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-white">Email Integration</h3>
                <p className="text-xs text-[#b0b0d0]">Send emails related to {recordTitle}</p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              <Mail className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>

          {/* Recipient Info */}
          <div className="bg-[#23233a]/40 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#43e7ad]" />
              <span className="text-sm text-white font-medium">
                {primaryContact?.name || recordTitle}
              </span>
              <span className="text-xs text-[#b0b0d0]">•</span>
              <span className="text-xs text-[#b0b0d0]">{recipientEmail}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Button
                variant="gradient"
                size="sm"
                icon={Send}
                onClick={handleQuickEmail}
                className="flex-1"
              >
                Compose Email
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Bot}
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="px-3"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>

            {/* AI Suggestions */}
            {showSuggestions && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-[#a259ff]" />
                  <span className="text-sm font-medium text-white">AI Suggestions</span>
                </div>
                
                {emailSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left bg-[#23233a]/40 hover:bg-[#23233a]/60 border border-[#23233a]/50 hover:border-[#a259ff]/30 rounded-xl p-3 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {suggestion.icon}
                        <span className="text-sm font-medium text-white">{suggestion.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${getUrgencyColor(suggestion.urgency)}`}>
                          {suggestion.urgency}
                        </span>
                        <span className="text-xs text-[#b0b0d0]">{suggestion.estimatedTime}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#b0b0d0]">{suggestion.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Email Activity */}
          <div className="mt-4 pt-4 border-t border-[#23233a]/30">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Recent Activity
            </h4>
            <div className="space-y-2">
              <div className="text-xs text-[#b0b0d0] bg-[#23233a]/40 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <span>Last email sent</span>
                  <span>2 days ago</span>
                </div>
              </div>
              <div className="text-xs text-[#b0b0d0] bg-[#23233a]/40 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <span>Response rate</span>
                  <span className="text-[#43e7ad]">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailIntegration;
