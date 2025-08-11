import { supabase } from './supabase';
import { openaiService } from './openaiService';

export interface DealEmotion {
  id: string;
  deal_id: string;
  user_id: string;
  source: 'email' | 'call' | 'chat' | 'meeting' | 'note';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  emotion: string;
  score: number;
  timestamp: string;
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  emotion: string;
  score: number;
  reasoning: string;
}

export class SentimentAnalysisService {
  // Analyze sentiment of content using AI
  static async analyzeSentiment(content: string): Promise<SentimentAnalysisResult> {
    try {
      const prompt = `Analyze the emotional sentiment of the following message: "${content}"

Consider:
- Overall sentiment (positive, neutral, negative)
- Specific emotion (excited, hesitant, confident, concerned, etc.)
- Emotional intensity (0-100 score)
- Context clues and tone

Return a JSON object with:
{
  "sentiment": "positive|neutral|negative",
  "emotion": "specific emotion word",
  "score": number (0-100),
  "reasoning": "brief explanation"
}`;

      const response = await openaiService.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing emotional sentiment in business communications. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const responseContent = response.choices[0].message.content;
      if (responseContent) {
        const result = JSON.parse(responseContent);
        return {
          sentiment: result.sentiment,
          emotion: result.emotion,
          score: Math.min(100, Math.max(0, result.score)),
          reasoning: result.reasoning
        };
      }

      // Fallback response
      return {
        sentiment: 'neutral',
        emotion: 'neutral',
        score: 50,
        reasoning: 'Unable to analyze sentiment'
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment: 'neutral',
        emotion: 'neutral',
        score: 50,
        reasoning: 'Error in sentiment analysis'
      };
    }
  }

  // Create or update deal emotion record
  static async createDealEmotion(
    dealId: string,
    userId: string,
    source: DealEmotion['source'],
    content: string
  ): Promise<DealEmotion> {
    try {
      // Analyze sentiment
      const analysis = await this.analyzeSentiment(content);

      // Insert into database
      const { data, error } = await supabase
        .from('deal_emotions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          source,
          content,
          sentiment: analysis.sentiment,
          emotion: analysis.emotion,
          score: analysis.score
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating deal emotion:', error);
      throw error;
    }
  }

  // Get all emotions for a deal
  static async getDealEmotions(dealId: string): Promise<DealEmotion[]> {
    try {
      const { data, error } = await supabase
        .from('deal_emotions')
        .select('*')
        .eq('deal_id', dealId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching deal emotions:', error);
      return [];
    }
  }

  // Get sentiment summary for a deal
  static async getDealSentimentSummary(dealId: string): Promise<{
    averageScore: number;
    sentimentTrend: 'improving' | 'declining' | 'stable';
    dominantEmotion: string;
    totalInteractions: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
  }> {
    try {
      const emotions = await this.getDealEmotions(dealId);
      
      if (emotions.length === 0) {
        return {
          averageScore: 50,
          sentimentTrend: 'stable',
          dominantEmotion: 'neutral',
          totalInteractions: 0,
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0
        };
      }

      const scores = emotions.map(e => e.score);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      // Determine trend (compare first half vs second half)
      const midPoint = Math.floor(emotions.length / 2);
      const firstHalfAvg = emotions.slice(0, midPoint).reduce((sum, e) => sum + e.score, 0) / midPoint;
      const secondHalfAvg = emotions.slice(midPoint).reduce((sum, e) => sum + e.score, 0) / (emotions.length - midPoint);
      
      let sentimentTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg + 10) sentimentTrend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 10) sentimentTrend = 'declining';

      // Count sentiments
      const positiveCount = emotions.filter(e => e.sentiment === 'positive').length;
      const negativeCount = emotions.filter(e => e.sentiment === 'negative').length;
      const neutralCount = emotions.filter(e => e.sentiment === 'neutral').length;

      // Find dominant emotion
      const emotionCounts = emotions.reduce((acc, e) => {
        acc[e.emotion] = (acc[e.emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantEmotion = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

      return {
        averageScore: Math.round(averageScore),
        sentimentTrend,
        dominantEmotion,
        totalInteractions: emotions.length,
        positiveCount,
        negativeCount,
        neutralCount
      };
    } catch (error) {
      console.error('Error getting sentiment summary:', error);
      return {
        averageScore: 50,
        sentimentTrend: 'stable',
        dominantEmotion: 'neutral',
        totalInteractions: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0
      };
    }
  }

  // Get emotions for all deals (for dashboard)
  static async getAllDealEmotions(): Promise<{
    dealId: string;
    dealTitle: string;
    averageScore: number;
    sentimentTrend: 'improving' | 'declining' | 'stable';
    lastInteraction: string;
    totalInteractions: number;
  }[]> {
    try {
      const { data: emotions, error } = await supabase
        .from('deal_emotions')
        .select(`
          *,
          deals!inner(title)
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by deal
      const dealGroups = emotions.reduce((acc, emotion) => {
        const dealId = emotion.deal_id;
        if (!acc[dealId]) {
          acc[dealId] = {
            dealId,
            dealTitle: emotion.deals?.title || 'Unknown Deal',
            emotions: []
          };
        }
        acc[dealId].emotions.push(emotion);
        return acc;
      }, {} as Record<string, { dealId: string; dealTitle: string; emotions: any[] }>);

      // Calculate summaries for each deal
      return Object.values(dealGroups).map(deal => {
        const scores = deal.emotions.map(e => e.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        // Determine trend
        const sortedEmotions = deal.emotions.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const midPoint = Math.floor(sortedEmotions.length / 2);
        const firstHalfAvg = sortedEmotions.slice(0, midPoint).reduce((sum, e) => sum + e.score, 0) / midPoint;
        const secondHalfAvg = sortedEmotions.slice(midPoint).reduce((sum, e) => sum + e.score, 0) / (sortedEmotions.length - midPoint);
        
        let sentimentTrend: 'improving' | 'declining' | 'stable' = 'stable';
        if (secondHalfAvg > firstHalfAvg + 10) sentimentTrend = 'improving';
        else if (secondHalfAvg < firstHalfAvg - 10) sentimentTrend = 'declining';

        return {
          dealId: deal.dealId,
          dealTitle: deal.dealTitle,
          averageScore: Math.round(averageScore),
          sentimentTrend,
          lastInteraction: deal.emotions[0]?.timestamp || '',
          totalInteractions: deal.emotions.length
        };
      });
    } catch (error) {
      console.error('Error getting all deal emotions:', error);
      return [];
    }
  }
} 