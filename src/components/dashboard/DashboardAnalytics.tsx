import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '../analytics/AnalyticsChart';
import { createClient } from '@supabase/supabase-js';
import Card from '../ui/Card';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface DashboardAnalyticsProps {
  className?: string;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  className = ''
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    pipeline: [] as {id: string, name: string, value: number, color: string}[],
    conversion: [] as {id: string, name: string, value: number, color: string}[]
  });
  
  // CRM color palette from the screenshot
  const colorPalette = {
    lead: '#6b7280',         // Gray
    qualified: '#3b82f6',    // Blue
    proposal: '#eab308',     // Yellow
    negotiation: '#f97316',  // Orange
    'closed-won': '#22c55e', // Green
    'closed-lost': '#ef4444',// Red
    primary: '#7c3aed',      // Purple
    secondary: '#22c55e',    // Green
    accent: '#3b82f6',       // Blue
  };
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Fetch deals
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('*');
        
        if (dealsError) throw dealsError;
        
        // Fetch stages
        const { data: stages, error: stagesError } = await supabase
          .from('stages')
          .select('*')
          .order('sort_order');
        
        if (stagesError) throw stagesError;
        
        // Process data
        const dealsData = deals || [];
        const stagesData = stages || [];
        
        // Calculate deals by stage
        const dealsByStage = stagesData.map((stage) => {
          const stageDeals = dealsData.filter(deal => deal.stage_id === stage.id);
          
          // Determine color based on stage
          let color = colorPalette[stage.id as keyof typeof colorPalette] || colorPalette.primary;
          
          return {
            id: stage.id,
            name: stage.name,
            value: stageDeals.length,
            color
          };
        });
        
        // Calculate stage conversion rates
        const stageConversions = [];
        for (let i = 0; i < stagesData.length - 1; i++) {
          const fromStage = stagesData[i];
          const toStage = stagesData[i + 1];
          
          const fromCount = dealsData.filter(deal => deal.stage_id === fromStage.id).length;
          const toCount = dealsData.filter(deal => deal.stage_id === toStage.id).length;
          
          const conversionRate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;
          
          stageConversions.push({
            id: `${fromStage.id}-to-${toStage.id}`,
            name: `${fromStage.name} → ${toStage.name}`,
            value: Math.round(conversionRate),
            color: colorPalette.primary
          });
        }
        
        setAnalyticsData({
          pipeline: dealsByStage,
          conversion: stageConversions
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 ${className}`}>
      <Card className="bg-white/10 backdrop-blur-md">
        <AnalyticsChart
          title="Pipeline Breakdown"
          description="Distribution of deals across stages"
          data={analyticsData.pipeline}
          type="funnel"
          height={250}
          isLoading={isLoading}
          showControls={false}
        />
      </Card>
      
      <Card className="bg-white/10 backdrop-blur-md">
        <AnalyticsChart
          title="Stage Conversion"
          description="Success rate between pipeline stages"
          data={analyticsData.conversion}
          type="bar"
          height={250}
          isLoading={isLoading}
          showControls={false}
        />
      </Card>
      
      <div className="lg:col-span-2 flex justify-center">
        <button
          onClick={() => navigate('/analytics')}
          className="btn-primary flex items-center space-x-2"
        >
          <span>View Full Analytics Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DashboardAnalytics;