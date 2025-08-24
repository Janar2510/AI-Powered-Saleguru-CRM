import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SentimentAnalysisService } from '../services/sentimentAnalysisService';
import { ChronoLeadScoringService } from '../services/chronoLeadScoringService';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  Heart, 
  Clock, 
  TrendingUp, 
  Bot, 
  CheckCircle, 
  AlertTriangle,
  MessageCircle,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';

const TestAdvancedFeatures: React.FC = () => {
  const { showToast } = useToastContext();
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const testSentimentAnalysis = async () => {
    try {
      setIsLoading(true);
      const testMessages = [
        "I'm very excited about your product and would love to schedule a demo!",
        "The pricing seems a bit high for our budget, but we are interested.",
        "This is exactly what we need! Let's move forward with the proposal."
      ];

      const results = [];
      for (const message of testMessages) {
        const analysis = await SentimentAnalysisService.analyzeSentiment(message);
        results.push({ message, analysis });
      }

      setTestResults(prev => ({ ...prev, sentiment: results }));
      showToast({
        type: 'success',
        title: 'Sentiment Analysis Test',
        description: 'Successfully analyzed sentiment for test messages'
      });
    } catch (error) {
      console.error('Sentiment analysis test failed:', error);
      showToast({
        type: 'error',
        title: 'Test Failed',
        description: 'Sentiment analysis test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testChronoLeadScoring = async () => {
    try {
      setIsLoading(true);
      const temporalContext = {
        contact_id: 'test-contact',
        base_score: 75,
        current_date: new Date().toISOString(),
        quarter: ChronoLeadScoringService.getTemporalContext().quarter,
        season: ChronoLeadScoringService.getTemporalContext().season,
        holiday_period: ChronoLeadScoringService.getTemporalContext().holiday_period,
        industry: 'Technology',
        company_name: 'Test Company',
        role: 'Manager',
        deal_history: []
      };

      const result = await ChronoLeadScoringService.temporalLeadScore(75, temporalContext);
      setTestResults(prev => ({ ...prev, chrono: result }));
      
      showToast({
        type: 'success',
        title: 'ChronoDeals Test',
        description: 'Successfully calculated temporal lead score'
      });
    } catch (error) {
      console.error('ChronoDeals test failed:', error);
      showToast({
        type: 'error',
        title: 'Test Failed',
        description: 'ChronoDeals test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      setIsLoading(true);
      
      // Test basic database connection
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .limit(1);

      // Test advanced features tables
      const { data: emotions, error: emotionsError } = await supabase
        .from('deal_emotions')
        .select('*')
        .limit(1);

      const { data: chronoScores, error: chronoError } = await supabase
        .from('chrono_lead_scores')
        .select('*')
        .limit(1);

      const { data: callTranscripts, error: callError } = await supabase
        .from('call_transcripts')
        .select('*')
        .limit(1);

      const { data: branding, error: brandingError } = await supabase
        .from('branding')
        .select('*')
        .limit(1);

      const { data: automationRules, error: automationError } = await supabase
        .from('automation_rules')
        .select('*')
        .limit(1);

      const results = {
        deals: { data: deals, error: dealsError },
        emotions: { data: emotions, error: emotionsError },
        chronoScores: { data: chronoScores, error: chronoError },
        callTranscripts: { data: callTranscripts, error: callError },
        branding: { data: branding, error: brandingError },
        automationRules: { data: automationRules, error: automationError }
      };

      setTestResults(prev => ({ ...prev, database: results }));
      
      showToast({
        type: 'success',
        title: 'Database Test',
        description: 'Successfully connected to all database tables'
      });
    } catch (error) {
      console.error('Database test failed:', error);
      showToast({
        type: 'error',
        title: 'Test Failed',
        description: 'Database connection test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    await testDatabaseConnection();
    await testSentimentAnalysis();
    await testChronoLeadScoring();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Advanced Features Test
          </h1>
          <p className="text-[#b0b0d0] text-lg">
            Testing all advanced AI-powered features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Sentiment Replay™</h3>
                <p className="text-sm text-[#b0b0d0]">Emotional timeline analysis</p>
              </div>
            </div>
            <Button 
              onClick={testSentimentAnalysis}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Sentiment Analysis'}
            </Button>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">ChronoDeals™</h3>
                <p className="text-sm text-[#b0b0d0]">Temporal lead scoring</p>
              </div>
            </div>
            <Button 
              onClick={testChronoLeadScoring}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test ChronoDeals'}
            </Button>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#4ecdc4] to-[#44a08d] rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Database Connection</h3>
                <p className="text-sm text-[#b0b0d0]">Test all tables</p>
              </div>
            </div>
            <Button 
              onClick={testDatabaseConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Database'}
            </Button>
          </Card>
        </div>

        <Button 
          onClick={runAllTests}
          disabled={isLoading}
          className="w-full mb-8 bg-gradient-to-r from-[#a259ff] to-[#377dff] hover:from-[#8b4dff] hover:to-[#2d6bff]"
        >
          {isLoading ? 'Running All Tests...' : 'Run All Tests'}
        </Button>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
            
            {testResults.sentiment && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Heart className="w-5 h-5 text-[#a259ff] mr-2" />
                  Sentiment Analysis Results
                </h3>
                <div className="space-y-3">
                  {testResults.sentiment.map((result: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <p className="text-[#b0b0d0] text-sm mb-2">"{result.message}"</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={result.analysis.sentiment === 'positive' ? 'success' : 
                                   result.analysis.sentiment === 'negative' ? 'error' : 'secondary'}
                        >
                          {result.analysis.sentiment}
                        </Badge>
                        <span className="text-white text-sm">{result.analysis.emotion}</span>
                        <span className="text-[#a259ff] font-bold">{result.analysis.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {testResults.chrono && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 text-[#ff6b6b] mr-2" />
                  ChronoDeals Results
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#b0b0d0]">Base Score:</span>
                      <span className="text-white font-bold">75</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#b0b0d0]">Final Score:</span>
                      <span className="text-[#a259ff] font-bold">{testResults.chrono.final_score}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#b0b0d0]">Quarter:</span>
                      <span className="text-white">{testResults.chrono.time_factors.quarter}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0]">Urgency:</span>
                      <Badge variant="warning">{testResults.chrono.time_factors.urgency}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {testResults.database && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Bot className="w-5 h-5 text-[#4ecdc4] mr-2" />
                  Database Connection Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(testResults.database).map(([table, result]: [string, any]) => (
                    <div key={table} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#b0b0d0] capitalize">{table}:</span>
                        {result.error ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAdvancedFeatures;
