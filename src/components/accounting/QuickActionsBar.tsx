import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Home, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Calculator, 
  Calendar,
  Quote,
  KanbanSquare,
  UserRound,
  Building2,
  Package,
  Sparkles
} from 'lucide-react';
import { BrandCard, BrandButton } from '../../contexts/BrandDesignContext';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  path: string;
}

interface QuickActionsBarProps {
  currentPage?: string;
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ 
  currentPage,
  className = "" 
}) => {
  const navigate = useNavigate();

  const allActions: QuickAction[] = [
    {
      title: 'Dashboard',
      description: 'Main CRM overview',
      icon: Home,
      color: 'blue',
      path: '/'
    },
    {
      title: 'Deals',
      description: 'Manage sales pipeline',
      icon: KanbanSquare,
      color: 'blue',
      path: '/deals'
    },
    {
      title: 'Contacts',
      description: 'Manage customer contacts',
      icon: UserRound,
      color: 'green',
      path: '/contacts'
    },
    {
      title: 'Organizations',
      description: 'Manage companies',
      icon: Building2,
      color: 'purple',
      path: '/organizations'
    },
    {
      title: 'Products',
      description: 'Product catalog',
      icon: Package,
      color: 'orange',
      path: '/products'
    },
    {
      title: 'Leads',
      description: 'Lead management',
      icon: Sparkles,
      color: 'green',
      path: '/leads'
    }
  ];

  // Filter out current page
  const availableActions = allActions.filter(action => action.path !== currentPage);

  return (
    <BrandCard borderGradient="accent" className={`p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Quick Actions
        </h3>
        <div className="flex space-x-2">
          {availableActions.slice(0, 6).map((action) => {
            const IconComponent = action.icon;
            return (
              <BrandButton
                key={action.path}
                variant="secondary"
                onClick={() => navigate(action.path)}
                className="h-10 px-3 flex items-center space-x-2 hover:scale-105 transition-transform"
                title={action.description}
              >
                <IconComponent className={`w-4 h-4 ${
                  action.color === 'blue' ? 'text-blue-400' :
                  action.color === 'green' ? 'text-green-400' :
                  action.color === 'purple' ? 'text-purple-400' :
                  action.color === 'orange' ? 'text-orange-400' :
                  action.color === 'red' ? 'text-red-400' :
                  'text-gray-400'
                }`} />
                <span className="text-sm hidden sm:inline">{action.title}</span>
              </BrandButton>
            );
          })}
        </div>
      </div>
    </BrandCard>
  );
};

export default QuickActionsBar;
