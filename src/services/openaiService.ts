import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// Interfaces for Guru functionality
export interface GuruContext {
  user: {
    name: string;
    role: string;
    preferences: any;
  };
  crm: {
    deals: any[];
    contacts: any[];
    tasks: any[];
    companies: any[];
    analytics: any;
  };
  conversation: {
    history: any[];
    currentPage: string;
  };
}

export interface GuruResponse {
  type: 'text' | 'action' | 'insight' | 'suggestion';
  content: string;
  actions?: {
    type: 'create_task' | 'compose_email' | 'create_automation' | 'navigate';
    data: any;
  }[];
  metadata?: any;
}

export const openaiService = {
  // Create chat completion
  async createChatCompletion({
    model,
    messages,
    temperature = 0.7,
    max_tokens = 1000
  }: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }) {
    try {
      // For demo purposes, return a mock response if no API key
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
        console.log('Using demo OpenAI response for temporal lead scoring');
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                final_score: 85,
                time_factors: {
                  quarter: "Q4",
                  holiday: "none",
                  season: "fall",
                  urgency: "high",
                  industry_trend: "Technology sector showing strong Q4 activity",
                  company_history: "Company has historically closed deals in Q4",
                  role_timing: "C-level decision makers active in Q4"
                },
                reasoning: "Score adjusted upward due to Q4 urgency, strong industry trends, and historical company patterns showing higher close rates in this quarter."
              })
            }
          }]
        };
      }

      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens
      });

      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback response
      return {
        choices: [{
          message: {
            content: JSON.stringify({
              final_score: 75,
              time_factors: {
                quarter: "Q4",
                holiday: "none",
                season: "fall",
                urgency: "medium",
                industry_trend: "Standard industry activity",
                company_history: "No specific patterns identified",
                role_timing: "Standard decision timing"
              },
              reasoning: "Fallback calculation due to API error. Using base score with minimal temporal adjustments."
            })
          }
        }]
      };
    }
  },

  // Generate text completion (for simpler prompts)
  async createCompletion({
    prompt,
    model = 'gpt-3.5-turbo-instruct',
    max_tokens = 150
  }: {
    prompt: string;
    model?: string;
    max_tokens?: number;
  }) {
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
        return {
          choices: [{
            text: "Demo response: This is a placeholder for AI-generated content."
          }]
        };
      }

      const response = await openai.completions.create({
        model,
        prompt,
        max_tokens
      });

      return response;
    } catch (error) {
      console.error('OpenAI completion error:', error);
      return {
        choices: [{
          text: "Error generating content. Please try again."
        }]
      };
    }
  }
};

