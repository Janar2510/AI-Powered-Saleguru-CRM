import React from 'react';
import { Grid, List, Table, Layout } from 'lucide-react';

export type ViewMode = 'cards' | 'table' | 'list' | 'grid';

interface ViewChooserProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
  className?: string;
}

const ViewChooser: React.FC<ViewChooserProps> = ({
  currentView,
  onViewChange,
  availableViews = ['cards', 'table', 'list', 'grid'],
  className = ''
}) => {
  const viewConfigs = {
    cards: {
      icon: Layout,
      label: 'Cards',
      title: 'Card View'
    },
    table: {
      icon: Table,
      label: 'Table',
      title: 'Table View'
    },
    list: {
      icon: List,
      label: 'List',
      title: 'List View'
    },
    grid: {
      icon: Grid,
      label: 'Grid',
      title: 'Grid View'
    }
  };

  return (
    <div className={`flex items-center bg-[#23233a] rounded-lg p-1 ${className}`}>
      {availableViews.map((view) => {
        const config = viewConfigs[view];
        const Icon = config.icon;
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`p-2 rounded-md transition-colors ${
              isActive
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white'
            }`}
            title={config.title}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};

export default ViewChooser; 