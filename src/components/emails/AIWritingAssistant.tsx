import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, Zap, Brain, Lightbulb, Target, TrendingUp, BarChart3,
  MessageSquare, PhoneCall, Video, Camera, Mic, Headphones, Globe,
  MapPin, Phone, Mail, User, Users, Building, Home, Office, School,
  Hospital, Bank, Store, Park, Beach, Mountain, Forest, Desert, Island,
  Volcano, Sun, Moon, Cloud, Rain, Snow, Storm, Lightning, Rainbow,
  Tornado, Hurricane, Earthquake, Tsunami, Fire, Water, Earth, Air,
  Light, Dark, Day, Night, Sunrise, Sunset, Dawn, Dusk, Morning,
  Afternoon, Evening, Midnight, Noon, Hour, Minute, Second, Time,
  Date, Year, Month, Week, Today, Yesterday, Tomorrow, Past, Present,
  Future, History, Timeline, Schedule, Agenda, Event, Meeting, Conference,
  Workshop, Seminar, Webinar, Presentation, Demo, Pitch, Sales, Marketing,
  Support, Help, FAQ, Guide, Tutorial, Manual, Documentation, API, SDK,
  Library, Framework, Tool, Plugin, Extension, Addon, Module, Package,
  Bundle, Backup, Restore, Import, Export, Sync, Update, Upgrade, Install,
  Uninstall, Configure, Setup, Wizard, Assistant, Helper, Advisor, Consultant,
  Expert, Specialist, Professional, Master, Guru, Ninja, Rockstar, Champion,
  Hero, Legend, Icon, Celebrity, VIP, Premium, Pro, Enterprise, Business,
  Corporate, Startup, Scaleup, Unicorn, Decacorn, Hectocorn, Kilocorn,
  Success, Failure, Win, Lose, Victory, Defeat, Triumph, Loss, Achievement,
  Award, Trophy, Medal, Badge, Certificate, Diploma, Degree, License, Permit,
  Passport, ID, Card, Credit, Debit, Money, Cash, Coin, Dollar, Euro, Pound,
  Yen, Bitcoin, Crypto, Wallet, Bank, Account, Balance, Budget, Expense,
  Income, Profit, Revenue, Sales, Cost, Price, Fee, Tax, Discount, Coupon,
  Voucher, Gift, Present, Surprise, Secret, Mystery, Puzzle, Riddle, Question,
  Answer, Solution, Problem, Issue, Bug, Error, Warning, Info, Alert, Notice,
  Announcement, News, Update, Change, Modification, Revision, Version, Release,
  Beta, Alpha, Stable, Unstable, Production, Development, Testing, Staging,
  Sandbox, Demo, Preview, Prototype, Mockup, Wireframe, Design, UI, UX,
  Frontend, Backend, Fullstack, Mobile, Web, Desktop, Tablet, Phone, Smartphone,
  Laptop, Computer, Server, Cloud, Database, REST, GraphQL, SOAP, XML, JSON,
  CSV, PDF, DOC, XLS, PPT, Image, Video, Audio, Text, Binary, Code, Script,
  Program, App, Application, Software, Hardware, Device, Gadget, Tool, Instrument,
  Machine, Robot, AI, ML, Data, Analytics, Statistics, Math, Science, Technology,
  Engineering, Research, Development, Innovation, Invention, Discovery, Creation,
  Production, Manufacturing, Assembly, Construction, Building, Architecture, Art,
  Music, Film, Photo, Game, Sport, Exercise, Fitness, Health, Medical, Doctor,
  Nurse, Patient, Clinic, Pharmacy, Medicine, Drug, Pill, Injection, Surgery,
  Treatment, Therapy, Recovery, Healing, Cure, Prevention, Vaccine, Immunity,
  Disease, Virus, Bacteria, Infection, Fever, Cough, Cold, Flu, Allergy, Pain,
  Headache, Stomachache, Toothache, Backache, Sore, Bruise, Cut, Burn, Bleed,
  Swell, Rash, Itch, Scratch, Bite, Sting, Poison, Toxic, Hazard, Danger, Risk,
  Safety, Security, Protection, Shield, Armor, Helmet, Vest, Gloves, Boots, Mask,
  Goggles, Respirator, Filter, Purifier, Cleaner, Sanitizer, Disinfectant, Soap,
  Alcohol, Bleach, Detergent, Wipe, Towel, Tissue, Paper, Plastic, Metal, Wood,
  Glass, Stone, Fabric, Leather, Rubber, Silicon, Carbon, Steel, Iron, Gold,
  Silver, Bronze, Copper, Aluminum, Titanium, Platinum, Diamond, Pearl, Crystal,
  Gem, Jewel, Ring, Necklace, Bracelet, Watch, Timer, Stopwatch, Chronometer,
  Planner, Organizer, Manager, Director, CEO, CFO, CTO, COO, VP, Supervisor, Lead,
  Senior, Junior, Intern, Employee, Worker, Staff, Team, Group, Department,
  Division, Unit, Branch, Company, Corporation, Organization, Institution,
  Foundation, Association, Society, Club, Community, Network, Platform, Marketplace,
  Store, Shop, Mall, Market, Bazaar, Auction, Sale, Deal, Offer, Bid, Quote,
  Estimate, Proposal, Contract, Agreement, Partnership, Alliance, Merger,
  Acquisition, Investment, Funding, Capital, Venture
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';
import Toggle from '../ui/Toggle';
import { useGuruContext } from '../../contexts/GuruContext';
import { useToastContext } from '../../contexts/ToastContext';
import { BRAND } from '../../constants/theme';

