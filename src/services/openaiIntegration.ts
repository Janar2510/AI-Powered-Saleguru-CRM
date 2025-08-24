// OpenAI Integration Example
// This file shows how to integrate with actual OpenAI APIs for production use

/*
SETUP INSTRUCTIONS:
1. Install OpenAI SDK: npm install openai
2. Set environment variable: VITE_OPENAI_API_KEY=your_api_key
3. Replace mock implementations in aiTranscriptionService.ts with these functions

ENVIRONMENT VARIABLES:
- VITE_OPENAI_API_KEY: Your OpenAI API key
- VITE_OPENAI_ORG_ID: Your OpenAI organization ID (optional)
*/

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - use server-side in production
});

/**
 * Real OpenAI Whisper transcription
 * Replace mock transcribeAudio in aiTranscriptionService.ts with this
 */
export async function transcribeAudioWithWhisper(audioBlob: Blob): Promise<{
  transcript: string;
  confidence: number;
  language: string;
  speakers: any[];
}> {
  try {
    // Convert blob to file
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    
    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Optional: specify language
      response_format: 'verbose_json', // Get detailed response with timestamps
      timestamp_granularities: ['segment'] // Get segment-level timestamps
    });

    // Extract speaker information (simplified - real speaker diarization requires additional processing)
    const speakers = extractSpeakersFromSegments(transcription.segments || []);

    return {
      transcript: transcription.text,
      confidence: 0.95, // Whisper doesn't provide confidence scores
      language: transcription.language || 'en',
      speakers
    };
  } catch (error) {
    console.error('❌ OpenAI Whisper transcription failed:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Real OpenAI GPT-4 analysis
 * Replace mock analyzeTranscript in aiTranscriptionService.ts with this
 */
export async function analyzeTranscriptWithGPT4(transcript: string): Promise<{
  summary: string;
  sentiment: any;
  insights: any;
  actionItems: any[];
  nextSteps: string[];
  keyTakeaways: string[];
  dealProbability?: number;
  urgency: string;
}> {
  try {
    const systemPrompt = `You are an expert sales coach and CRM analyst. Analyze sales call transcripts and provide actionable insights in JSON format.

Your response must be valid JSON with this exact structure:
{
  "summary": "2-3 sentence summary of the call",
  "sentiment": {
    "overall": "positive|neutral|negative",
    "confidence": 0.85,
    "emotions": ["interested", "engaged"],
    "score": 0.7
  },
  "insights": {
    "customerNeeds": ["array of identified needs"],
    "objections": ["array of objections raised"],
    "opportunities": ["array of opportunities"],
    "concerns": ["array of concerns"],
    "keyQuotes": ["array of important quotes"],
    "competitorsMentioned": ["array of competitors"],
    "dealIndicators": ["array of buying signals"]
  },
  "actionItems": [
    {
      "id": "action_1",
      "action": "description of action",
      "priority": "high|medium|low",
      "confidence": 0.9,
      "category": "follow-up|demo|documentation",
      "dueDate": "2024-01-20"
    }
  ],
  "nextSteps": ["array of next steps"],
  "keyTakeaways": ["array of key takeaways"],
  "dealProbability": 75,
  "urgency": "low|medium|high"
}`;

    const userPrompt = `Analyze this sales call transcript:

TRANSCRIPT:
${transcript}

Provide a comprehensive analysis following the JSON structure specified in the system prompt.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: 'json_object' } // Ensure JSON response
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No analysis received from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(analysisText);
    
    // Validate and add missing fields if necessary
    return {
      summary: analysis.summary || 'Analysis summary not available',
      sentiment: {
        overall: analysis.sentiment?.overall || 'neutral',
        confidence: analysis.sentiment?.confidence || 0.5,
        emotions: analysis.sentiment?.emotions || [],
        score: analysis.sentiment?.score || 0
      },
      insights: {
        customerNeeds: analysis.insights?.customerNeeds || [],
        objections: analysis.insights?.objections || [],
        opportunities: analysis.insights?.opportunities || [],
        concerns: analysis.insights?.concerns || [],
        keyQuotes: analysis.insights?.keyQuotes || [],
        competitorsMentioned: analysis.insights?.competitorsMentioned || [],
        dealIndicators: analysis.insights?.dealIndicators || []
      },
      actionItems: (analysis.actionItems || []).map((item: any, index: number) => ({
        id: item.id || `action_${index + 1}`,
        action: item.action || 'Unknown action',
        priority: item.priority || 'medium',
        confidence: item.confidence || 0.7,
        category: item.category || 'general',
        dueDate: item.dueDate
      })),
      nextSteps: analysis.nextSteps || [],
      keyTakeaways: analysis.keyTakeaways || [],
      dealProbability: analysis.dealProbability,
      urgency: analysis.urgency || 'medium'
    };
  } catch (error) {
    console.error('❌ OpenAI GPT-4 analysis failed:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Real-time streaming transcription (advanced)
 * For live transcription during calls
 */
export async function startStreamingTranscription(onTranscript: (text: string) => void): Promise<void> {
  // This would require a more complex implementation with WebSocket streaming
  // and potentially a custom backend service for real-time processing
  console.log('🔄 Streaming transcription would be implemented here');
  
  // Example implementation outline:
  // 1. Capture audio in small chunks (1-2 seconds)
  // 2. Send chunks to backend service
  // 3. Backend processes with OpenAI Whisper API
  // 4. Stream results back via WebSocket
  // 5. Update UI with partial transcripts
}

/**
 * Helper function to extract speakers from Whisper segments
 */
function extractSpeakersFromSegments(segments: any[]): any[] {
  // This is a simplified implementation
  // Real speaker diarization requires additional processing or services like AssemblyAI
  
  const speakers: { [key: string]: any } = {};
  
  segments.forEach((segment, index) => {
    // Simple alternating speaker detection (not accurate, just for demo)
    const speakerId = `speaker_${(index % 2) + 1}`;
    
    if (!speakers[speakerId]) {
      speakers[speakerId] = {
        id: speakerId,
        name: speakerId === 'speaker_1' ? 'Sales Rep' : 'Prospect',
        segments: []
      };
    }
    
    speakers[speakerId].segments.push({
      start: segment.start,
      end: segment.end,
      text: segment.text,
      confidence: 0.9
    });
  });
  
  return Object.values(speakers);
}

/**
 * Production considerations and best practices:
 */

// 1. Security: Never expose API keys in frontend code
//    - Use environment variables
//    - Implement server-side proxy for OpenAI calls
//    - Add rate limiting and authentication

// 2. Error handling: Implement robust error handling
//    - Network failures
//    - API rate limits
//    - Invalid responses
//    - Timeout handling

// 3. Performance optimization:
//    - Chunk large audio files
//    - Implement caching for repeated analyses
//    - Use streaming for real-time transcription
//    - Optimize prompt engineering for faster responses

// 4. Cost management:
//    - Monitor API usage
//    - Implement usage limits per user/organization
//    - Cache results to avoid duplicate processing
//    - Use cheaper models for preliminary analysis

// 5. Data privacy:
//    - Encrypt audio data in transit and at rest
//    - Implement data retention policies
//    - Comply with GDPR/CCPA requirements
//    - Allow users to delete their data

export default {
  transcribeAudioWithWhisper,
  analyzeTranscriptWithGPT4,
  startStreamingTranscription
};

