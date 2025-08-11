import { supabase } from './supabase';
import { CallTranscript, CallAnalysis } from '../types/call';

export class CallTranscriptionService {
  static async uploadAudioFile(file: File): Promise<string> {
    const fileName = `call-recordings/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload audio file: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  static async transcribeCall(params: {
    audioUrl: string;
    contactId?: string;
    dealId?: string;
    callType?: string;
    duration?: number;
  }): Promise<{
    success: boolean;
    callId?: string;
    transcript?: string;
    analysis?: CallAnalysis;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/transcribe-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to transcribe call');
      }

      return result;
    } catch (error) {
      console.error('Error transcribing call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getCallTranscripts(params: {
    contactId?: string;
    dealId?: string;
    limit?: number;
    offset?: number;
  }): Promise<CallTranscript[]> {
    let query = supabase
      .from('call_transcripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.contactId) {
      query = query.eq('contact_id', params.contactId);
    }

    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch call transcripts: ${error.message}`);
    }

    return data || [];
  }

  static async getCallInsights(params: {
    contactId?: string;
    dealId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalCalls: number;
    averageDuration: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    dealStageBreakdown: { qualification: number; discovery: number; proposal: number; negotiation: number; closing: number };
    topActionItems: string[];
    conversionRate: number;
  }> {
    let query = supabase
      .from('call_transcripts')
      .select('*');

    if (params.contactId) {
      query = query.eq('contact_id', params.contactId);
    }

    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }

    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }

    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch call insights: ${error.message}`);
    }

    const calls = data || [];

    // Calculate insights
    const totalCalls = calls.length;
    const averageDuration = totalCalls > 0 
      ? calls.reduce((sum, call) => sum + call.duration, 0) / totalCalls 
      : 0;

    const sentimentBreakdown = {
      positive: calls.filter(call => call.sentiment === 'positive').length,
      neutral: calls.filter(call => call.sentiment === 'neutral').length,
      negative: calls.filter(call => call.sentiment === 'negative').length
    };

    const dealStageBreakdown = {
      qualification: calls.filter(call => call.deal_stage === 'qualification').length,
      discovery: calls.filter(call => call.deal_stage === 'discovery').length,
      proposal: calls.filter(call => call.deal_stage === 'proposal').length,
      negotiation: calls.filter(call => call.deal_stage === 'negotiation').length,
      closing: calls.filter(call => call.deal_stage === 'closing').length
    };

    // Get top action items
    const allActionItems = calls.flatMap(call => call.action_items || []);
    const actionItemCounts = allActionItems.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActionItems = Object.entries(actionItemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item);

    // Calculate conversion rate (calls that moved to next stage)
    const conversionRate = totalCalls > 0 
      ? calls.filter(call => call.deal_stage !== 'qualification').length / totalCalls 
      : 0;

    return {
      totalCalls,
      averageDuration,
      sentimentBreakdown,
      dealStageBreakdown,
      topActionItems,
      conversionRate
    };
  }

  static async deleteCallTranscript(callId: string): Promise<void> {
    const { error } = await supabase
      .from('call_transcripts')
      .delete()
      .eq('id', callId);

    if (error) {
      throw new Error(`Failed to delete call transcript: ${error.message}`);
    }
  }
} 