interface AIWritingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestion: (suggestion: string) => void;
  currentEmailContent: string;
  emailContext?: {
    recipient?: string;
    subject?: string;
    contactData?: any;
    dealData?: any;
    isReply?: boolean;
  };
}

interface AISuggestion {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'tone' | 'structure' | 'content' | 'style' | 'action' | 'personalization';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in seconds
  tags: string[];
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
  tags: string[];
}

const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  isOpen,
  onClose,
  onApplySuggestion,
  currentEmailContent,
  emailContext
}) => {
  const { askGuru } = useGuruContext();
  const { showToast } = useToastContext();
  
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiSettings, setAiSettings] = useState({
    creativity: 0.7,
    formality: 0.5,
    length: 'medium' as 'short' | 'medium' | 'long',
    tone: 'professional' as 'casual' | 'professional' | 'friendly' | 'formal',
    language: 'en' as 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'
  });

  // AI Suggestions
  const aiSuggestions: AISuggestion[] = [
    {
      id: 'improve-tone',
      name: 'Improve Tone',
      description: 'Make the email more professional and engaging',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'tone',
      difficulty: 'easy',
      estimatedTime: 5,
      tags: ['tone', 'professional', 'engagement']
    },
    {
      id: 'add-personalization',
      name: 'Add Personalization',
      description: 'Include personalized elements based on contact data',
      icon: <User className="w-4 h-4" />,
      category: 'personalization',
      difficulty: 'medium',
      estimatedTime: 8,
      tags: ['personalization', 'contact', 'customization']
    },
    {
      id: 'enhance-structure',
      name: 'Enhance Structure',
      description: 'Improve the email structure and flow',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'structure',
      difficulty: 'medium',
      estimatedTime: 10,
      tags: ['structure', 'flow', 'organization']
    },
    {
      id: 'add-call-to-action',
      name: 'Add Call to Action',
      description: 'Include clear and compelling call-to-action statements',
      icon: <Target className="w-4 h-4" />,
      category: 'action',
      difficulty: 'easy',
      estimatedTime: 6,
      tags: ['cta', 'action', 'conversion']
    },
    {
      id: 'optimize-length',
      name: 'Optimize Length',
      description: 'Adjust email length for better engagement',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'content',
      difficulty: 'easy',
      estimatedTime: 4,
      tags: ['length', 'engagement', 'optimization']
    },
    {
      id: 'improve-clarity',
      name: 'Improve Clarity',
      description: 'Make the message clearer and more concise',
      icon: <Lightbulb className="w-4 h-4" />,
      category: 'content',
      difficulty: 'medium',
      estimatedTime: 7,
      tags: ['clarity', 'conciseness', 'communication']
    },
    {
      id: 'add-context',
      name: 'Add Context',
      description: 'Include relevant context and background information',
      icon: <Globe className="w-4 h-4" />,
      category: 'content',
      difficulty: 'hard',
      estimatedTime: 12,
      tags: ['context', 'background', 'information']
    },
    {
      id: 'enhance-persuasion',
      name: 'Enhance Persuasion',
      description: 'Make the email more persuasive and compelling',
      icon: <Brain className="w-4 h-4" />,
      category: 'style',
      difficulty: 'hard',
      estimatedTime: 15,
      tags: ['persuasion', 'compelling', 'influence']
    },
    {
      id: 'add-urgency',
      name: 'Add Urgency',
      description: 'Create a sense of urgency without being pushy',
      icon: <Clock className="w-4 h-4" />,
      category: 'action',
      difficulty: 'medium',
      estimatedTime: 8,
      tags: ['urgency', 'timing', 'motivation']
    },
    {
      id: 'improve-greeting',
      name: 'Improve Greeting',
      description: 'Create a more engaging and personalized greeting',
      icon: <MessageSquare className="w-4 h-4" />,
      category: 'style',
      difficulty: 'easy',
      estimatedTime: 5,
      tags: ['greeting', 'personalization', 'engagement']
    },
    {
      id: 'enhance-closing',
      name: 'Enhance Closing',
      description: 'Improve the email closing and signature',
      icon: <PenTool className="w-4 h-4" />,
      category: 'style',
      difficulty: 'easy',
      estimatedTime: 4,
      tags: ['closing', 'signature', 'professional']
    },
    {
      id: 'add-social-proof',
      name: 'Add Social Proof',
      description: 'Include testimonials or case studies if relevant',
      icon: <Users className="w-4 h-4" />,
      category: 'content',
      difficulty: 'hard',
      estimatedTime: 15,
      tags: ['social-proof', 'testimonials', 'credibility']
    }
  ];

  // AI Templates
  const aiTemplates: AITemplate[] = [
    {
      id: 'follow-up',
      name: 'Follow-up Email',
      description: 'Professional follow-up after a meeting or call',
      category: 'sales',
      content: `Hi {{contact_name}},

Thank you for taking the time to meet with me {{meeting_date}} to discuss {{topic}}.

As we discussed, here are the key points from our conversation:
{{key_points}}

{{next_steps}}

I'll follow up with you {{follow_up_date}} to discuss next steps.

Best regards,
{{user_name}}`,
      variables: ['contact_name', 'meeting_date', 'topic', 'key_points', 'next_steps', 'follow_up_date', 'user_name'],
      tags: ['follow-up', 'meeting', 'professional']
    },
    {
      id: 'proposal',
      name: 'Proposal Email',
      description: 'Send a proposal with clear value proposition',
      category: 'sales',
      content: `Dear {{contact_name}},

Thank you for the opportunity to present this proposal for {{company_name}}.

Based on our discussions, I've outlined a solution that addresses your specific needs:

{{solution_points}}

Investment: {{investment_amount}}
Timeline: {{timeline}}
ROI: {{roi_estimate}}

I'm confident this solution will help {{company_name}} achieve {{goal}}.

Please let me know if you have any questions.

Best regards,
{{user_name}}`,
      variables: ['contact_name', 'company_name', 'solution_points', 'investment_amount', 'timeline', 'roi_estimate', 'goal', 'user_name'],
      tags: ['proposal', 'sales', 'value']
    },
    {
      id: 'thank-you',
      name: 'Thank You Email',
      description: 'Express gratitude after a successful deal or meeting',
      category: 'relationship',
      content: `Hi {{contact_name}},

I wanted to personally thank you for {{reason}}.

{{specific_thanks}}

I'm excited about {{future_opportunity}} and look forward to {{next_interaction}}.

Best regards,
{{user_name}}`,
      variables: ['contact_name', 'reason', 'specific_thanks', 'future_opportunity', 'next_interaction', 'user_name'],
      tags: ['thank-you', 'gratitude', 'relationship']
    },
    {
      id: 'introduction',
      name: 'Introduction Email',
      description: 'Introduce yourself and your company',
      category: 'networking',
      content: `Hi {{contact_name}},

I hope this email finds you well. My name is {{user_name}} and I'm {{user_title}} at {{company_name}}.

{{company_description}}

{{value_proposition}}

I'd love to learn more about {{contact_company}} and explore potential collaboration opportunities.

Would you be available for a brief call {{suggested_time}}?

Best regards,
{{user_name}}`,
      variables: ['contact_name', 'user_name', 'user_title', 'company_name', 'company_description', 'value_proposition', 'contact_company', 'suggested_time'],
      tags: ['introduction', 'networking', 'collaboration']
    },
    {
      id: 'reminder',
      name: 'Reminder Email',
      description: 'Gentle reminder about upcoming deadlines or meetings',
      category: 'follow-up',
      content: `Hi {{contact_name}},

I hope you're having a great day! I wanted to send a friendly reminder about {{reminder_topic}}.

{{reminder_details}}

{{action_required}}

Please let me know if you need any clarification or have questions.

Best regards,
{{user_name}}`,
      variables: ['contact_name', 'reminder_topic', 'reminder_details', 'action_required', 'user_name'],
      tags: ['reminder', 'follow-up', 'gentle']
    }
  ];

  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsProcessing(true);
    
    try {
      showToast({
        title: 'AI Processing',
        description: `Applying ${suggestion.name}...`,
        type: 'info'
      });

      // Create AI prompt based on suggestion
      const prompt = createAIPrompt(suggestion, currentEmailContent, emailContext);
      
      // Call AI service
      const result = await askGuru(prompt);
      
      if (result) {
        setSuggestionResult(result);
        showToast({
          title: 'Suggestion Ready',
          description: `${suggestion.name} has been applied successfully`,
          type: 'success'
        });
      } else {
        throw new Error('No response from AI service');
      }
    } catch (error) {
      console.error('Error applying AI suggestion:', error);
      showToast({
        title: 'AI Error',
        description: 'Failed to apply suggestion. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createAIPrompt = (suggestion: AISuggestion, content: string, context?: any): string => {
    const basePrompt = `You are an AI email writing assistant. Please help improve this email by applying the following enhancement: "${suggestion.name}".

Current email content:
${content}

Enhancement request: ${suggestion.description}

AI Settings:
- Creativity level: ${aiSettings.creativity}
- Formality level: ${aiSettings.formality}
- Desired length: ${aiSettings.length}
- Tone: ${aiSettings.tone}
- Language: ${aiSettings.language}

Context information:
${context ? JSON.stringify(context, null, 2) : 'No additional context provided'}

Please provide the improved email content. Return only the email text, no additional commentary.`;

    return basePrompt;
  };

  const handleApplyResult = () => {
    if (suggestionResult) {
      onApplySuggestion(suggestionResult);
      setSuggestionResult('');
      setSelectedSuggestion(null);
      showToast({
        title: 'Applied',
        description: 'AI suggestion has been applied to your email',
        type: 'success'
      });
    }
  };

  const handleUseTemplate = (template: AITemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const result = await askGuru(customPrompt);
      
      if (result) {
        setSuggestionResult(result);
        showToast({
          title: 'Custom AI Response',
          description: 'Your custom AI request has been processed',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error processing custom prompt:', error);
      showToast({
        title: 'AI Error',
        description: 'Failed to process custom request',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#a259ff]/20 rounded-lg">
              <Bot className="w-6 h-6 text-[#a259ff]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Writing Assistant</h2>
              <p className="text-sm text-[#8a8a8a]">Enhance your email with AI-powered suggestions</p>
            </div>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Suggestions */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium text-white mb-4">AI Suggestions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {aiSuggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="p-4 cursor-pointer hover:bg-[#23233a]/60 transition-colors"
                  onClick={() => handleApplySuggestion(suggestion)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                      {suggestion.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{suggestion.name}</h4>
                      <p className="text-sm text-[#8a8a8a] mb-2">{suggestion.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={suggestion.difficulty === 'easy' ? 'success' : suggestion.difficulty === 'medium' ? 'warning' : 'danger'}
                            className="text-xs"
                          >
                            {suggestion.difficulty}
                          </Badge>
                          <span className="text-xs text-[#8a8a8a]">
                            ~{suggestion.estimatedTime}s
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {suggestion.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Settings & Custom Prompt */}
          <div className="space-y-6">
            {/* AI Settings */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">AI Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Creativity ({Math.round(aiSettings.creativity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.creativity}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Formality ({Math.round(aiSettings.formality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.formality}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, formality: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Length</label>
                  <select
                    value={aiSettings.length}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, length: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#23233a]/40 border border-[#23233a]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tone</label>
                  <select
                    value={aiSettings.tone}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, tone: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#23233a]/40 border border-[#23233a]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  >
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Custom Prompt */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Custom AI Request</h3>
              
              <div className="space-y-3">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe what you want AI to help you with..."
                  className="w-full h-24 px-3 py-2 bg-[#23233a]/40 border border-[#23233a]/50 rounded-lg text-white placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#a259ff] resize-none"
                />
                
                <Button
                  variant="primary"
                  onClick={handleCustomPrompt}
                  disabled={!customPrompt.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Send to AI
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Result */}
        {suggestionResult && (
          <div className="mt-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  AI Suggestion: {selectedSuggestion?.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSuggestionResult('')}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleApplyResult}
                  >
                    Apply to Email
                  </Button>
                </div>
              </div>
              
              <div className="bg-[#23233a]/40 border border-[#23233a]/50 rounded-lg p-4">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: suggestionResult }}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#23233a]/50">
                <h3 className="text-lg font-semibold text-white">Email Templates</h3>
                <Button
                  variant="secondary"
                  onClick={() => setShowTemplates(false)}
                >
                  Close
                </Button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-64">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:bg-[#23233a]/60 transition-colors"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <h4 className="font-medium text-white mb-2">{template.name}</h4>
                      <p className="text-sm text-[#8a8a8a] mb-3">{template.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        
                        <div className="flex items-center space-x-1">
                          {template.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="primary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIWritingAssistant; 