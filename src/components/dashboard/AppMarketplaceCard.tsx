import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ShoppingBag, Zap, Bot, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const mockApps = [
  {
    id: 1,
    name: 'AI Email Assistant',
    icon: Bot,
    description: 'Automate and personalize your email outreach with AI.',
    price: 'Free'
  },
  {
    id: 2,
    name: 'Advanced Analytics',
    icon: Zap,
    description: 'Unlock deeper sales insights and custom dashboards.',
    price: '$9/mo'
  },
  {
    id: 3,
    name: 'Data Enrichment',
    icon: Shield,
    description: 'Auto-enrich contacts and companies with verified data.',
    price: 'Free'
  }
];

interface AppMarketplaceCardProps {
  loading?: boolean;
}

const AppMarketplaceCard: React.FC<AppMarketplaceCardProps> = ({ loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#23233a]/50 rounded w-1/3"></div>
          <div className="space-y-3">
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
        <h3 className="text-lg font-semibold text-white">App Marketplace</h3>
        <Button
          onClick={() => navigate('/marketplace')}
          variant="gradient"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
        >
          Go to Marketplace
        </Button>
      </div>
      <div className="space-y-3 flex-1">
        {mockApps.map((app) => (
          <div key={app.id} className="flex items-center justify-between bg-[#23233a]/30 rounded-xl p-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <app.icon className="w-5 h-5 text-[#a259ff]" />
                <span className="font-semibold text-white text-base">{app.name}</span>
                <Badge variant={app.price === 'Free' ? 'success' : 'warning'} size="xs">{app.price}</Badge>
              </div>
              <div className="text-[#b0b0d0] text-xs mt-1">{app.description}</div>
            </div>
            <Button
              onClick={() => navigate('/marketplace')}
              variant="secondary"
              size="sm"
              icon={ArrowRight}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppMarketplaceCard; 