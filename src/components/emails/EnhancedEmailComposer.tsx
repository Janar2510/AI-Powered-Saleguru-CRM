import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Plus, Send, Paperclip, Bot, User, ChevronDown, Mail, Bell, ArrowRight, Edit, Users,
  Search, Star, Archive, Trash2, Reply, ReplyAll, Forward, MoreHorizontal,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Link, Smile, AtSign, Calendar, Clock, MapPin, Globe, FileText,
  Save, Eye, EyeOff, Lock, Unlock, Download, Upload, Share2, Copy, Check,
  AlertCircle, CheckCircle, MessageSquare, Camera, Mic, Headphones,
  Settings, Palette, Type, AlignJustify,
  Table, Minus, RotateCcw, Zap, Sparkles, Target, TrendingUp,
  BarChart3, PieChart, Activity, Inbox, Trash, Folder,
  FolderOpen, FolderPlus, Tag, Bookmark, Pin, Flag, Heart, ThumbsUp, ThumbsDown,
  MessageCircle, PhoneCall, File, FileImage, FileVideo, FileAudio, FileArchive,
  FileCode, ExternalLink, Maximize2, Minimize2, Move, Edit2, Edit3, PenTool,
  Highlighter, Eraser, Scissors, Crop, RotateCw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Grid, Columns, Rows, Layout, Sidebar, SidebarClose,
  SidebarOpen, PanelLeft, PanelRight, PanelTop, PanelBottom, Split,
  SplitSquareHorizontal, SplitSquareVertical, Square, Circle, Triangle,
  Hexagon, Octagon, Coffee, Beer, Wine, Pizza, Cake, Cookie, Apple, Banana, Grape,
  Car, Bike, Bus, Train, Plane, Ship, Rocket, Home, Building,
  Sun, Moon, Cloud, HelpCircle, Shield
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';
import Toggle from '../ui/Toggle';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuruContext } from '../../contexts/GuruContext';
import { supabase } from '../../services/supabase';
import { v4 as uuidv4 } from 'uuid';
import { BRAND } from '../../constants/theme';

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

