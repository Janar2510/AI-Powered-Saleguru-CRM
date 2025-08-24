import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Paperclip,
  Save,
  X,
  Bot,
  Sparkles,
  Calendar,
  Clock,
  Users,
  FileText,
  Zap,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Smile,
  Type,
  Palette,
  MoreHorizontal,
  Eye,
  Settings,
  Search,
  Star,
  Flag,
  Archive,
  Trash2,
  Reply,
  Forward,
  RotateCcw,
  Volume2,
  Mic,
  Video,
  Download,
  Upload,
  Target,
  Building,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Wand2,
  Brain,
  PenTool,
  Languages,
  Gauge
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput,
  BRAND_COLORS
} from '../../contexts/BrandDesignContext';
import SmartCalendarIntegration from './SmartCalendarIntegration';
import EmailAutomationSystem from './EmailAutomationSystem';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  tags: string[];
  usage: number;
  lastUsed?: string;
}

interface ContactSuggestion {
  id: string;
  name: string;
  email: string;
  type: 'contact' | 'lead' | 'customer';
  company?: string;
  lastContact?: string;
  dealValue?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: string[];
  type: 'meeting' | 'call' | 'demo' | 'followup';
}

interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  type: 'send_delay' | 'follow_up' | 'sequence' | 'schedule';
  icon: React.ReactNode;
  enabled: boolean;
}

interface AIWritingSuggestion {
  id: string;
  type: 'tone' | 'content' | 'subject' | 'grammar' | 'template';
  title: string;
  suggestion: string;
  confidence: number;
  category: string;
}

interface OutlookEmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: any) => Promise<boolean>;
  initialTo?: string;
  initialSubject?: string;
  replyToEmail?: any;
  dealId?: string;
  contactId?: string;
}

