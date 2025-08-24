import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '../analytics/AnalyticsChart';
import Bar3DChart from '../analytics/3DBarChart';
import { supabase } from '../../services/supabase';
import { Button } from '../ui/Button';

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
      <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-4 lg:p-6 min-h-[340px]">
        <AnalyticsChart
          title="Pipeline Breakdown"
          data={analyticsData.pipeline.length ? analyticsData.pipeline : [
            { id: '1', name: 'Qualified', value: 10 },
            { id: '2', name: 'Lead', value: 7 },
            { id: '3', name: 'Proposal', value: 5 },
            { id: '4', name: 'Negotiation', value: 3 },
            { id: '5', name: 'Closed Won', value: 2 }
          ]}
          type="bar"
          height={250}
          showControls={true}
          disableCardStyling={true}
        />
      </div>
      
      <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-4 lg:p-6 min-h-[340px]">
        <AnalyticsChart
          title="Stage Conversion"
          data={analyticsData.conversion.length ? analyticsData.conversion : [
            { id: '1', name: 'Qualified → Lead', value: 60 },
            { id: '2', name: 'Lead → Proposal', value: 40 },
            { id: '3', name: 'Proposal → Negotiation', value: 30 },
            { id: '4', name: 'Negotiation → Closed Won', value: 20 }
          ]}
          type="bar"
          height={250}
          showControls={true}
          disableCardStyling={true}
        />
      </div>
      
      <div className="lg:col-span-2 flex justify-center">
        <Button
          onClick={() => navigate('/analytics')}
          variant="gradient"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
        >
          View Full Analytics Dashboard
        </Button>
      </div>
    </div>
  );
};

export default DashboardAnalytics;