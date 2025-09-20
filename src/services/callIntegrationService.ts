// Call Integration Service
// Handles integration of call transcriptions with CRM entities (contacts, deals, organizations)

import { supabase } from './supabase';
import { TranscriptionResult, AIAnalysisResult } from './aiTranscriptionService';

interface CallRecord {
  id: string;
  title: string;
  contact_id?: string;
  deal_id?: string;
  organization_id?: string;
  user_id: string;
  call_type: 'sales_call' | 'demo' | 'discovery' | 'follow_up' | 'meeting' | 'support';
  status: 'recording' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  duration_seconds: number;
  scheduled_at?: string;
  started_at: string;
  ended_at?: string;
  
  // Transcription data
  transcript_text: string;
  transcript_confidence: number;
  language: string;
  
  // AI Analysis
  summary: string;
  sentiment_overall: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  sentiment_confidence: number;
  
  // Insights JSON fields
  customer_needs: string[];
  objections: string[];
  opportunities: string[];
  concerns: string[];
  competitors_mentioned: string[];
  key_quotes: string[];
  
  // Predictions
  deal_probability?: number;
  urgency_level: 'low' | 'medium' | 'high';
  next_best_action?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  org_id: string;
}

interface CallParticipant {
  id: string;
  call_id: string;
  name: string;
  role: 'rep' | 'customer' | 'prospect' | 'team' | 'other';
  contact_id?: string;
  speaking_time_percentage: number;
  created_at: string;
}

interface CallActionItem {
  id: string;
  call_id: string;
  action_text: string;
  priority: 'high' | 'medium' | 'low';
  assignee_id?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  confidence_score: number;
  category: string;
  created_at: string;
  updated_at: string;
}

interface CallKeyword {
  id: string;
  call_id: string;
  keyword: string;
  frequency: number;
  relevance_score: number;
  category?: string;
  created_at: string;
}

interface CRMIntegrationOptions {
  autoLinkContacts?: boolean;
  autoCreateActionItems?: boolean;
  autoUpdateDealProbability?: boolean;
  autoNotifyTeam?: boolean;
  minimumConfidence?: number;
}

class CallIntegrationService {
  private options: CRMIntegrationOptions;

  constructor(options: CRMIntegrationOptions = {}) {
    this.options = {
      autoLinkContacts: true,
      autoCreateActionItems: true,
      autoUpdateDealProbability: true,
      autoNotifyTeam: false,
      minimumConfidence: 0.7,
      ...options
    };
  }

