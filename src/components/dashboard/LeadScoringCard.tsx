import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { User, TrendingUp, TrendingDown, Bot, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

const mockLeads = [
  {
    id: 1,
    name: 'John Smith',
    company: 'TechCorp Inc.',
    score: 97,
    status: 'hot',
    won: 2,
    lost: 0,
    lastActivity: '2d ago',
    guru: true
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    company: 'StartupXYZ',
    score: 89,
    status: 'warm',
    won: 1,
    lost: 1,
    lastActivity: '1d ago',
    guru: false
  },
  {
    id: 3,
    name: 'Mike Chen',
    company: 'FinanceCore',
    score: 82,
    status: 'warm',
    won: 0,
    lost: 1,
    lastActivity: '3d ago',
    guru: false
  }
];

interface LeadScoringCardProps {
  loading?: boolean;
}

const LeadScoringCard: React.FC<LeadScoringCardProps> = ({ loading }) => {
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#23233a]/50 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#23233a]/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Top Priority Leads</h3>
        <Badge variant="success" size="sm">AI Scored</Badge>
      </div>
      <div className="space-y-4 flex-1">
        {mockLeads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between bg-[#23233a]/30 rounded-xl p-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-white text-base">{lead.name}</span>
                {lead.status === 'hot' && <Badge variant="danger" size="sm">HOT</Badge>}
                {lead.status === 'warm' && <Badge variant="warning" size="sm">WARM</Badge>}
                {lead.guru && <Badge variant="success" size="sm">Guru</Badge>}
              </div>
              <div className="text-[#b0b0d0] text-xs">{lead.company}</div>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-[#a259ff] text-xs">Score: <span className="font-bold text-white">{lead.score}</span></span>
                <span className="text-[#43e7ad] text-xs">Won: <span className="font-bold">{lead.won}</span></span>
                <span className="text-[#ef4444] text-xs">Lost: <span className="font-bold">{lead.lost}</span></span>
                <span className="text-[#b0b0d0] text-xs">• {lead.lastActivity} ago</span>
              </div>
            </div>
            <Button 
              variant="secondary"
              size="sm"
              icon={ArrowRight}
              className="ml-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadScoringCard; 