// Default export for GuruPanel compatibility
const openAIService = {
  async processGuruMessage(
    userMessage: string,
    context: GuruContext,
    conversationHistory: any[] = []
  ): Promise<GuruResponse> {
    try {
      const systemPrompt = `You are SaleToru Guru, an AI assistant for a CRM system. You help users with:

**CRM Capabilities:**
- Task management (create, update, prioritize tasks)
- Email composition and sending
- Contact and company management
- Deal pipeline analysis
- Lead scoring and qualification
- Automation suggestions
- Analytics and insights
- Calendar and scheduling

**User Context:**
- User: ${context.user.name} (${context.user.role})
- Current page: ${context.conversation.currentPage}
- CRM Stats: ${JSON.stringify(context.crm.analytics, null, 2)}

**Available Actions:**
1. create_task: Create a new task with title, description, due_date, priority, assigned_to
2. compose_email: Draft an email with to, subject, body, template
3. suggest_automation: Recommend workflow automations
4. provide_insights: Give analytics insights and recommendations
5. navigate: Suggest navigation to specific CRM pages

**Response Format:**
Respond naturally but include structured actions when needed. For actions, use this format:
{
  "type": "action",
  "content": "Your natural response",
  "actions": [
    {
      "type": "create_task",
      "data": { "title": "...", "description": "...", "due_date": "...", "priority": "medium" }
    }
  ]
}

**Guidelines:**
- Be helpful, professional, and concise
- Understand CRM terminology and sales processes
- Provide actionable insights
- Suggest relevant automations
- Help optimize sales workflows
- Always consider the user's role and current context`;

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.text || ''
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const responseContent = response.choices[0].message.content;
      
      // Try to parse structured response
      try {
        if (responseContent) {
          const parsed = JSON.parse(responseContent);
          if (parsed.type && parsed.content) {
            return parsed as GuruResponse;
          }
        }
      } catch {
        // If not structured, return as text response
      }

      return {
        type: 'text',
        content: responseContent || "I'm having trouble processing your request right now."
      };
    } catch (error) {
      console.error('Error processing Guru message:', error);
      return {
        type: 'text',
        content: "I'm having trouble processing your request right now. Please try again in a moment."
      };
    }
  },

  async generateEmailContent(
    recipient: string,
    purpose: string,
    context: any
  ): Promise<{ subject: string; body: string }> {
    try {
      const prompt = `Generate a professional email for:
Recipient: ${recipient}
Purpose: ${purpose}
Context: ${JSON.stringify(context)}

Generate both subject and body. Return as JSON:
{
  "subject": "Email subject",
  "body": "Email body in HTML format"
}`;

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system' as const, content: 'You are an expert sales email writer. Generate professional, engaging emails.' },
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const responseContent = response.choices[0].message.content;
      if (responseContent) {
        const parsed = JSON.parse(responseContent);
        
        return {
          subject: parsed.subject,
          body: parsed.body
        };
      }
      
      return {
        subject: 'Follow up',
        body: '<p>Hi there,</p><p>I hope this email finds you well.</p><p>Best regards,<br>Janar</p>'
      };
    } catch (error) {
      console.error('Error generating email content:', error);
      return {
        subject: 'Follow up',
        body: '<p>Hi there,</p><p>I hope this email finds you well.</p><p>Best regards,<br>Janar</p>'
      };
    }
  },

  async analyzePipeline(deals: any[]): Promise<string> {
    try {
      const prompt = `Analyze this sales pipeline data and provide insights:
${JSON.stringify(deals, null, 2)}

Provide actionable insights about:
- Pipeline health
- Conversion rates
- Bottlenecks
- Opportunities
- Recommendations

Be concise and actionable.`;

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system' as const, content: 'You are a sales analytics expert. Provide clear, actionable insights.' },
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || 'Unable to analyze pipeline at this time.';
    } catch (error) {
      console.error('Error analyzing pipeline:', error);
      return 'Unable to analyze pipeline at this time.';
    }
  },

  async suggestAutomations(context: any): Promise<string[]> {
    try {
      const prompt = `Based on this CRM context, suggest relevant automations:
${JSON.stringify(context, null, 2)}

Suggest 3-5 specific automations that would help improve efficiency and sales performance.`;

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system' as const, content: 'You are a CRM automation expert. Suggest practical, valuable automations.' },
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const responseContent = response.choices[0].message.content;
      
      if (responseContent) {
        // Parse suggestions (assuming they're numbered or bulleted)
        return responseContent.split('\n')
          .filter(line => line.trim().match(/^[•\-\d]/))
          .map(line => line.replace(/^[•\-\d\.\s]+/, '').trim())
          .filter(suggestion => suggestion.length > 0);
      }
      
      return [
        'Auto-follow up emails for new leads',
        'Task creation for overdue deals',
        'Lead scoring updates based on activity'
      ];
    } catch (error) {
      console.error('Error suggesting automations:', error);
      return [
        'Auto-follow up emails for new leads',
        'Task creation for overdue deals',
        'Lead scoring updates based on activity'
      ];
    }
  },

  async enrichContactData(contact: any): Promise<any> {
    try {
      const prompt = `Enrich this contact data with additional information:
${JSON.stringify(contact, null, 2)}

Provide additional fields like:
- Company information
- Social media profiles
- Industry insights
- Contact preferences
- Lead scoring factors`;

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system' as const, content: 'You are a contact enrichment expert. Provide relevant additional data.' },
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const responseContent = response.choices[0].message.content;
      if (responseContent) {
        return JSON.parse(responseContent);
      }
      return contact;
    } catch (error) {
      console.error('Error enriching contact data:', error);
      return contact;
    }
  }
};

export default openAIService;