const OutlookEmailComposer: React.FC<OutlookEmailComposerProps> = ({
  isOpen,
  onClose,
  onSend,
  initialTo = '',
  initialSubject = '',
  replyToEmail,
  dealId,
  contactId
}) => {
  // State management
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [scheduled, setScheduled] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // AI and Smart Features
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AIWritingSuggestion[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);
  const [contactSuggestions, setContactSuggestions] = useState<ContactSuggestion[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  
  // Text formatting
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock data
  const emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Follow-up After Meeting',
      subject: 'Thank you for our meeting today',
      content: 'Hi {{name}},\n\nThank you for taking the time to meet with me today. I enjoyed our discussion about {{topic}}.\n\nAs promised, I\'m attaching {{attachment}} for your review. Please let me know if you have any questions.\n\nLooking forward to our next steps.\n\nBest regards,\n{{signature}}',
      category: 'Follow-up',
      tags: ['meeting', 'follow-up', 'professional'],
      usage: 156,
      lastUsed: '2024-01-19'
    },
    {
      id: '2',
      name: 'Sales Proposal',
      subject: 'Proposal for {{company}} - {{solution}}',
      content: 'Dear {{name}},\n\nI hope this email finds you well. Following our recent conversation, I\'m excited to present our solution for {{company}}.\n\nOur proposed {{solution}} will help you:\n• {{benefit_1}}\n• {{benefit_2}}\n• {{benefit_3}}\n\nI\'ve attached a detailed proposal for your review. I\'d love to schedule a call to discuss this further.\n\nBest regards,\n{{signature}}',
      category: 'Sales',
      tags: ['proposal', 'sales', 'business'],
      usage: 89,
      lastUsed: '2024-01-18'
    },
    {
      id: '3',
      name: 'Demo Invitation',
      subject: 'Let\'s schedule a demo of {{product}}',
      content: 'Hi {{name}},\n\nI\'d love to show you how {{product}} can transform your {{business_area}}.\n\nOur demo will cover:\n• Key features and benefits\n• Custom solutions for {{company}}\n• Implementation timeline\n• ROI projections\n\nAre you available for a 30-minute demo next week? I have slots available on {{available_times}}.\n\nLooking forward to hearing from you!\n\n{{signature}}',
      category: 'Demo',
      tags: ['demo', 'product', 'meeting'],
      usage: 234,
      lastUsed: '2024-01-20'
    }
  ];

  const mockContactSuggestions: ContactSuggestion[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      type: 'contact',
      company: 'Tech Corp',
      lastContact: '2024-01-15',
      dealValue: 50000
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@business.com',
      type: 'lead',
      company: 'Business Solutions',
      lastContact: '2024-01-18',
      dealValue: 25000
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@startup.io',
      type: 'customer',
      company: 'Startup Inc',
      lastContact: '2024-01-20',
      dealValue: 75000
    }
  ];

  const automationTriggers: AutomationTrigger[] = [
    {
      id: '1',
      name: 'Follow-up Sequence',
      description: 'Automatically send follow-up emails after 3, 7, and 14 days',
      type: 'sequence',
      icon: <MessageSquare className="w-4 h-4" />,
      enabled: true
    },
    {
      id: '2',
      name: 'Schedule Reminder',
      description: 'Send a reminder email 1 day before scheduled meetings',
      type: 'schedule',
      icon: <Calendar className="w-4 h-4" />,
      enabled: false
    },
    {
      id: '3',
      name: 'Deal Stage Update',
      description: 'Trigger email when deal stage changes',
      type: 'follow_up',
      icon: <Target className="w-4 h-4" />,
      enabled: true
    }
  ];

  // AI Suggestions based on content
  useEffect(() => {
    if (content.length > 10) {
      generateAISuggestions();
    }
  }, [content, subject]);

  const generateAISuggestions = () => {
    const suggestions: AIWritingSuggestion[] = [
      {
        id: '1',
        type: 'tone',
        title: 'Make it more professional',
        suggestion: 'Consider using more formal language to maintain professional tone',
        confidence: 85,
        category: 'Tone'
      },
      {
        id: '2',
        type: 'content',
        title: 'Add call-to-action',
        suggestion: 'Include a clear next step or call-to-action at the end',
        confidence: 92,
        category: 'Structure'
      },
      {
        id: '3',
        type: 'subject',
        title: 'Improve subject line',
        suggestion: 'Make the subject line more specific and action-oriented',
        confidence: 78,
        category: 'Subject'
      }
    ];
    setAISuggestions(suggestions);
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const emailData = {
        to,
        cc,
        bcc,
        subject,
        content,
        priority,
        scheduled,
        attachments,
        dealId,
        contactId
      };
      
      const success = await onSend(emailData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSubject(template.subject);
    setContent(template.content);
    setShowTemplates(false);
  };

  const handleContactSelect = (contact: ContactSuggestion) => {
    if (to) {
      setTo(to + ', ' + contact.email);
    } else {
      setTo(contact.email);
    }
    setShowContactPicker(false);
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard className="w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col" borderGradient="primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-white/10">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {replyToEmail ? 'Reply' : 'Compose Email'}
              </h2>
              <p className="text-white/70">Create and send professional emails</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <BrandButton variant="secondary" size="sm" onClick={() => setShowAIAssistant(!showAIAssistant)}>
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </BrandButton>
            <BrandButton variant="secondary" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </BrandButton>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Composer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrandButton variant="purple" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Templates
                  </BrandButton>
                  <BrandButton variant="blue" size="sm" onClick={() => setShowCalendar(!showCalendar)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </BrandButton>
                  <BrandButton variant="green" size="sm" onClick={() => setShowAutomations(!showAutomations)}>
                    <Zap className="w-4 h-4 mr-2" />
                    Automations
                  </BrandButton>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="px-3 py-1 bg-black/20 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  
                  <BrandButton variant="secondary" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Draft
                  </BrandButton>
                </div>
              </div>
            </div>

            {/* Email Fields */}
            <div className="p-6 space-y-4 border-b border-white/10">
              {/* To Field */}
              <div className="flex items-center space-x-4">
                <label className="text-white/80 font-medium w-12">To:</label>
                <div className="flex-1 relative">
                  <BrandInput
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Enter recipients..."
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowContactPicker(!showContactPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {!showCc && (
                    <button
                      onClick={() => setShowCc(true)}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      onClick={() => setShowBcc(true)}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      Bcc
                    </button>
                  )}
                </div>
              </div>

              {/* Cc Field */}
              {showCc && (
                <div className="flex items-center space-x-4">
                  <label className="text-white/80 font-medium w-12">Cc:</label>
                  <div className="flex-1">
                    <BrandInput
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="Enter Cc recipients..."
                    />
                  </div>
                  <button
                    onClick={() => setShowCc(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bcc Field */}
              {showBcc && (
                <div className="flex items-center space-x-4">
                  <label className="text-white/80 font-medium w-12">Bcc:</label>
                  <div className="flex-1">
                    <BrandInput
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="Enter Bcc recipients..."
                    />
                  </div>
                  <button
                    onClick={() => setShowBcc(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Subject Field */}
              <div className="flex items-center space-x-4">
                <label className="text-white/80 font-medium w-12">Subject:</label>
                <div className="flex-1">
                  <BrandInput
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject..."
                  />
                </div>
              </div>
            </div>

            {/* Rich Text Toolbar */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-1 flex-wrap gap-2">
                <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
                  <button
                    onClick={() => formatText('bold')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => formatText('italic')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => formatText('underline')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
                  <button
                    onClick={() => formatText('justifyLeft')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => formatText('justifyCenter')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => formatText('justifyRight')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
                  <button
                    onClick={() => formatText('insertUnorderedList')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => formatText('insertOrderedList')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={insertLink}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <label className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer">
                    <Image className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <label className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div
                ref={contentRef}
                contentEditable
                className="w-full h-full min-h-[300px] p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ whiteSpace: 'pre-wrap' }}
                onInput={(e) => setContent((e.target as HTMLDivElement).innerText)}
                placeholder="Start typing your email..."
              />
              
              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white/80 font-medium mb-2">Attachments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg"
                      >
                        <FileText className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-white/60 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {scheduled && (
                    <BrandBadge variant="blue" size="sm">
                      <Clock className="w-3 h-3 mr-1" />
                      Scheduled: {new Date(scheduled).toLocaleString()}
                    </BrandBadge>
                  )}
                  {priority === 'high' && (
                    <BrandBadge variant="red" size="sm">
                      <Flag className="w-3 h-3 mr-1" />
                      High Priority
                    </BrandBadge>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <BrandButton variant="secondary" onClick={onClose}>
                    Cancel
                  </BrandButton>
                  <BrandButton
                    variant="primary"
                    onClick={handleSend}
                    disabled={isLoading || !to || !subject}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </BrandButton>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          {showAIAssistant && (
            <div className="w-80 border-l border-white/10 overflow-y-auto">
              <BrandCard className="h-full" borderGradient="purple">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                      <Bot className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">AI Writing Assistant</h3>
                      <p className="text-white/70 text-sm">Smart suggestions for better emails</p>
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div className="space-y-4">
                    <h4 className="text-white/80 font-medium">Smart Suggestions</h4>
                    {aiSuggestions.map((suggestion) => (
                      <BrandCard key={suggestion.id} className="p-4" borderGradient="accent">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-white font-medium text-sm">{suggestion.title}</h5>
                              <BrandBadge variant="info" size="sm">
                                {suggestion.confidence}%
                              </BrandBadge>
                            </div>
                            <p className="text-white/70 text-sm mb-3">{suggestion.suggestion}</p>
                            <BrandButton variant="purple" size="sm">
                              <Wand2 className="w-3 h-3 mr-1" />
                              Apply
                            </BrandButton>
                          </div>
                        </div>
                      </BrandCard>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6">
                    <h4 className="text-white/80 font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <BrandButton variant="secondary" size="sm" className="w-full justify-start">
                        <Brain className="w-4 h-4 mr-2" />
                        Improve Tone
                      </BrandButton>
                      <BrandButton variant="secondary" size="sm" className="w-full justify-start">
                        <PenTool className="w-4 h-4 mr-2" />
                        Fix Grammar
                      </BrandButton>
                      <BrandButton variant="secondary" size="sm" className="w-full justify-start">
                        <Languages className="w-4 h-4 mr-2" />
                        Translate
                      </BrandButton>
                      <BrandButton variant="secondary" size="sm" className="w-full justify-start">
                        <Gauge className="w-4 h-4 mr-2" />
                        Optimize Length
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <BrandCard className="w-full max-w-4xl max-h-[80vh] overflow-hidden" borderGradient="secondary">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Email Templates</h3>
                  <BrandButton variant="secondary" size="sm" onClick={() => setShowTemplates(false)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emailTemplates.map((template) => (
                    <BrandCard key={template.id} className="p-4 cursor-pointer" borderGradient="accent">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold">{template.name}</h4>
                          <BrandBadge variant="info" size="sm">
                            {template.usage} uses
                          </BrandBadge>
                        </div>
                        <p className="text-white/70 text-sm">Subject: {template.subject}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <BrandBadge key={tag} variant="secondary" size="sm">
                              {tag}
                            </BrandBadge>
                          ))}
                        </div>
                        <BrandButton
                          variant="purple"
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Use Template
                        </BrandButton>
                      </div>
                    </BrandCard>
                  ))}
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Contact Picker Modal */}
        {showContactPicker && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <BrandCard className="w-full max-w-2xl max-h-[70vh] overflow-hidden" borderGradient="green">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Select Contacts</h3>
                  <BrandButton variant="secondary" size="sm" onClick={() => setShowContactPicker(false)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="space-y-3">
                  {mockContactSuggestions.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{contact.name}</p>
                            <p className="text-white/70 text-sm">{contact.email}</p>
                            {contact.company && (
                              <p className="text-white/60 text-xs">{contact.company}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <BrandBadge variant={
                            contact.type === 'customer' ? 'green' : 
                            contact.type === 'lead' ? 'yellow' : 'blue'
                          } size="sm">
                            {contact.type}
                          </BrandBadge>
                          {contact.dealValue && (
                            <p className="text-white/70 text-xs mt-1">
                              ${contact.dealValue.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Calendar Integration */}
        <SmartCalendarIntegration
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          onScheduleEmail={(scheduledTime) => {
            setScheduled(scheduledTime);
            setShowCalendar(false);
          }}
          selectedDate={new Date().toISOString()}
          dealId={dealId}
          contactId={contactId}
        />

        {/* Automation System */}
        <EmailAutomationSystem
          isOpen={showAutomations}
          onClose={() => setShowAutomations(false)}
          onCreateAutomation={(automation) => {
            console.log('Creating automation:', automation);
            setShowAutomations(false);
          }}
          selectedDealId={dealId}
          selectedContactId={contactId}
        />
      </BrandCard>
    </div>
  );
};

export default OutlookEmailComposer;
