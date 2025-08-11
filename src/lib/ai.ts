import { supabase } from '../services/supabase';

// AI Request and Response interfaces
export interface AIRequest {
  prompt: string;
  context?: string;
  documentType?: string;
  quoteData?: any;
}

export interface AIResponse {
  content: string;
  tokens_used?: number;
  model_used?: string;
}

// Generate document content with AI assistance
export const generateDocumentContent = async (request: AIRequest): Promise<AIResponse> => {
  try {
    // Mock AI response for now - in production, this would call OpenAI API
    const mockResponses = {
      'invoice': 'Professional invoice with detailed line items and payment terms.',
      'proforma': 'Pro forma invoice with estimated costs and delivery timeline.',
      'receipt': 'Payment receipt with transaction details and confirmation.',
      'quote': 'Detailed quote with pricing breakdown and terms.'
    };

    const response = mockResponses[request.documentType as keyof typeof mockResponses] || 
                   'AI-generated professional document content.';

    // Log AI generation for analytics
    await logAIGeneration({
      document_type: request.documentType || 'unknown',
      context: request.context || '',
      generated_content: response,
      tokens_used: 150, // Mock token count
      model_used: 'gpt-4'
    });

    return {
      content: response,
      tokens_used: 150,
      model_used: 'gpt-4'
    };
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
};

// Generate document content from quote data
export const generateDocumentFromQuote = async (quoteData: any, documentType: string): Promise<string> => {
  try {
    const prompt = `Generate a professional ${documentType} from the following quote data:
      Quote Number: ${quoteData.quote_number}
      Client: ${quoteData.client_name}
      Total: €${quoteData.total}
      Items: ${quoteData.items.map((item: any) => `${item.name} (${item.qty}x €${item.price})`).join(', ')}
      
      Please create a well-formatted ${documentType} with proper styling and professional language.`;

    const response = await generateDocumentContent({
      prompt,
      documentType,
      quoteData
    });

    return response.content;
  } catch (error) {
    console.error('Error generating document from quote:', error);
    throw error;
  }
};

// AI-assisted summary generation
export const generateAISummary = async (documentType: string, quoteData: any): Promise<string> => {
  try {
    const summary = `This ${documentType} has been generated from Quote #${quoteData.quote_number} for ${quoteData.client_name}. 
    The total value of €${quoteData.total.toLocaleString()} includes professional services. 
    All items are clearly itemized and ready for client review.`;

    return summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
};

// Log AI generation for analytics
export const logAIGeneration = async (data: {
  document_type: string;
  context: string;
  generated_content: string;
  tokens_used: number;
  model_used: string;
}) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      await supabase.from('ai_generations').insert({
        user_id: user.user.id,
        document_type: data.document_type,
        context: data.context,
        generated_content: data.generated_content,
        tokens_used: data.tokens_used,
        model_used: data.model_used
      });
    }
  } catch (error) {
    console.error('Error logging AI generation:', error);
  }
};

// Analyze document content for insights
export const analyzeDocumentContent = async (content: string): Promise<any> => {
  try {
    // Mock analysis - in production, this would use AI to analyze document content
    const analysis = {
      word_count: content.split(' ').length,
      has_pricing: content.includes('€') || content.includes('$'),
      has_dates: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(content),
      sentiment: 'professional',
      suggestions: [
        'Consider adding payment terms',
        'Include contact information',
        'Add company branding'
      ]
    };

    return analysis;
  } catch (error) {
    console.error('Error analyzing document content:', error);
    throw error;
  }
};

// Generate template suggestions based on document type
export const generateTemplateSuggestions = async (documentType: string): Promise<string[]> => {
  try {
    const suggestions = {
      'invoice': [
        'Professional invoice with company logo',
        'Detailed line item breakdown',
        'Payment terms and conditions',
        'Tax calculation included'
      ],
      'proforma': [
        'Estimated costs breakdown',
        'Delivery timeline',
        'Terms and conditions',
        'Professional formatting'
      ],
      'receipt': [
        'Payment confirmation',
        'Transaction details',
        'Receipt number',
        'Thank you message'
      ],
      'quote': [
        'Detailed service description',
        'Pricing breakdown',
        'Validity period',
        'Terms and conditions'
      ]
    };

    return suggestions[documentType as keyof typeof suggestions] || [];
  } catch (error) {
    console.error('Error generating template suggestions:', error);
    return [];
  }
};

// Enhanced AI assist for document editing
export const enhanceDocumentWithAI = async (content: string, documentType: string): Promise<string> => {
  try {
    const enhancements = {
      'invoice': `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px;">
          <h3 style="color: #28a745; margin-bottom: 10px;">AI Enhancement</h3>
          <p style="color: #666; line-height: 1.6;">
            This invoice has been professionally formatted with clear line items and payment terms. 
            Consider adding your company logo and contact information for a more professional appearance.
          </p>
        </div>
      `,
      'proforma': `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px;">
          <h3 style="color: #007bff; margin-bottom: 10px;">AI Enhancement</h3>
          <p style="color: #666; line-height: 1.6;">
            This pro forma invoice includes estimated costs and delivery timeline. 
            The document is ready for client review and approval.
          </p>
        </div>
      `,
      'receipt': `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 4px;">
          <h3 style="color: #ffc107; margin-bottom: 10px;">AI Enhancement</h3>
          <p style="color: #666; line-height: 1.6;">
            Payment receipt generated with transaction details and confirmation. 
            All information is clearly presented for record-keeping.
          </p>
        </div>
      `
    };

    return content + (enhancements[documentType as keyof typeof enhancements] || '');
  } catch (error) {
    console.error('Error enhancing document with AI:', error);
    return content;
  }
}; 