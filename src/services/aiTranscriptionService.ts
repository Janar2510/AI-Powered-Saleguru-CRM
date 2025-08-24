// AI Transcription Service
// This service handles real-time transcription, AI analysis, and integration with OpenAI APIs

interface TranscriptionConfig {
  apiKey?: string;
  model?: string;
  language?: string;
  realTime?: boolean;
}

interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: string[];
  score: number;
}

interface CallInsights {
  customerNeeds: string[];
  objections: string[];
  opportunities: string[];
  concerns: string[];
  keyQuotes: string[];
  competitorsMentioned: string[];
  dealIndicators: string[];
}

interface ActionItem {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  confidence: number;
  category: string;
}

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  language: string;
  speakers: {
    id: string;
    name?: string;
    segments: {
      start: number;
      end: number;
      text: string;
      confidence: number;
    }[];
  }[];
}

interface AIAnalysisResult {
  summary: string;
  sentiment: SentimentAnalysis;
  insights: CallInsights;
  actionItems: ActionItem[];
  nextSteps: string[];
  keyTakeaways: string[];
  dealProbability?: number;
  urgency: 'low' | 'medium' | 'high';
}

class AITranscriptionService {
  private config: TranscriptionConfig;
  private isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: TranscriptionConfig = {}) {
    this.config = {
      model: 'whisper-1',
      language: 'en',
      realTime: true,
      ...config
    };
  }

  /**
   * Start real-time audio recording
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };

      // Start recording with time slices for real-time processing
      this.mediaRecorder.start(1000); // 1 second chunks

      console.log('🎤 Recording started');
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Stop all tracks to release microphone
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      console.log('🛑 Recording stopped');
    }
  }

  /**
   * Pause/Resume recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        console.log('⏸️ Recording paused');
      } else if (this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        console.log('▶️ Recording resumed');
      }
    }
  }

  /**
   * Process recorded audio
   */
  private async processRecording(): Promise<void> {
    if (this.audioChunks.length === 0) return;

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    
    try {
      // In a real implementation, this would call OpenAI Whisper API
      const transcription = await this.transcribeAudio(audioBlob);
      const analysis = await this.analyzeTranscript(transcription.transcript);
      
      // Emit results
      this.onTranscriptionComplete?.(transcription, analysis);
    } catch (error) {
      console.error('❌ Error processing recording:', error);
      this.onTranscriptionError?.(error as Error);
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper (mock implementation)
   */
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    // Mock implementation - replace with actual OpenAI API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transcript: "Thank you for taking the time to speak with me today. I understand you're looking for a CRM solution that can help streamline your sales process. Can you tell me about your current challenges? Well, we're using a combination of spreadsheets and an outdated system that doesn't integrate well. Our team is growing and we need something more robust.",
          confidence: 0.92,
          language: 'en',
          speakers: [
            {
              id: 'speaker_1',
              name: 'Sales Rep',
              segments: [
                {
                  start: 0,
                  end: 15.5,
                  text: "Thank you for taking the time to speak with me today. I understand you're looking for a CRM solution that can help streamline your sales process. Can you tell me about your current challenges?",
                  confidence: 0.95
                }
              ]
            },
            {
              id: 'speaker_2',
              name: 'Prospect',
              segments: [
                {
                  start: 16,
                  end: 28.3,
                  text: "Well, we're using a combination of spreadsheets and an outdated system that doesn't integrate well. Our team is growing and we need something more robust.",
                  confidence: 0.89
                }
              ]
            }
          ]
        });
      }, 2000);
    });
  }

  /**
   * Real OpenAI Whisper API implementation (commented for reference)
   */
  /*
  async transcribeAudioReal(audioBlob: Blob): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', this.config.model || 'whisper-1');
    formData.append('language', this.config.language || 'en');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      transcript: data.text,
      confidence: data.confidence || 0.8,
      language: data.language,
      speakers: this.extractSpeakers(data.segments)
    };
  }
  */

  /**
   * Analyze transcript using AI (mock implementation)
   */
  async analyzeTranscript(transcript: string): Promise<AIAnalysisResult> {
    // Mock implementation - replace with actual OpenAI GPT-4 API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "Discovery call with prospect discussing CRM needs. Current pain points include using spreadsheets and poor system integration. Team is growing and needs more robust solution. Strong buying signals present.",
          sentiment: {
            overall: 'positive',
            confidence: 0.87,
            emotions: ['interested', 'engaged', 'optimistic'],
            score: 0.72
          },
          insights: {
            customerNeeds: [
              'Better CRM integration',
              'Scalable solution for growing team',
              'Replace spreadsheet-based process',
              'Robust system architecture'
            ],
            objections: [
              'Implementation timeline concerns',
              'Budget considerations'
            ],
            opportunities: [
              'Growing team indicates expansion',
              'Current system inadequate',
              'Clear pain points identified',
              'Decision maker engaged'
            ],
            concerns: [
              'Change management',
              'User adoption',
              'Data migration complexity'
            ],
            keyQuotes: [
              "Our team is growing and we need something more robust",
              "We're using a combination of spreadsheets",
              "Doesn't integrate well"
            ],
            competitorsMentioned: [],
            dealIndicators: [
              'Active evaluation',
              'Budget discussions',
              'Timeline mentioned',
              'Team size expansion'
            ]
          },
          actionItems: [
            {
              id: 'action_1',
              action: 'Send detailed integration capabilities document',
              priority: 'high',
              confidence: 0.92,
              category: 'Follow-up',
              dueDate: new Date(Date.now() + 86400000).toISOString()
            },
            {
              id: 'action_2',
              action: 'Schedule technical demo focusing on scalability',
              priority: 'high',
              confidence: 0.88,
              category: 'Demo',
              dueDate: new Date(Date.now() + 172800000).toISOString()
            },
            {
              id: 'action_3',
              action: 'Prepare implementation timeline proposal',
              priority: 'medium',
              confidence: 0.75,
              category: 'Documentation'
            }
          ],
          nextSteps: [
            'Send integration documentation',
            'Schedule technical demo',
            'Prepare pricing proposal',
            'Follow up within 48 hours'
          ],
          keyTakeaways: [
            'Strong product-market fit',
            'Clear buying signals',
            'Technical evaluation stage',
            'Growth-driven urgency'
          ],
          dealProbability: 75,
          urgency: 'high'
        });
      }, 3000);
    });
  }

  /**
   * Real OpenAI GPT-4 analysis implementation (commented for reference)
   */
  /*
  async analyzeTranscriptReal(transcript: string): Promise<AIAnalysisResult> {
    const prompt = `
    Analyze this sales call transcript and provide insights:

    TRANSCRIPT:
    ${transcript}

    Please provide a JSON response with:
    1. A concise summary (2-3 sentences)
    2. Sentiment analysis (positive/neutral/negative with confidence)
    3. Customer needs identified
    4. Objections raised
    5. Opportunities discovered
    6. Key action items with priorities
    7. Next steps recommended
    8. Deal probability estimate (0-100)
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales coach and CRM analyst. Analyze sales call transcripts and provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
  */

  /**
   * Upload and process audio file
   */
  async uploadAndProcess(file: File): Promise<{ transcription: TranscriptionResult; analysis: AIAnalysisResult }> {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      throw new Error('Please upload an audio or video file');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size must be less than 100MB');
    }

    try {
      const transcription = await this.transcribeAudio(file);
      const analysis = await this.analyzeTranscript(transcription.transcript);
      
      return { transcription, analysis };
    } catch (error) {
      console.error('❌ Error processing uploaded file:', error);
      throw error;
    }
  }

  /**
   * Extract speaker diarization from segments
   */
  private extractSpeakers(segments: any[]): TranscriptionResult['speakers'] {
    const speakers: { [key: string]: any } = {};
    
    segments.forEach((segment, index) => {
      const speakerId = `speaker_${(index % 2) + 1}`; // Simple alternating speaker detection
      
      if (!speakers[speakerId]) {
        speakers[speakerId] = {
          id: speakerId,
          segments: []
        };
      }
      
      speakers[speakerId].segments.push({
        start: segment.start,
        end: segment.end,
        text: segment.text,
        confidence: segment.confidence || 0.8
      });
    });
    
    return Object.values(speakers);
  }

  /**
   * Get recording status
   */
  getRecordingStatus(): { isRecording: boolean; isPaused: boolean; duration: number } {
    return {
      isRecording: this.isRecording,
      isPaused: this.mediaRecorder?.state === 'paused',
      duration: this.audioChunks.length * 1000 // Rough estimate in ms
    };
  }

  /**
   * Event handlers (to be set by the UI component)
   */
  onTranscriptionComplete?: (transcription: TranscriptionResult, analysis: AIAnalysisResult) => void;
  onTranscriptionError?: (error: Error) => void;
  onRealTimeTranscript?: (partialTranscript: string) => void;
}

// Singleton instance
export const aiTranscriptionService = new AITranscriptionService();

// Export types
export type {
  TranscriptionConfig,
  SentimentAnalysis,
  CallInsights,
  ActionItem,
  TranscriptionResult,
  AIAnalysisResult
};

export default AITranscriptionService;