  /**
   * Create a new call record in the database
   */
  async createCallRecord(
    callData: {
      title: string;
      contactId?: string;
      dealId?: string;
      organizationId?: string;
      callType: CallRecord['call_type'];
      scheduledAt?: string;
    }
  ): Promise<CallRecord> {
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .insert({
          title: callData.title,
          contact_id: callData.contactId,
          deal_id: callData.dealId,
          organization_id: callData.organizationId,
          call_type: callData.callType,
          status: 'recording',
          scheduled_at: callData.scheduledAt,
          started_at: new Date().toISOString(),
          transcript_text: '',
          transcript_confidence: 0,
          language: 'en',
          summary: '',
          sentiment_overall: 'neutral',
          sentiment_score: 0,
          sentiment_confidence: 0,
          customer_needs: [],
          objections: [],
          opportunities: [],
          concerns: [],
          competitors_mentioned: [],
          key_quotes: [],
          urgency_level: 'medium'
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('📞 Call record created:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error creating call record:', error);
      throw new Error('Failed to create call record');
    }
  }

  /**
   * Update call record with transcription and analysis results
   */
  async updateCallWithResults(
    callId: string,
    transcription: TranscriptionResult,
    analysis: AIAnalysisResult,
    durationSeconds: number
  ): Promise<CallRecord> {
    try {
      // Update main call record
      const { data: callData, error: callError } = await supabase
        .from('call_transcripts')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          transcript_text: transcription.transcript,
          transcript_confidence: transcription.confidence,
          language: transcription.language,
          summary: analysis.summary,
          sentiment_overall: analysis.sentiment.overall,
          sentiment_score: analysis.sentiment.score,
          sentiment_confidence: analysis.sentiment.confidence,
          customer_needs: analysis.insights.customerNeeds,
          objections: analysis.insights.objections,
          opportunities: analysis.insights.opportunities,
          concerns: analysis.insights.concerns,
          competitors_mentioned: analysis.insights.competitorsMentioned,
          key_quotes: analysis.insights.keyQuotes,
          deal_probability: analysis.dealProbability,
          urgency_level: analysis.urgency,
          next_best_action: analysis.nextSteps[0] || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', callId)
        .select()
        .single();

      if (callError) throw callError;

      // Create participants
      await this.createCallParticipants(callId, transcription.speakers);

      // Create action items
      await this.createCallActionItems(callId, analysis.actionItems);

      // Create keywords
      await this.createCallKeywords(callId, analysis.insights);

      // Auto-integration with CRM entities
      if (this.options.autoLinkContacts) {
        await this.autoLinkToContacts(callData);
      }

      if (this.options.autoUpdateDealProbability && callData.deal_id) {
        await this.updateDealProbability(callData.deal_id, analysis.dealProbability);
      }

      if (this.options.autoNotifyTeam) {
        await this.notifyTeamMembers(callData, analysis);
      }

      console.log('✅ Call record updated successfully:', callId);
      return callData;
    } catch (error) {
      console.error('❌ Error updating call record:', error);
      throw new Error('Failed to update call with results');
    }
  }

  /**
   * Create call participants from transcription speakers
   */
  private async createCallParticipants(
    callId: string,
    speakers: TranscriptionResult['speakers']
  ): Promise<void> {
    try {
      const participants = speakers.map(speaker => ({
        call_id: callId,
        name: speaker.name || speaker.id,
        role: this.inferSpeakerRole(speaker.name),
        speaking_time_percentage: this.calculateSpeakingTime(speaker, speakers),
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('call_participants')
        .insert(participants);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error creating call participants:', error);
    }
  }

  /**
   * Create action items from AI analysis
   */
  private async createCallActionItems(
    callId: string,
    actionItems: AIAnalysisResult['actionItems']
  ): Promise<void> {
    try {
      if (!this.options.autoCreateActionItems) return;

      const items = actionItems
        .filter(item => item.confidence >= (this.options.minimumConfidence || 0.7))
        .map(item => ({
          call_id: callId,
          action_text: item.action,
          priority: item.priority,
          due_date: item.dueDate,
          completed: false,
          confidence_score: item.confidence,
          category: item.category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (items.length > 0) {
        const { error } = await supabase
          .from('call_action_items')
          .insert(items);

        if (error) throw error;
        console.log(`📋 Created ${items.length} action items for call ${callId}`);
      }
    } catch (error) {
      console.error('❌ Error creating call action items:', error);
    }
  }

  /**
   * Create keywords from insights
   */
  private async createCallKeywords(
    callId: string,
    insights: AIAnalysisResult['insights']
  ): Promise<void> {
    try {
      const allKeywords = [
        ...insights.customerNeeds,
        ...insights.opportunities,
        ...insights.competitorsMentioned
      ];

      const keywordCounts = allKeywords.reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const keywords = Object.entries(keywordCounts).map(([keyword, frequency]) => ({
        call_id: callId,
        keyword,
        frequency,
        relevance_score: Math.min(frequency * 0.3, 1),
        category: this.categorizeKeyword(keyword),
        created_at: new Date().toISOString()
      }));

      if (keywords.length > 0) {
        const { error } = await supabase
          .from('call_keywords')
          .insert(keywords);

        if (error) throw error;
      }
    } catch (error) {
      console.error('❌ Error creating call keywords:', error);
    }
  }

  /**
   * Auto-link call to contacts based on analysis
   */
  private async autoLinkToContacts(callData: CallRecord): Promise<void> {
    // This would use AI to identify potential contacts mentioned in the call
    // For now, this is a placeholder implementation
    console.log('🔗 Auto-linking contacts for call:', callData.id);
  }

  /**
   * Update deal probability based on call analysis
   */
  private async updateDealProbability(
    dealId: string,
    probability?: number
  ): Promise<void> {
    try {
      if (!probability) return;

      const { error } = await supabase
        .from('deals')
        .update({
          probability,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (error) throw error;
      console.log(`📈 Updated deal ${dealId} probability to ${probability}%`);
    } catch (error) {
      console.error('❌ Error updating deal probability:', error);
    }
  }

  /**
   * Notify team members about important call insights
   */
  private async notifyTeamMembers(
    callData: CallRecord,
    analysis: AIAnalysisResult
  ): Promise<void> {
    // This would send notifications for high-priority items or negative sentiment
    if (analysis.sentiment.overall === 'negative' || analysis.urgency === 'high') {
      console.log('🚨 Sending team notifications for call:', callData.id);
      // Implementation would go here
    }
  }

  /**
   * Get call history for a contact
   */
  async getContactCallHistory(contactId: string): Promise<CallRecord[]> {
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('contact_id', contactId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching contact call history:', error);
      return [];
    }
  }

  /**
   * Get call history for a deal
   */
  async getDealCallHistory(dealId: string): Promise<CallRecord[]> {
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('deal_id', dealId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching deal call history:', error);
      return [];
    }
  }

  /**
   * Get action items for a user
   */
  async getUserActionItems(userId: string): Promise<CallActionItem[]> {
    try {
      const { data, error } = await supabase
        .from('call_action_items')
        .select(`
          *,
          call_transcripts (
            title,
            contact_id,
            deal_id
          )
        `)
        .eq('assignee_id', userId)
        .eq('completed', false)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching user action items:', error);
      return [];
    }
  }

  /**
   * Search calls by content
   */
  async searchCalls(query: string, filters?: {
    contactId?: string;
    dealId?: string;
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CallRecord[]> {
    try {
      let queryBuilder = supabase
        .from('call_transcripts')
        .select('*')
        .ilike('transcript_text', `%${query}%`);

      if (filters?.contactId) {
        queryBuilder = queryBuilder.eq('contact_id', filters.contactId);
      }
      
      if (filters?.dealId) {
        queryBuilder = queryBuilder.eq('deal_id', filters.dealId);
      }
      
      if (filters?.sentiment) {
        queryBuilder = queryBuilder.eq('sentiment_overall', filters.sentiment);
      }
      
      if (filters?.dateFrom) {
        queryBuilder = queryBuilder.gte('started_at', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        queryBuilder = queryBuilder.lte('started_at', filters.dateTo);
      }

      const { data, error } = await queryBuilder
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error searching calls:', error);
      return [];
    }
  }

  /**
   * Get call analytics for dashboard
   */
  async getCallAnalytics(timeRange: 'week' | 'month' | 'quarter' = 'month'): Promise<{
    totalCalls: number;
    averageSentiment: number;
    topKeywords: { keyword: string; count: number }[];
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    callsByType: { type: string; count: number }[];
  }> {
    try {
      const startDate = this.getDateRange(timeRange);
      
      const { data: calls, error } = await supabase
        .from('call_transcripts')
        .select('call_type, sentiment_overall, sentiment_score')
        .gte('started_at', startDate.toISOString())
        .eq('status', 'completed');

      if (error) throw error;

      const analytics = {
        totalCalls: calls?.length || 0,
        averageSentiment: calls?.reduce((sum, call) => sum + call.sentiment_score, 0) / (calls?.length || 1),
        topKeywords: [], // Would need to aggregate from call_keywords table
        sentimentBreakdown: {
          positive: calls?.filter(c => c.sentiment_overall === 'positive').length || 0,
          neutral: calls?.filter(c => c.sentiment_overall === 'neutral').length || 0,
          negative: calls?.filter(c => c.sentiment_overall === 'negative').length || 0
        },
        callsByType: this.aggregateCallsByType(calls || [])
      };

      return analytics;
    } catch (error) {
      console.error('❌ Error fetching call analytics:', error);
      return {
        totalCalls: 0,
        averageSentiment: 0,
        topKeywords: [],
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        callsByType: []
      };
    }
  }

  // Helper methods
  private inferSpeakerRole(name?: string): CallParticipant['role'] {
    if (!name) return 'other';
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('rep') || lowercaseName.includes('sales')) return 'rep';
    if (lowercaseName.includes('customer') || lowercaseName.includes('client')) return 'customer';
    if (lowercaseName.includes('prospect') || lowercaseName.includes('lead')) return 'prospect';
    return 'other';
  }

  private calculateSpeakingTime(
    speaker: TranscriptionResult['speakers'][0],
    allSpeakers: TranscriptionResult['speakers']
  ): number {
    const totalSegments = allSpeakers.reduce((sum, s) => sum + s.segments.length, 0);
    return totalSegments > 0 ? (speaker.segments.length / totalSegments) * 100 : 0;
  }

  private categorizeKeyword(keyword: string): string {
    const categories = {
      product: ['crm', 'software', 'platform', 'tool', 'feature'],
      business: ['budget', 'timeline', 'team', 'growth', 'expansion'],
      competitor: ['salesforce', 'hubspot', 'pipedrive', 'zoho'],
      emotion: ['excited', 'concerned', 'interested', 'worried']
    };

    const lowercaseKeyword = keyword.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => lowercaseKeyword.includes(k))) {
        return category;
      }
    }
    return 'general';
  }

  private getDateRange(timeRange: 'week' | 'month' | 'quarter'): Date {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private aggregateCallsByType(calls: any[]): { type: string; count: number }[] {
    const typeCounts = calls.reduce((acc, call) => {
      acc[call.call_type] = (acc[call.call_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  }
}

// Singleton instance
export const callIntegrationService = new CallIntegrationService();

// Export types
export type {
  CallRecord,
  CallParticipant,
  CallActionItem,
  CallKeyword,
  CRMIntegrationOptions
};

export default CallIntegrationService;