interface Mailbox {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  unread: number;
  color: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const EnhancedEmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  onSend,
  initialData
}) => {
  const { showToast } = useToastContext();
  const { askGuru } = useGuruContext();
  const emailFormRef = useRef<HTMLFormElement>(null);
  
  // Safely handle initialData that might be null or undefined
  const safeInitialData = initialData || {};
  
  // State management
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
    trackingId: uuidv4(),
    priority: 'normal' as 'low' | 'normal' | 'high',
    category: '',
    tags: [] as string[],
    scheduledFor: null as Date | null,
    isDraft: true,
    isPrivate: false,
    requiresReadReceipt: false,
    requiresDeliveryReceipt: false
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
  
  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [showFontChooser, setShowFontChooser] = useState(false);
  const [showFontSizeChooser, setShowFontSizeChooser] = useState(false);
  const [showColorChooser, setShowColorChooser] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Mailboxes data
  const mailboxes: Mailbox[] = [
    { id: 'inbox', name: 'Inbox', icon: <Inbox className="w-4 h-4" />, count: 1247, unread: 23, color: '#a259ff' },
    { id: 'sent', name: 'Sent', icon: <Send className="w-4 h-4" />, count: 892, unread: 0, color: '#43e7ad' },
    { id: 'drafts', name: 'Drafts', icon: <FileText className="w-4 h-4" />, count: 5, unread: 0, color: '#6b7280' },
    { id: 'spam', name: 'Spam', icon: <Shield className="w-4 h-4" />, count: 12, unread: 0, color: '#ef4444' },
    { id: 'trash', name: 'Trash', icon: <Trash className="w-4 h-4" />, count: 45, unread: 0, color: '#6b7280' },
    { id: 'archive', name: 'Archive', icon: <Archive className="w-4 h-4" />, count: 234, unread: 0, color: '#f59e0b' },
    { id: 'starred', name: 'Starred', icon: <Star className="w-4 h-4" />, count: 67, unread: 0, color: '#fbbf24' },
    { id: 'important', name: 'Important', icon: <Flag className="w-4 h-4" />, count: 89, unread: 0, color: '#ef4444' },
    { id: 'follow-up', name: 'Follow-up', icon: <Clock className="w-4 h-4" />, count: 34, unread: 0, color: '#3b82f6' },
    { id: 'meetings', name: 'Meetings', icon: <Calendar className="w-4 h-4" />, count: 56, unread: 0, color: '#8b5cf6' },
    { id: 'deals', name: 'Deals', icon: <Target className="w-4 h-4" />, count: 78, unread: 0, color: '#10b981' },
    { id: 'support', name: 'Support', icon: <MessageCircle className="w-4 h-4" />, count: 23, unread: 0, color: '#f97316' }
  ];

  // AI Suggestions
  const aiSuggestions = [
    {
      id: 'professional',
      label: 'Professional Tone',
      description: 'Make the email more formal and business-like',
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'friendly',
      label: 'Friendly Tone',
      description: 'Make the email more casual and approachable',
      icon: <Smile className="w-4 h-4" />
    },
    {
      id: 'concise',
      label: 'Make Concise',
      description: 'Shorten the email while keeping key points',
      icon: <Minus className="w-4 h-4" />
    },
    {
      id: 'detailed',
      label: 'Add Details',
      description: 'Expand with more specific information',
      icon: <Plus className="w-4 h-4" />
    },
    {
      id: 'action-oriented',
      label: 'Action-Oriented',
      description: 'Add clear next steps and calls to action',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'follow-up',
      label: 'Follow-up Style',
      description: 'Format as a professional follow-up email',
      icon: <Clock className="w-4 h-4" />
    }
  ];

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
          .select('*');
        
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

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && !autoSaveTimer) {
      const timer = setTimeout(() => {
        handleSaveDraft();
      }, 30000); // Auto-save after 30 seconds of inactivity
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [isDirty, autoSaveTimer]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    try {
      // Simulate saving draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setIsDirty(false);
      showToast({
        title: 'Draft Saved',
        description: 'Your email has been saved as a draft',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to save draft',
        type: 'error'
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.to || !formData.subject) {
      setErrors({
        to: !formData.to ? 'Recipient is required' : '',
        subject: !formData.subject ? 'Subject is required' : ''
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSend(formData);
      if (success) {
        showToast({
          title: 'Email Sent',
          description: 'Your email has been sent successfully',
          type: 'success'
        });
        onClose();
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to send email',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyAiSuggestion = (suggestionId: string) => {
    // Simulate AI processing
    showToast({
      title: 'AI Processing',
      description: 'Applying AI suggestion...',
      type: 'info'
    });

    setTimeout(() => {
      let newBody = formData.body;
      
      switch (suggestionId) {
        case 'professional':
          newBody = `<p>Dear Recipient,</p>
                     <p>I hope this email finds you well. I am writing to follow up regarding our recent discussion about the project requirements.</p>
                     <p>Please find attached the documentation you requested. I have included detailed specifications as per your requirements.</p>
                     <p>Should you require any clarification or have additional questions, please do not hesitate to contact me.</p>
                     <p>Best regards,<br>Janar Kuusk<br>Sales Manager<br>SaleToru Inc.</p>`;
          break;
        case 'friendly':
          newBody = `<p>Hey there!</p>
                     <p>I hope you're having a fantastic day! 😊 I just wanted to touch base about our recent conversation.</p>
                     <p>I'm really excited about the possibility of working together on this project. Your ideas are brilliant!</p>
                     <p>Looking forward to chatting more soon!</p>
                     <p>Cheers,<br>Janar</p>`;
          break;
        case 'concise':
          newBody = `<p>Hi,</p>
                     <p>Following up on our discussion. I've attached the requested information.</p>
                     <p>Available for questions.</p>
                     <p>Best,<br>Janar</p>`;
          break;
        case 'detailed':
          newBody = `<p>Dear Recipient,</p>
                     <p>I am writing to provide you with comprehensive information regarding our recent discussion about the project requirements.</p>
                     <p>Based on our conversation, I have prepared detailed documentation that includes:</p>
                     <ul>
                       <li>Project timeline and milestones</li>
                       <li>Technical specifications and requirements</li>
                       <li>Resource allocation and team structure</li>
                       <li>Risk assessment and mitigation strategies</li>
                       <li>Budget breakdown and cost analysis</li>
                     </ul>
                     <p>Please review the attached materials and let me know if you need any clarification or have additional requirements.</p>
                     <p>Best regards,<br>Janar Kuusk<br>Sales Manager<br>SaleToru Inc.</p>`;
          break;
        case 'action-oriented':
          newBody = `<p>Hi,</p>
                     <p>Following up on our discussion about the project requirements.</p>
                     <p><strong>Next Steps:</strong></p>
                     <ol>
                       <li>Review the attached proposal by Friday</li>
                       <li>Schedule a follow-up call next week</li>
                       <li>Provide feedback on the technical specifications</li>
                     </ol>
                     <p><strong>Action Required:</strong> Please confirm your availability for a call next Tuesday at 2 PM.</p>
                     <p>Best,<br>Janar</p>`;
          break;
        case 'follow-up':
          newBody = `<p>Hi [Name],</p>
                     <p>I hope you're doing well. I wanted to follow up on our conversation from [Date] regarding [Topic].</p>
                     <p>As discussed, I've prepared the following:</p>
                     <ul>
                       <li>We discussed the implementation timeline</li>
                       <li>You requested more information about pricing</li>
                       <li>We agreed to schedule a follow-up call next week</li>
                     </ul>
                     <p>Let me know if you have any other questions!</p>`;
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
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-[#23233a]/95 backdrop-blur-md border-2 border-[#23233a]/50 rounded-xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#23233a]/30">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {safeInitialData.isReply ? 'Reply to Email' : 'Compose Email'}
            </h3>
            <p className="text-[#b0b0d0] text-xs mt-1">
              {safeInitialData.isReply ? 'Reply to the selected email' : 'Create and send a new email'}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              {isDirty && !lastSaved && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              {lastSaved && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form ref={emailFormRef} className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-72 border-r-2 border-[#23233a]/30 bg-[#23233a]/20 flex flex-col">
              {/* Mailboxes */}
              <div className="p-3 border-b-2 border-[#23233a]/30">
                <h4 className="text-xs font-medium text-[#b0b0d0] mb-2">Mailboxes</h4>
                <div className="space-y-0.5">
                  {mailboxes.map((mailbox) => (
                    <button
                      key={mailbox.id}
                      onClick={() => setSelectedMailbox(mailbox.id)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors ${
                        selectedMailbox === mailbox.id
                          ? 'bg-[#a259ff]/20 text-white'
                          : 'text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div style={{ color: mailbox.color }}>
                          {mailbox.icon}
                        </div>
                        <span className="text-xs">{mailbox.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {mailbox.unread > 0 && (
                          <Badge variant="primary" size="sm">
                            {mailbox.unread}
                          </Badge>
                        )}
                        <span className="text-xs text-[#b0b0d0]">({mailbox.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-b-2 border-[#23233a]/30">
                <h4 className="text-xs font-medium text-[#b0b0d0] mb-2">Quick Actions</h4>
                <div className="space-y-0.5">
                  <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                    <Star className="w-3 h-3" />
                    <span className="text-xs">Star Email</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                    <Flag className="w-3 h-3" />
                    <span className="text-xs">Mark Important</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">Schedule Send</span>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="p-3 flex-1">
                <h4 className="text-xs font-medium text-[#b0b0d0] mb-2">Categories</h4>
                <div className="space-y-0.5">
                  <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                    <Tag className="w-3 h-3" />
                    <span className="text-xs">Work</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                    <Tag className="w-3 h-3" />
                    <span className="text-xs">Personal</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                    <Tag className="w-3 h-3" />
                    <span className="text-xs">Urgent</span>
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="p-3 border-t-2 border-[#23233a]/30">
                <button className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white transition-colors">
                  <Settings className="w-3 h-3" />
                  <span className="text-xs">Email Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Recipients */}
              <div>
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-[#b0b0d0] w-16">To:</label>
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={formData.to}
                      onChange={(e) => handleInputChange('to', e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
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
                    className="ml-2 text-xs text-[#b0b0d0] hover:text-white px-2 py-1 rounded hover:bg-[#23233a]/50"
                  >
                    {formData.showCc ? 'Hide CC/BCC' : 'Show CC/BCC'}
                  </button>
                </div>
              </div>
              
              {/* CC/BCC Fields */}
              {formData.showCc && (
                <>
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-[#b0b0d0] w-16">CC:</label>
                    <input
                      type="text"
                      value={formData.cc}
                      onChange={(e) => handleInputChange('cc', e.target.value)}
                      placeholder="cc@example.com"
                      className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-[#b0b0d0] w-16">BCC:</label>
                    <input
                      type="text"
                      value={formData.bcc}
                      onChange={(e) => handleInputChange('bcc', e.target.value)}
                      placeholder="bcc@example.com"
                      className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    />
                  </div>
                </>
              )}
              
              {/* Subject */}
              <div className="flex items-center">
                <label className="block text-sm font-medium text-[#b0b0d0] w-16">Subject:</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  />
                  {errors.subject && (
                    <div className="absolute -bottom-5 left-0 text-xs text-red-400 flex items-center">
                      {errors.subject}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Related Records */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Related Deal */}
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-1">
                    Related Deal
                  </label>
                  <select
                    value={formData.dealId}
                    onChange={(e) => handleInputChange('dealId', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="">None</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>{deal.title}</option>
                    ))}
                  </select>
                </div>
                
                {/* Related Contact */}
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-1">
                    Related Contact
                  </label>
                  <select
                    value={formData.contactId}
                    onChange={(e) => handleInputChange('contactId', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="">None</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>{contact.name} ({contact.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">
                  Message
                </label>
                <RichTextEditor
                  content={formData.body}
                  onChange={(value) => handleInputChange('body', value)}
                  placeholder="Write your email message..."
                />
              </div>

              {/* AI Suggestions Panel */}
              {showAiSuggestions && (
                <div className="p-4 border-t-2 border-[#23233a]/30 bg-[#23233a]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-[#a259ff]" />
                      <h4 className="font-medium text-white text-sm">AI Writing Suggestions</h4>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAiSuggestions(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => applyAiSuggestion(suggestion.id)}
                        className="text-left p-2 bg-[#23233a]/40 hover:bg-[#23233a]/60 rounded-lg transition-colors border-2 border-[#23233a]/50"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {suggestion.icon}
                          <span className="font-medium text-white text-xs">{suggestion.label}</span>
                        </div>
                        <p className="text-xs text-[#b0b0d0]">{suggestion.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t-2 border-[#23233a]/30 bg-[#23233a]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                >
                  <Bot className="w-3 h-3 mr-1" />
                  AI Help
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAttachments(true)}
                >
                  <Paperclip className="w-3 h-3 mr-1" />
                  Attachments
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Templates
                </Button>
                
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-[#b0b0d0]" />
                  <span className="text-xs text-[#b0b0d0]">Janar Kuusk</span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#b0b0d0]" />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save Draft
                </Button>
                
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Modals will be added here */}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EnhancedEmailComposer; 