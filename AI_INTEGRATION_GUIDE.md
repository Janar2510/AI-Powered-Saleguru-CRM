# AI Integration Guide for Saleguru CRM

## Overview
This guide covers all AI integrations in the Saleguru CRM system, including the Guru AI assistant, email generation, and the new enhanced AI email features.

## Core AI Components

### 1. Guru AI Assistant
- **Location**: `src/contexts/GuruContext.tsx`
- **Purpose**: Main AI assistant for user queries and CRM assistance
- **Features**: Context-aware responses, CRM data integration, real-time assistance

### 2. Email Generation AI
- **Location**: `supabase/functions/generate-email-draft/`
- **Purpose**: Generate personalized email drafts based on contact and deal data
- **Features**: Contact personalization, deal context, multiple email types

### 3. Enhanced AI Email Writing Assistant
- **Location**: `src/components/emails/AIWritingAssistant.tsx`
- **Purpose**: Advanced AI-powered email enhancement and writing assistance
- **Features**: 12 enhancement types, custom prompts, AI settings control

## Enhanced AI Email Features

### AI Writing Assistant Capabilities

#### 12 AI Enhancement Types
1. **Improve Tone** - Make emails more professional and engaging
2. **Add Personalization** - Include personalized elements based on contact data
3. **Enhance Structure** - Improve email structure and flow
4. **Add Call to Action** - Include clear and compelling call-to-action statements
5. **Optimize Length** - Adjust email length for better engagement
6. **Improve Clarity** - Make messages clearer and more concise
7. **Add Context** - Include relevant context and background information
8. **Enhance Persuasion** - Make emails more persuasive and compelling
9. **Add Urgency** - Create sense of urgency without being pushy
10. **Improve Greeting** - Create more engaging and personalized greetings
11. **Enhance Closing** - Improve email closing and signature
12. **Add Social Proof** - Include testimonials or case studies if relevant

#### AI Settings Control
- **Creativity Level** (0-100%): Controls AI creativity and originality
- **Formality Level** (0-100%): Adjusts tone from casual to formal
- **Length Control**: Short, medium, or long email options
- **Tone Selection**: Casual, friendly, professional, or formal
- **Language Support**: Multiple language options (EN, ES, FR, DE, IT, PT, RU, ZH, JA, KO)

#### Custom AI Prompts
Users can create custom AI requests for specific email improvements:
```typescript
const customPrompt = "Make this email more persuasive for a sales pitch";
const result = await askGuru(customPrompt);
```

### AI Email Templates

#### Pre-built Templates
1. **Follow-up Email** - Professional follow-up after meetings
2. **Proposal Email** - Send proposals with clear value propositions
3. **Thank You Email** - Express gratitude after successful deals
4. **Introduction Email** - Introduce yourself and company
5. **Reminder Email** - Gentle reminders about deadlines or meetings

#### Template Variables
Templates support dynamic variable substitution:
- `{{contact_name}}` - Contact's name
- `{{company_name}}` - Company name
- `{{deal_name}}` - Deal title
- `{{user_name}}` - Current user's name
- `{{meeting_date}}` - Meeting date
- `{{topic}}` - Discussion topic
- `{{key_points}}` - Key discussion points
- `{{next_steps}}` - Next action items
- `{{follow_up_date}}` - Follow-up date
- `{{investment_amount}}` - Deal value
- `{{timeline}}` - Project timeline
- `{{roi_estimate}}` - ROI estimate
- `{{goal}}` - Business goal
- `{{solution_points}}` - Solution features
- `{{reason}}` - Reason for thank you
- `{{specific_thanks}}` - Specific thanks
- `{{future_opportunity}}` - Future opportunity
- `{{next_interaction}}` - Next interaction
- `{{user_title}}` - User's job title
- `{{company_description}}` - Company description
- `{{value_proposition}}` - Value proposition
- `{{contact_company}}` - Contact's company
- `{{suggested_time}}` - Suggested meeting time
- `{{reminder_topic}}` - Reminder topic
- `{{reminder_details}}` - Reminder details
- `{{action_required}}` - Required action

### Smart Mailbox AI Integration

#### Automatic Email Categorization
AI automatically categorizes emails based on content:
- **Work** - Business-related emails
- **Personal** - Personal communication
- **Urgent** - High-priority emails
- **Follow-up** - Emails requiring follow-up
- **Meeting** - Meeting-related emails
- **Deal** - Deal-related emails
- **Support** - Support and help emails
- **Marketing** - Marketing campaign emails

