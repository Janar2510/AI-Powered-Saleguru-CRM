import React from 'react';
import { 
  DollarSign, User, Calendar, Building2, MoreHorizontal, Mail, Clock, TrendingUp, Tag, CheckCircle, XCircle, Activity, Eye, Edit, Trash2 
} from 'lucide-react';
import { Deal } from '../../types/deals';
import Card from '../ui/Card';
import { format } from 'date-fns';

type DealCardProps = {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  selectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (dealId: string, selected: boolean) => void;
};

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onEdit,
  onView,
  onDelete,
  selectMode = false,
  isSelected = false,
  onSelect
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'open': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div
      className={`relative group cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 rounded-xl ${isSelected ? 'border-accent bg-accent/10' : ''}`}
      onClick={() => onView(deal)}
    >
      {/* Action menu button - absolute top right */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={e => { e.stopPropagation(); setShowActions(!showActions); }}
          className="p-1 rounded-full hover:bg-dark-200/70 focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
          tabIndex={0}
        >
          <MoreHorizontal className="w-5 h-5 text-dark-400" />
        </button>
        {showActions && (
          <div className="absolute right-0 mt-2 w-48 bg-[#181C20] border border-dark-700 rounded-lg shadow-2xl z-30">
            <div className="py-1">
              <button onClick={e => { e.stopPropagation(); onView(deal); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-700 flex items-center space-x-2"><Eye className="w-4 h-4" /><span>View Details</span></button>
              <button onClick={e => { e.stopPropagation(); onEdit(deal); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-700 flex items-center space-x-2"><Edit className="w-4 h-4" /><span>Edit Deal</span></button>
              <button onClick={e => { e.stopPropagation(); onDelete(deal); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
            </div>
          </div>
        )}
      </div>
      <Card
        className={`p-4 bg-surface/90 backdrop-blur-sm border ${isSelected ? 'border-accent bg-accent/10' : 'border-dark-200 hover:border-dark-300'}`}
      >
        <div className="flex items-start justify-between mb-2">
          {selectMode && onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => { e.stopPropagation(); onSelect(deal.id, e.target.checked); }}
              className="w-4 h-4 text-accent bg-dark-200 border-dark-300 rounded focus:ring-accent focus:ring-2 mr-2 mt-1"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-accent transition-colors">{deal.title}</h3>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono text-primary-400 bg-primary-600/10 px-2 py-1 rounded">{deal.id.slice(0, 8)}</span>
              {deal.stage && (
                <span className="text-xs px-2 py-1 bg-dark-200/50 text-dark-300 rounded-full">{deal.stage.name}</span>
              )}
              {deal.status && (
                <span className="flex items-center space-x-1 text-xs ml-2">{getStatusIcon(deal.status)}<span className="capitalize">{deal.status}</span></span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="font-semibold text-white">{formatCurrency(deal.value)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{deal.probability}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <Building2 className="w-3 h-3 text-dark-400" />
          <span className="text-sm text-dark-300 truncate">{deal.company && deal.company.name ? deal.company.name : 'Unknown Company'}</span>
          <User className="w-3 h-3 text-dark-400 ml-3" />
          <span className="text-sm text-dark-300 truncate">{deal.contact && deal.contact.name ? deal.contact.name : 'Unknown Contact'}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 text-dark-400" />
            <span className="text-xs text-dark-400">{format(new Date(deal.created_at), 'MMM d, yyyy')}</span>
          </div>
          {deal.priority && (
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(deal.priority)}`}>{deal.priority} Priority</span>
          )}
        </div>
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {deal.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">{tag}</span>
            ))}
            {deal.tags.length > 2 && (
              <span className="text-xs px-2 py-1 bg-dark-200/50 text-dark-400 rounded-full">+{deal.tags.length - 2}</span>
            )}
          </div>
        )}
        <div className="flex items-center space-x-3 text-xs text-dark-400">
          <div className="flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{deal.emails_count || 0}</span></div>
          <div className="flex items-center space-x-1"><Activity className="w-3 h-3" /><span>{deal.activities_count || 0}</span></div>
        </div>
      </Card>
    </div>
  );
}; 