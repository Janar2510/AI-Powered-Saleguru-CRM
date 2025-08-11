import React, { createContext, useContext, useState, useCallback } from 'react';

interface DevModeContextType {
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  currentPlan: 'starter' | 'pro' | 'team';
  setCurrentPlan: (plan: 'starter' | 'pro' | 'team') => void;
  debugInfo: { currentRoute: string; lastApiCall: string; lastError: string };
  setDebugInfo: (info: Partial<{ currentRoute: string; lastApiCall: string; lastError: string }>) => void;
  supabaseStatus: 'connected' | 'error' | 'unknown';
  setSupabaseStatus: (status: 'connected' | 'error' | 'unknown') => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'starter' | 'pro' | 'team'>('starter');
  const [debugInfo, setDebugInfoState] = useState<{ currentRoute: string; lastApiCall: string; lastError: string }>({
    currentRoute: window.location.pathname,
    lastApiCall: '',
    lastError: '',
  });
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'error' | 'unknown'>('unknown');

  const setDebugInfo = useCallback((info: Partial<{ currentRoute: string; lastApiCall: string; lastError: string }>) => {
    setDebugInfoState(prev => ({ ...prev, ...info }));
  }, []);

  return (
    <DevModeContext.Provider value={{
      isDevMode,
      setIsDevMode,
      currentPlan,
      setCurrentPlan,
      debugInfo,
      setDebugInfo,
      supabaseStatus,
      setSupabaseStatus
    }}>
      {children}
    </DevModeContext.Provider>
  );
};

export const useDevMode = () => {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error('useDevMode must be used within a DevModeProvider');
  return ctx;
}; 