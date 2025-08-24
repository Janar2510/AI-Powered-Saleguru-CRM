import React, { useState, useEffect } from 'react';
import { Zap, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useGuru } from '../../contexts/GuruContext';
import { useLocation } from 'react-router-dom';
import GuruAISettings from './GuruAISettings';
import { useFeatureLock } from '../../hooks/useFeatureLock';
import { useDevMode } from '../../contexts/DevModeContext';

const GuruFloatingButton: React.FC = () => {
  const { isOpen, openGuru, usageCount, usageLimit } = useGuru() as any;
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();
  const { currentPlan } = useDevMode();
  const { withFeatureAccess, FeatureLockModal } = useFeatureLock(currentPlan);

  // Remove API key initialization from localStorage
  useEffect(() => {
    // No longer need to initialize API key in localStorage
    // The API key is now securely stored on the server
  }, []);

  if (isOpen) return null;

  // Get contextual tooltip based on current page
  const getContextualTooltip = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/':
      case '/dashboard':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Summarize my pipeline" or "What needs attention?"'
        };
      case '/deals':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Analyze stuck deals" or "Show high-value opportunities"'
        };
      case '/leads':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Which leads should I prioritize?" or "Score analysis"'
        };
      case '/contacts':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Find high-engagement contacts" or "Segment by industry"'
        };
      case '/companies':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Which companies have the most deals?" or "Find inactive accounts"'
        };
      case '/tasks':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Prioritize my tasks" or "What\'s overdue?"'
        };
      case '/emails':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Draft follow-up email" or "Summarize unread emails"'
        };
      case '/analytics':
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Try: "Generate sales report" or "Show conversion trends"'
        };
      default:
        return {
          title: 'SaleToruGuru AI Assistant',
          suggestion: 'Ask me anything about your CRM data'
        };
    }
  };

  const tooltip = getContextualTooltip();
  
  const handleApiKeyChange = (newKey: string) => {
    // This function is no longer needed as we're using server-side API key
    console.log('API key management is now handled server-side');
  };

  // Gate the ability to open the AI assistant
  const handleOpenGuru = () => {
    withFeatureAccess('ai_assistant', openGuru);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
      {/* Floating Action Button with enhanced animation */}
      <button
        onClick={handleOpenGuru}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={clsx(
          'relative w-16 h-16 bg-gradient-to-r from-primary-600 to-purple-700 hover:from-primary-700 hover:to-purple-800',
          'rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300',
          'flex items-center justify-center text-white',
          'hover:scale-110 active:scale-95',
          'group touch-target-lg',
          'border-2 border-white/10 hover:border-white/20',
          'animate-bounce-slow'
        )}
        aria-label="Open AI Assistant"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20"></div>
        {/* Glow animation */}
        <div className="absolute inset-0 rounded-full bg-purple-700/40 blur-xl opacity-40 animate-pulse"></div>
        {/* Logo */}
        <div className="relative">
          <img 
                    src="/saletoru-logo.png"
        alt="SaleToru Logo" 
            className="w-8 h-8 rounded-lg"
          />
          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        {/* Usage counter */}
        <div className="absolute -top-2 -left-2 bg-secondary-800 rounded-full px-2 py-1 text-xs font-bold border border-secondary-700">
          {usageCount}/{usageLimit === Infinity ? '∞' : usageLimit}
        </div>
        {/* Sparkle effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-3 right-3 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-purple-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
      </button>
      {/* Feature lock modal for AI assistant */}
      <FeatureLockModal />
    </div>
  );
};

export default GuruFloatingButton;