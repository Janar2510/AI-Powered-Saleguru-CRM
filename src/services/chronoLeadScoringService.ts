import { supabase } from './supabase';
import { openaiService } from './openaiService';

export interface ChronoLeadScore {
  id: string;
  contact_id: string;
  base_score: number;
  time_factors: {
    quarter?: string;
    holiday?: string;
    season?: string;
    urgency?: string;
    industry_trend?: string;
    company_history?: string;
    role_timing?: string;
    [key: string]: any;
  };
  final_score: number;
  created_at: string;
  updated_at: string;
}

export interface TemporalContext {
  contact_id: string;
  base_score: number;
  current_date: string;
  quarter: string;
  holiday_period?: string;
  season: string;
  industry: string;
  company_name: string;
  role: string;
  deal_history?: any[];
}

export class ChronoLeadScoringService {
  // Calculate temporal lead score using AI
  static async temporalLeadScore(base: number, context: TemporalContext): Promise<{ final_score: number; time_factors: any; reasoning: string }> {
    try {
      const prompt = `
        You are a temporal lead scoring AI that adjusts lead scores based on timing, season, quarter, holidays, and roles.
        
        Base Score: ${base}
        Current Date: ${context.current_date}
        Quarter: ${context.quarter}
        Season: ${context.season}
        Industry: ${context.industry}
        Company: ${context.company_name}
        Role: ${context.role}
        ${context.holiday_period ? `Holiday Period: ${context.holiday_period}` : ''}
        ${context.deal_history ? `Deal History: ${JSON.stringify(context.deal_history)}` : ''}
        
        Analyze the temporal factors and adjust the base score. Consider:
        1. Quarter urgency (Q4 typically highest urgency)
        2. Holiday periods (pre/post holiday behavior)
        3. Seasonal trends in the industry
        4. Company's historical deal patterns
        5. Role-specific timing (C-level vs manager vs individual contributor)
        6. Industry-specific timing patterns
        
        Return a JSON object with:
        {
          "final_score": number (0-100),
          "time_factors": {
            "quarter": "Q1/Q2/Q3/Q4",
            "holiday": "pre-holiday/post-holiday/none",
            "season": "spring/summer/fall/winter",
            "urgency": "low/medium/high",
            "industry_trend": "string",
            "company_history": "string",
            "role_timing": "string"
          },
          "reasoning": "Detailed explanation of score adjustment"
        }
      `;

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a temporal lead scoring expert. Always return valid JSON with the exact structure requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        final_score: Math.min(100, Math.max(0, result.final_score)),
        time_factors: result.time_factors,
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('Error in temporal lead scoring:', error);
      // Fallback to base score with minimal time factors
      return {
        final_score: base,
        time_factors: {
          quarter: context.quarter,
          season: context.season,
          urgency: 'medium'
        },
        reasoning: 'Fallback calculation due to AI service error'
      };
    }
  }

  // Get current temporal context
  static getTemporalContext(): { quarter: string; season: string; holiday_period?: string } {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Determine quarter
    let quarter = 'Q1';
    if (month >= 4 && month <= 6) quarter = 'Q2';
    else if (month >= 7 && month <= 9) quarter = 'Q3';
    else if (month >= 10 && month <= 12) quarter = 'Q4';

    // Determine season
    let season = 'spring';
    if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'fall';
    else if (month === 12 || month <= 2) season = 'winter';

    // Determine holiday period
    let holiday_period: string | undefined;
    if ((month === 11 && day >= 20) || (month === 12 && day <= 31)) {
      holiday_period = 'holiday-season';
    } else if (month === 1 && day <= 15) {
      holiday_period = 'post-holiday';
    } else if (month === 7 && day >= 1 && day <= 7) {
      holiday_period = 'independence-day';
    } else if (month === 12 && day >= 20 && day <= 31) {
      holiday_period = 'year-end';
    }

    return { quarter, season, holiday_period };
  }

  // Apply quarter boosts
  static applyQuarterBoosts(baseScore: number, quarter: string): number {
    const quarterMultipliers = {
      'Q1': 1.0, // Baseline
      'Q2': 1.1, // Slight increase
      'Q3': 1.2, // Summer activity
      'Q4': 1.4  // Year-end urgency
    };
    return baseScore * (quarterMultipliers[quarter as keyof typeof quarterMultipliers] || 1.0);
  }

  // Adjust for holidays
  static adjustForHolidays(baseScore: number, holiday_period?: string): number {
    const holidayAdjustments = {
      'holiday-season': 1.3, // Pre-holiday urgency
      'post-holiday': 0.9,   // Post-holiday slowdown
      'independence-day': 0.8, // Summer holiday
      'year-end': 1.5        // Year-end urgency
    };
    return baseScore * (holidayAdjustments[holiday_period as keyof typeof holidayAdjustments] || 1.0);
  }

  // Get chrono lead score for a contact
  static async getChronoLeadScore(contactId: string): Promise<ChronoLeadScore | null> {
    try {
      const { data, error } = await supabase
        .from('chrono_lead_scores')
        .select('*')
        .eq('contact_id', contactId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching chrono lead score:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getChronoLeadScore:', error);
      return null;
    }
  }

  // Create or update chrono lead score
  static async createOrUpdateChronoLeadScore(
    contactId: string,
    baseScore: number,
    temporalContext: TemporalContext
  ): Promise<ChronoLeadScore> {
    try {
      // Calculate temporal score using AI
      const temporalResult = await this.temporalLeadScore(baseScore, temporalContext);

      // Check if score already exists
      const existingScore = await this.getChronoLeadScore(contactId);

      if (existingScore) {
        // Update existing score
        const { data, error } = await supabase
          .from('chrono_lead_scores')
          .update({
            base_score: baseScore,
            time_factors: temporalResult.time_factors,
            final_score: temporalResult.final_score,
            updated_at: new Date().toISOString()
          })
          .eq('contact_id', contactId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new score
        const { data, error } = await supabase
          .from('chrono_lead_scores')
          .insert({
            contact_id: contactId,
            base_score: baseScore,
            time_factors: temporalResult.time_factors,
            final_score: temporalResult.final_score
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error in createOrUpdateChronoLeadScore:', error);
      throw error;
    }
  }

  // Get all chrono lead scores for current user
  static async getAllChronoLeadScores(): Promise<ChronoLeadScore[]> {
    try {
      const { data, error } = await supabase
        .from('chrono_lead_scores')
        .select('*')
        .order('final_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getAllChronoLeadScores:', error);
      return [];
    }
  }

  // Get temporal insights for dashboard
  static async getTemporalInsights(): Promise<any> {
    try {
      const scores = await this.getAllChronoLeadScores();
      const temporalContext = this.getTemporalContext();

      const insights = {
        total_leads: scores.length,
        average_score: scores.length > 0 ? scores.reduce((sum, score) => sum + score.final_score, 0) / scores.length : 0,
        high_priority_leads: scores.filter(score => score.final_score >= 80).length,
        quarter_distribution: scores.reduce((acc, score) => {
          const quarter = score.time_factors?.quarter || 'unknown';
          acc[quarter] = (acc[quarter] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        urgency_distribution: scores.reduce((acc, score) => {
          const urgency = score.time_factors?.urgency || 'medium';
          acc[urgency] = (acc[urgency] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        current_context: temporalContext
      };

      return insights;
    } catch (error) {
      console.error('Error in getTemporalInsights:', error);
      return {
        total_leads: 0,
        average_score: 0,
        high_priority_leads: 0,
        quarter_distribution: {},
        urgency_distribution: {},
        current_context: this.getTemporalContext()
      };
    }
  }
} 