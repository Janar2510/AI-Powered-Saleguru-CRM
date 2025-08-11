export interface CallTranscript {
  id: string;
  contact_id?: string;
  deal_id?: string;
  call_type: 'sales_call' | 'discovery_call' | 'demo_call' | 'negotiation_call' | 'follow_up';
  duration: number;
  audio_url?: string;
  transcript: string;
  summary: string;
  key_points: string[];
  action_items: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  deal_stage: 'qualification' | 'discovery' | 'proposal' | 'negotiation' | 'closing';
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence_score: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface CallAnalysis {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  dealStage: 'qualification' | 'discovery' | 'proposal' | 'negotiation' | 'closing';
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence: number;
}

export interface CallRecording {
  id: string;
  contact_id?: string;
  deal_id?: string;
  call_type: CallTranscript['call_type'];
  duration: number;
  audio_url: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface CallInsights {
  totalCalls: number;
  averageDuration: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  dealStageBreakdown: {
    qualification: number;
    discovery: number;
    proposal: number;
    negotiation: number;
    closing: number;
  };
  topActionItems: string[];
  conversionRate: number;
} 