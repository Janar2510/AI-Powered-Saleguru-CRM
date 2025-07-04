import { getSupabaseClient } from '../lib/supabase';

// Get the centralized Supabase client
const supabase = getSupabaseClient();

// Remove exposed API key - this will be stored securely on the server
export const OPENAI_API_KEY = '';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Calls the OpenAI API via Supabase Edge Function
 * @param messages Array of messages to send to the API
 * @param model OpenAI model to use (defaults to gpt-4o)
 * @returns The response from the API
 */
export const callOpenAI = async (
  messages: OpenAIMessage[],
  model: string = 'gpt-4o'
): Promise<string> => {
  try {
    // Call the Supabase Edge Function instead of OpenAI directly
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: {
        messages,
        model,
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    if (error) {
      console.error('Error calling OpenAI proxy:', error);
      throw new Error(`OpenAI proxy error: ${error.message || 'Unknown error'}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI proxy:', error);
    throw error;
  }
};

/**
 * Generates a system message with context for the OpenAI API
 * @param contextData Context data to include in the system message
 * @returns System message for the OpenAI API
 */
export const generateSystemMessage = (contextData: any): string => {
  return `You are SaleToruGuru, an AI sales assistant for a CRM system. 
Current page: ${contextData.page || 'Unknown'}
Current time: ${new Date().toISOString()}
User role: Sales Manager

You have access to the following CRM data:
${JSON.stringify(contextData, null, 2).substring(0, 1000)}...

Respond in a helpful, concise manner. Format your response using markdown.
For data analysis, include specific numbers and insights.
For recommendations, be specific and actionable.
For email templates, provide subject line and body text.`;
};

/**
 * Generates an email template based on deal information
 * @param dealData Deal data to use for the email template
 * @param emailType Type of email to generate
 * @returns Email template with subject and body
 */
export const generateEmailTemplate = async (
  dealData: any,
  emailType: 'introduction' | 'follow-up' | 'proposal' | 'negotiation' | 'closing'
): Promise<{ subject: string; body: string }> => {
  const systemMessage = `You are SaleToruGuru, an AI sales assistant. Generate a professional ${emailType} email template for a sales representative.
The email should be for the following deal:
- Company: ${dealData.company}
- Contact: ${dealData.contact}
- Deal Title: ${dealData.title}
- Value: $${dealData.value}
- Stage: ${dealData.stage}

Create a personalized, professional email that sounds natural and includes appropriate placeholders.
Format the response as plain text that can be used directly in an email.`;

  const userMessage = `Please write a ${emailType} email for the ${dealData.company} deal.`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]);

    // Extract subject and body from the response
    const subjectMatch = response.match(/Subject:(.*?)(?:\n|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} - ${dealData.title}`;

    // Remove the subject line to get just the body
    const body = response.replace(/Subject:.*?(?:\n|$)/i, '').trim();

    return { subject, body };
  } catch (error) {
    console.error('Error generating email template:', error);
    return {
      subject: `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} - ${dealData.title}`,
      body: `Hi ${dealData.contact},\n\nI wanted to follow up regarding our ${dealData.title} discussion.\n\nBest regards,\nYour Name`
    };
  }
};

export default {
  callOpenAI,
  generateSystemMessage,
  generateEmailTemplate
};