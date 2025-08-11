import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!
  );

  try {
    const { contactData, dealData, recipientEmail, emailType, context } = await req.json();

    // Build context for the AI
    let prompt = `You are an expert sales professional writing personalized emails. Generate a professional, friendly email that is tailored to the recipient.

Email Type: ${emailType || 'follow-up'}
Recipient Email: ${recipientEmail || 'Not specified'}

`;

    // Add contact information
    if (contactData) {
      prompt += `
Contact Information:
- Name: ${contactData.first_name || ''} ${contactData.last_name || ''}
- Company: ${contactData.company || 'Not specified'}
- Position: ${contactData.position || 'Not specified'}
- Industry: ${contactData.industry || 'Not specified'}
- Lead Score: ${contactData.lead_score || 'Not specified'}
- Last Contact: ${contactData.last_contacted_at ? new Date(contactData.last_contacted_at).toLocaleDateString() : 'Not specified'}
`;
    }

    // Add deal information
    if (dealData) {
      prompt += `
Deal Information:
- Deal Title: ${dealData.title || 'Not specified'}
- Value: $${dealData.value || 0}
- Stage: ${dealData.stage || 'Not specified'}
- Probability: ${dealData.probability || 0}%
- Expected Close Date: ${dealData.expected_close_date ? new Date(dealData.expected_close_date).toLocaleDateString() : 'Not specified'}
`;
    }

    // Add context
    prompt += `
Context:
- Has Deal: ${context?.hasDeal ? 'Yes' : 'No'}
- Has Contact: ${context?.hasContact ? 'Yes' : 'No'}
- Is Reply: ${context?.isReply ? 'Yes' : 'No'}

Instructions:
1. Write a personalized email that references the contact's name, company, and any relevant deal information
2. Make it sound natural and conversational, not generic
3. Include a clear call-to-action
4. Keep it professional but friendly
5. If there's deal information, reference it appropriately
6. If this is a follow-up, acknowledge previous interactions
7. Return the email in HTML format with proper formatting

Generate both a subject line and email body. Format your response as JSON:
{
  "subject": "Your subject line here",
  "body": "<p>Your email body in HTML format</p>"
}
`;

    // Call OpenAI API
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.gOPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales professional who writes personalized, effective emails. Always respond with valid JSON containing subject and body fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    
    if (!openaiData.choices?.[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the AI response
    const aiResponse = openaiData.choices[0].message.content;
    
    // Try to extract JSON from the response
    let emailData;
    try {
      // Look for JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a simple email structure
        emailData = {
          subject: 'Follow-up from our recent discussion',
          body: `<p>${aiResponse}</p>`
        };
      }
    } catch (parseError) {
      // If JSON parsing fails, create a fallback email
      emailData = {
        subject: 'Follow-up from our recent discussion',
        body: `<p>${aiResponse}</p>`
      };
    }

    // Validate the response
    if (!emailData.subject || !emailData.body) {
      throw new Error('Invalid email structure from AI');
    }

    return new Response(JSON.stringify({
      success: true,
      email: {
        subject: emailData.subject,
        body: emailData.body
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating email draft:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate email draft'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 