#### Smart Filtering Rules
AI-powered filtering based on:
- **Sender** - Email sender analysis
- **Recipient** - Recipient patterns
- **Subject** - Subject line analysis
- **Body** - Content analysis
- **Category** - Automatic categorization
- **Tags** - Smart tagging
- **Priority** - Priority detection

#### AI-Powered Mailbox Management
- **Auto-categorization** - Automatic email sorting
- **Smart Suggestions** - Context-aware suggestions
- **Intelligent Filtering** - Smart email filtering
- **Predictive Text** - AI-powered text suggestions
- **Smart Scheduling** - Optimal email timing

## AI Integration Architecture

### Frontend AI Components

#### EnhancedEmailComposer.tsx
```typescript
// Main email composer with AI integration
const EnhancedEmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  onSend,
  initialData
}) => {
  // AI integration for email enhancement
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    creativity: 0.7,
    formality: 0.5,
    length: 'medium',
    tone: 'professional',
    language: 'en'
  });
  
  // AI suggestion application
  const applyAiSuggestion = async (suggestionId: string) => {
    const prompt = createAIPrompt(suggestion, currentEmailContent, emailContext);
    const result = await askGuru(prompt);
    setFormData(prev => ({ ...prev, body: result }));
  };
};
```

#### AIWritingAssistant.tsx
```typescript
// Dedicated AI writing assistant component
const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  isOpen,
  onClose,
  onApplySuggestion,
  currentEmailContent,
  emailContext
}) => {
  // 12 AI enhancement types
  const aiSuggestions: AISuggestion[] = [
    { id: 'improve-tone', name: 'Improve Tone', category: 'tone' },
    { id: 'add-personalization', name: 'Add Personalization', category: 'personalization' },
    // ... more suggestions
  ];
  
  // AI settings control
  const [aiSettings, setAiSettings] = useState({
    creativity: 0.7,
    formality: 0.5,
    length: 'medium' as 'short' | 'medium' | 'long',
    tone: 'professional' as 'casual' | 'professional' | 'friendly' | 'formal',
    language: 'en' as 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'
  });
};
```

#### SmartMailboxManager.tsx
```typescript
// Smart mailbox management with AI
const SmartMailboxManager: React.FC<SmartMailboxManagerProps> = ({
  isOpen,
  onClose,
  onMailboxSelect,
  selectedMailbox
}) => {
  // AI-powered mailbox rules
  const mailboxes: Mailbox[] = [
    {
      id: 'starred',
      name: 'Starred',
      type: 'smart',
      rules: [
        {
          field: 'tags',
          operator: 'contains',
          value: 'starred',
          isActive: true
        }
      ]
    }
  ];
};
```

### Backend AI Integration

#### OpenAI Proxy Function
```typescript
// supabase/functions/openai-proxy/index.ts
export const invoke = async (req: InvokeRequest) => {
  const { messages, model, temperature } = req.body;
  
  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o',
    messages,
    temperature: temperature || 0.7,
    max_tokens: 2000
  });
  
  return response;
};
```

#### Email Generation Function
```typescript
// supabase/functions/generate-email-draft/index.ts
export const invoke = async (req: InvokeRequest) => {
  const { contactData, dealData, recipientEmail, emailType, context } = req.body;
  
  const prompt = createEmailPrompt(contactData, dealData, emailType, context);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  return {
    email: {
      subject: extractSubject(response.choices[0].message.content),
      body: extractBody(response.choices[0].message.content)
    }
  };
};
```

## AI Email Integration Hook

### useEmailIntegration.ts
```typescript
// Custom hook for email integration throughout the app
export const useEmailIntegration = (): UseEmailIntegrationReturn => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  
  // Contextual email types with AI integration
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
  
  // ... more email types
};
```

## AI Email Features by Category

### 1. Email Enhancement AI
- **Purpose**: Improve existing email content
- **Features**: Tone improvement, structure enhancement, clarity optimization
- **Usage**: Click AI Help button in email composer
- **Settings**: Creativity, formality, length, tone, language controls

### 2. Email Generation AI
- **Purpose**: Generate new email content from scratch
- **Features**: Template-based generation, personalization, context awareness
- **Usage**: Use "Generate Email" button or select templates
- **Integration**: Contact and deal data integration

### 3. Smart Categorization AI
- **Purpose**: Automatically categorize emails
- **Features**: Content analysis, sender analysis, priority detection
- **Usage**: Automatic, no user intervention required
- **Categories**: Work, personal, urgent, follow-up, meeting, deal, support, marketing

