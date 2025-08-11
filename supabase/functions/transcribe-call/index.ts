import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!
  );

  try {
    const { audioUrl, contactId, dealId, callType, duration } = await req.json();

    if (!audioUrl) {
      throw new Error('Audio URL is required');
    }

    // 1. Download the audio file from the URL
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file');
    }
    
    const audioBlob = await audioResponse.blob();
    const audioBuffer = await audioBlob.arrayBuffer();

    // 2. Transcribe using OpenAI Whisper
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), 'call_recording.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      throw new Error(`Whisper API error: ${error}`);
    }

    const whisperData = await whisperResponse.json();
    const transcript = whisperData.text;

    // 3. Analyze and summarize using GPT-4
    const analysisPrompt = `You are an expert sales analyst. Analyze this sales call transcript and provide:

1. A concise summary (2-3 sentences)
2. Key points discussed (bullet points)
3. Action items and next steps (bullet points)
4. Sentiment analysis (positive/neutral/negative)
5. Deal stage assessment (qualification, discovery, proposal, negotiation, closing)
6. Risk assessment (low/medium/high)
7. Recommended follow-up actions

Call Type: ${callType || 'Sales Call'}
Duration: ${duration || 'Unknown'} minutes

Transcript:
${transcript}

Please format your response as JSON:
{
  "summary": "Brief summary of the call",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "actionItems": ["Action 1", "Action 2", "Action 3"],
  "sentiment": "positive|neutral|negative",
  "dealStage": "qualification|discovery|proposal|negotiation|closing",
  "riskLevel": "low|medium|high",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "confidence": 0.85
}`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales analyst. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!gptResponse.ok) {
      const error = await gptResponse.text();
      throw new Error(`GPT API error: ${error}`);
    }

    const gptData = await gptResponse.json();
    const analysisText = gptData.choices[0].message.content;

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback analysis
      analysis = {
        summary: "Call transcribed successfully. Manual review recommended.",
        keyPoints: ["Call recorded and transcribed"],
        actionItems: ["Review transcript manually"],
        sentiment: "neutral",
        dealStage: "discovery",
        riskLevel: "medium",
        recommendations: ["Schedule follow-up call"],
        confidence: 0.5
      };
    }

    // 4. Save to database
    const callRecord = {
      contact_id: contactId,
      deal_id: dealId,
      call_type: callType || 'sales_call',
      duration: duration || 0,
      audio_url: audioUrl,
      transcript: transcript,
      summary: analysis.summary,
      key_points: analysis.keyPoints,
      action_items: analysis.actionItems,
      sentiment: analysis.sentiment,
      deal_stage: analysis.dealStage,
      risk_level: analysis.riskLevel,
      recommendations: analysis.recommendations,
      confidence_score: analysis.confidence,
      created_at: new Date().toISOString(),
      status: 'completed'
    };

    const { data: savedCall, error: saveError } = await supabase
      .from('call_transcripts')
      .insert(callRecord)
      .select()
      .single();

    if (saveError) {
      throw new Error(`Database error: ${saveError.message}`);
    }

    // 5. Create a note entry for the contact/deal
    const noteContent = `📞 **AI Call Summary** (${callType || 'Sales Call'})

**Summary:** ${analysis.summary}

**Key Points:**
${analysis.keyPoints.map(point => `• ${point}`).join('\n')}

**Action Items:**
${analysis.actionItems.map(item => `• ${item}`).join('\n')}

**Sentiment:** ${analysis.sentiment}
**Deal Stage:** ${analysis.dealStage}
**Risk Level:** ${analysis.riskLevel}

**AI Recommendations:**
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

*Generated automatically from call transcript*`;

    const noteRecord = {
      contact_id: contactId,
      deal_id: dealId,
      content: noteContent,
      type: 'call_summary',
      created_at: new Date().toISOString(),
      created_by: 'ai_assistant'
    };

    await supabase
      .from('notes')
      .insert(noteRecord);

    return new Response(JSON.stringify({
      success: true,
      callId: savedCall.id,
      transcript: transcript,
      analysis: analysis,
      noteCreated: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in transcribe-call:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to transcribe call'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 