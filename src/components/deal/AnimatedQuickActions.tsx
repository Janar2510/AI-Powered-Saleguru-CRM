import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Quote,
  ShoppingCart,
  Calendar,
  Mail,
  BellRing,
  Share2,
  Copy,
  Archive,
  Download,
  MoreHorizontal,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react';
import { BrandCard, BrandButton } from '../../contexts/BrandDesignContext';
import { useDealActions } from '../../hooks/useDealActions';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
  category: 'primary' | 'secondary' | 'utility';
  disabled?: boolean;
  badge?: string | number;
}

interface AnimatedQuickActionsProps {
  dealId: string;
  onAddNote: () => void;
  onCreateQuote: () => void;
  onScheduleMeeting: () => void;
  onSendEmail: () => void;
  onCreateTask: () => void;
  onConvertToOrder?: () => void;
  className?: string;
}

export const AnimatedQuickActions: React.FC<AnimatedQuickActionsProps> = ({
  dealId,
  onAddNote,
  onCreateQuote,
  onScheduleMeeting,
  onSendEmail,
  onCreateTask,
  onConvertToOrder,
  className = '',
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const { isLoading } = useDealActions(dealId);

  const quickActions: QuickAction[] = [
    // Primary Actions
    {
      id: 'add-note',
      label: 'Add Note',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: onAddNote,
      category: 'primary',
    },
    {
      id: 'create-quote',
      label: 'Create Quote',
      icon: Quote,
      color: 'from-green-500 to-green-600',
      action: onCreateQuote,
      category: 'primary',
    },
    {
      id: 'convert-order',
      label: 'Convert to Order',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      action: onConvertToOrder || (() => console.log('Convert to order')),
      category: 'primary',
      disabled: !onConvertToOrder,
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      action: onScheduleMeeting,
      category: 'primary',
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: Mail,
      color: 'from-indigo-500 to-indigo-600',
      action: onSendEmail,
      category: 'primary',
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: BellRing,
      color: 'from-pink-500 to-pink-600',
      action: onCreateTask,
      category: 'primary',
    },

    // Secondary Actions
    {
      id: 'log-call',
      label: 'Log Call',
      icon: Phone,
      color: 'from-emerald-500 to-emerald-600',
      action: () => console.log('Log call'),
      category: 'secondary',
    },
    {
      id: 'send-sms',
      label: 'Send SMS',
      icon: MessageSquare,
      color: 'from-cyan-500 to-cyan-600',
      action: () => console.log('Send SMS'),
      category: 'secondary',
    },
    {
      id: 'update-stage',
      label: 'Update Stage',
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600',
      action: () => console.log('Update stage'),
      category: 'secondary',
    },
    {
      id: 'set-reminder',
      label: 'Set Reminder',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      action: () => console.log('Set reminder'),
      category: 'secondary',
    },

    // Utility Actions
    {
      id: 'share-deal',
      label: 'Share Deal',
      icon: Share2,
      color: 'from-slate-500 to-slate-600',
      action: () => console.log('Share deal'),
      category: 'utility',
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      color: 'from-slate-500 to-slate-600',
      action: () => console.log('Duplicate deal'),
      category: 'utility',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      color: 'from-slate-500 to-slate-600',
      action: () => console.log('Archive deal'),
      category: 'utility',
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      color: 'from-slate-500 to-slate-600',
      action: () => console.log('Export deal'),
      category: 'utility',
    },
  ];

  const primaryActions = quickActions.filter(a => a.category === 'primary');
  const secondaryActions = quickActions.filter(a => a.category === 'secondary');
  const utilityActions = quickActions.filter(a => a.category === 'utility');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const actionVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
  };

  const ActionButton: React.FC<{ action: QuickAction; size?: 'sm' | 'lg' }> = ({ 
    action, 
    size = 'lg' 
  }) => (
    <motion.div
      variants={actionVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      <BrandButton
        variant="secondary"
        className={`
          flex flex-col items-center space-y-2 h-auto relative overflow-hidden
          ${size === 'lg' ? 'py-4 px-3' : 'py-2 px-2'}
          ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={action.disabled ? undefined : action.action}
        disabled={action.disabled || isLoading}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10`} />
        
        {/* Icon */}
        <action.icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} relative z-10`} />
        
        {/* Label */}
        <span className={`${size === 'lg' ? 'text-xs' : 'text-xs'} font-medium relative z-10`}>
          {action.label}
        </span>

        {/* Badge */}
        {action.badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {action.badge}
          </motion.div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </BrandButton>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-4 ${className}`}
    >
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCompact(!isCompact)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Target className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Primary Actions Grid */}
          <motion.div 
            layout
            className={`grid gap-3 ${
              isCompact 
                ? 'grid-cols-6 sm:grid-cols-8 lg:grid-cols-12' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            }`}
          >
            {primaryActions.map((action) => (
              <ActionButton 
                key={action.id} 
                action={action} 
                size={isCompact ? 'sm' : 'lg'} 
              />
            ))}
          </motion.div>

          {/* Expandable Secondary Actions */}
          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpandedCategory(
                expandedCategory === 'secondary' ? null : 'secondary'
              )}
              className="flex items-center space-x-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <motion.div
                animate={{ rotate: expandedCategory === 'secondary' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.div>
              <span>More Actions</span>
            </motion.button>

            <AnimatePresence>
              {expandedCategory === 'secondary' && (
                <motion.div
                  variants={expandVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {secondaryActions.map((action) => (
                      <ActionButton key={action.id} action={action} size="sm" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Utility Actions Bar */}
          <motion.div 
            layout
            className="flex items-center justify-between mt-4 pt-4 border-t border-white/10"
          >
            <div className="flex space-x-2">
              {utilityActions.slice(0, 3).map((action) => (
                <motion.div
                  key={action.id}
                  variants={actionVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <BrandButton size="sm" variant="secondary" onClick={action.action}>
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </BrandButton>
                </motion.div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <motion.div
                variants={actionVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <BrandButton 
                  size="sm" 
                  variant="secondary"
                  onClick={utilityActions.find(a => a.id === 'export')?.action}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </BrandButton>
              </motion.div>
              
              <motion.div
                variants={actionVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <BrandButton size="sm" variant="secondary">
                  <MoreHorizontal className="w-4 h-4" />
                </BrandButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </BrandCard>
    </motion.div>
  );
};

export default AnimatedQuickActions;