### 4. Smart Filtering AI
- **Purpose**: Intelligent email filtering and organization
- **Features**: Rule-based filtering, pattern recognition, smart suggestions
- **Usage**: Configure in Smart Mailbox Manager
- **Rules**: Sender, recipient, subject, body, category, tags, priority

### 5. Predictive AI
- **Purpose**: Predict optimal email timing and content
- **Features**: Send time optimization, content suggestions, engagement prediction
- **Usage**: AI suggestions in email composer
- **Data**: Historical email performance, contact behavior

## AI Email Analytics

### Performance Metrics
- **Email Open Rates** - Track email open performance
- **Click Rates** - Monitor link click engagement
- **Response Rates** - Measure email response success
- **AI Usage** - Track AI feature utilization
- **Template Performance** - Monitor template effectiveness

### AI Effectiveness Metrics
- **Suggestion Acceptance Rate** - How often AI suggestions are used
- **Email Quality Score** - AI-assessed email quality
- **Engagement Improvement** - Impact of AI enhancements
- **Time Savings** - Time saved using AI features
- **User Satisfaction** - User feedback on AI features

## AI Email Security & Privacy

### Data Protection
- **Email Encryption** - Secure email transmission
- **Data Privacy** - GDPR-compliant email handling
- **Access Control** - Role-based email access
- **Audit Trail** - Complete email activity logging
- **Backup & Recovery** - Secure email data backup

### AI Privacy
- **Content Analysis** - Local content analysis when possible
- **Data Minimization** - Only necessary data sent to AI services
- **User Consent** - Clear consent for AI processing
- **Data Retention** - Limited data retention periods
- **Anonymization** - Personal data anonymization

## AI Email Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Email AI Settings
EMAIL_AI_CREATIVITY=0.7
EMAIL_AI_FORMALITY=0.5
EMAIL_AI_DEFAULT_LENGTH=medium
EMAIL_AI_DEFAULT_TONE=professional
EMAIL_AI_DEFAULT_LANGUAGE=en

# AI Email Features
ENABLE_EMAIL_AI_ENHANCEMENT=true
ENABLE_EMAIL_AI_GENERATION=true
ENABLE_EMAIL_AI_CATEGORIZATION=true
ENABLE_EMAIL_AI_FILTERING=true
ENABLE_EMAIL_AI_PREDICTION=true
```

### AI Settings Configuration
```typescript
// Default AI settings
const defaultAiSettings = {
  creativity: 0.7,
  formality: 0.5,
  length: 'medium',
  tone: 'professional',
  language: 'en'
};

// AI feature toggles
const aiFeatureToggles = {
  enhancement: true,
  generation: true,
  categorization: true,
  filtering: true,
  prediction: true
};
```

## AI Email Troubleshooting

### Common Issues

#### AI Suggestions Not Working
1. Check OpenAI API key configuration
2. Verify API rate limits
3. Check network connectivity
4. Review error logs

#### Email Generation Fails
1. Verify contact/deal data availability
2. Check template configuration
3. Review AI prompt formatting
4. Monitor API response times

#### Smart Categorization Issues
1. Check email content format
2. Verify categorization rules
3. Review AI model performance
4. Update categorization logic

### Performance Optimization

#### AI Response Time
- Use appropriate model sizes
- Implement caching for common requests
- Optimize prompt length
- Use streaming responses

#### Email Processing
- Implement batch processing
- Use background jobs for heavy tasks
- Optimize database queries
- Implement proper indexing

## Future AI Email Enhancements

### Planned Features
1. **Advanced Personalization** - Deep learning personalization
2. **Sentiment Analysis** - Email sentiment detection
3. **Language Translation** - Multi-language email support
4. **Voice-to-Email** - Voice email composition
5. **Smart Scheduling** - AI-powered send time optimization
6. **A/B Testing** - AI-driven email testing
7. **Predictive Analytics** - Email success prediction
8. **Automated Responses** - Smart auto-reply system

### AI Model Improvements
1. **Fine-tuned Models** - Domain-specific email models
2. **Custom Training** - Company-specific AI training
3. **Multi-modal AI** - Text, image, and voice integration
4. **Real-time Learning** - Continuous AI improvement
5. **Federated Learning** - Privacy-preserving AI training

---

This guide covers the comprehensive AI integration in the Saleguru CRM email system. For specific implementation details, refer to the individual component files and API documentation. 