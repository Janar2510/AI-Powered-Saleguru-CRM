import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
// TODO: Implement DevModeContext/useDevMode for real dev mode toggling and state
// import { useDevMode } from '../contexts/DevModeContext';
import { supabase } from '../services/supabase';
import { 
  Code, 
  Database, 
  User, 
  Settings, 
  RefreshCw, 
  Download, 
  Copy, 
  Check,
  Layers,
  AlertCircle
} from 'lucide-react';

const DebugTools: React.FC = () => {
  // Placeholder for dev mode context
  const isDevMode = true; // Set to true for now
  const currentPlan = 'starter';
  const setCurrentPlan = () => {};
  const debugInfo = { currentRoute: window.location.pathname, lastApiCall: '', lastError: '' };
  const supabaseStatus = 'connected';

  const [activeTab, setActiveTab] = useState<'user' | 'database' | 'session' | 'settings'>('user');
  const [userData, setUserData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDevMode) {
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, [isDevMode, activeTab]);

  const loadData = async () => {
    if (!isDevMode) return;
    setLoading(true);
    setError(null);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setSessionData(session);
      // Get database stats
      const stats = await getDatabaseStats();
      setDatabaseStats(stats);
    } catch (err) {
      console.error('Error loading debug data:', err);
      setError('Failed to load debug data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getDatabaseStats = async () => {
    try {
      // Get table counts
      const tables = ['deals', 'contacts', 'companies', 'pipelines', 'pipeline_stages', 'notifications'];
      const counts = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          return {
            table,
            count: error ? 'Error' : count,
            error: error ? error.message : null
          };
        })
      );
      return {
        tables: counts,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { error: 'Failed to get database stats' };
    }
  };

  const handleCopyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePlan = (plan: 'starter' | 'pro' | 'team') => {
    setCurrentPlan(plan);
  };

  if (!isDevMode) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Developer Mode Required</h2>
          <p className="text-dark-400 mb-6">
            This page is only accessible when Developer Mode is enabled.
          </p>
          <p className="text-dark-400">
            Enable Developer Mode by clicking the toggle in the settings or by using the keyboard shortcut.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Debug Tools</h1>
          <p className="text-dark-400">Developer tools for debugging and testing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="bg-dark-200 hover:bg-dark-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}
      {/* Tabs */}
      <div className="flex border-b border-dark-200">
        <button
          onClick={() => setActiveTab('user')}
          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'user'
              ? 'text-accent border-b-2 border-accent'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User</span>
        </button>
        <button
          onClick={() => setActiveTab('session')}
          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'session'
              ? 'text-accent border-b-2 border-accent'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Session</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'database'
              ? 'text-accent border-b-2 border-accent'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-accent border-b-2 border-accent'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
      {/* Content */}
      <div>
        {activeTab === 'user' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">User Information</h2>
              <button
                onClick={() => handleCopyToClipboard(userData)}
                className="p-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-dark-400" />}
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-200/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">User ID</h3>
                    <p className="text-white font-mono text-sm break-all">{userData.id}</p>
                  </div>
                  <div className="bg-dark-200/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Email</h3>
                    <p className="text-white">{userData.email}</p>
                  </div>
                </div>
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">User Metadata</h3>
                  <pre className="text-white font-mono text-sm overflow-x-auto p-2 bg-dark-300/50 rounded-lg">
                    {JSON.stringify(userData.user_metadata, null, 2)}
                  </pre>
                </div>
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">App Metadata</h3>
                  <pre className="text-white font-mono text-sm overflow-x-auto p-2 bg-dark-300/50 rounded-lg">
                    {JSON.stringify(userData.app_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400">No user data available</p>
              </div>
            )}
          </Card>
        )}
        {activeTab === 'session' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Session Information</h2>
              <button
                onClick={() => handleCopyToClipboard(sessionData)}
                className="p-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-dark-400" />}
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : sessionData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-200/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Access Token</h3>
                    <p className="text-white font-mono text-sm break-all line-clamp-3">{sessionData.access_token}</p>
                  </div>
                  <div className="bg-dark-200/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Refresh Token</h3>
                    <p className="text-white font-mono text-sm break-all line-clamp-3">{sessionData.refresh_token}</p>
                  </div>
                </div>
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Expires At</h3>
                  <p className="text-white">{sessionData.expires_at ? new Date(sessionData.expires_at * 1000).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Full Session Data</h3>
                  <pre className="text-white font-mono text-sm overflow-x-auto p-2 bg-dark-300/50 rounded-lg">
                    {JSON.stringify(sessionData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400">No session data available</p>
              </div>
            )}
          </Card>
        )}
        {activeTab === 'database' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Database Information</h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  supabaseStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                  supabaseStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <span className={`w-2 h-2 mr-1.5 rounded-full ${
                    supabaseStatus === 'connected' ? 'bg-green-400' :
                    supabaseStatus === 'error' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`}></span>
                  {supabaseStatus}
                </span>
                <button
                  onClick={loadData}
                  className="p-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 text-dark-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : databaseStats ? (
              <div className="space-y-4">
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-4">Table Record Counts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {databaseStats.tables.map((table: any) => (
                      <div key={table.table} className="bg-dark-300/50 p-3 rounded-lg">
                        <h4 className="text-white font-medium mb-1">{table.table}</h4>
                        {table.error ? (
                          <p className="text-red-400 text-sm">{table.error}</p>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-dark-400">Records:</span>
                            <span className="text-white font-mono">{table.count}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Last Updated</h3>
                  <p className="text-white">{new Date(databaseStats.lastUpdated).toLocaleString()}</p>
                </div>
                <div className="bg-dark-200/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Debug Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Current Route:</span>
                      <span className="text-white font-mono">{debugInfo.currentRoute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Last API Call:</span>
                      <span className="text-white font-mono">{debugInfo.lastApiCall || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Last Error:</span>
                      <span className="text-white font-mono">{debugInfo.lastError || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400">No database stats available</p>
              </div>
            )}
          </Card>
        )}
        {activeTab === 'settings' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Developer Settings</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-dark-200/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-white mb-4">Plan Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleChangePlan('starter')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      currentPlan === 'starter' 
                        ? 'border-accent bg-accent/10' 
                        : 'border-dark-300 hover:border-dark-200'
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-white mb-1">Starter Plan</h4>
                      <p className="text-xs text-dark-400">Basic features</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleChangePlan('pro')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      currentPlan === 'pro' 
                        ? 'border-accent bg-accent/10' 
                        : 'border-dark-300 hover:border-dark-200'
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-white mb-1">Pro Plan</h4>
                      <p className="text-xs text-dark-400">Advanced features</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleChangePlan('team')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      currentPlan === 'team' 
                        ? 'border-accent bg-accent/10' 
                        : 'border-dark-300 hover:border-dark-200'
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-white mb-1">Team Plan</h4>
                      <p className="text-xs text-dark-400">All features</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="bg-dark-200/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-white mb-4">Feature Access</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-300/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white">AI Assistant</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          currentPlan === 'team' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {currentPlan === 'team' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-dark-300/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Email Integration</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          currentPlan === 'pro' || currentPlan === 'team' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {currentPlan === 'pro' || currentPlan === 'team' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-dark-300/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Advanced Analytics</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          currentPlan === 'pro' || currentPlan === 'team' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {currentPlan === 'pro' || currentPlan === 'team' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-dark-300/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Lead Scoring</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          currentPlan === 'team' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {currentPlan === 'team' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-dark-200/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-white mb-4">Export Debug Data</h3>
                <button
                  onClick={() => {
                    const debugData = {
                      user: userData,
                      session: sessionData,
                      database: databaseStats,
                      debugInfo,
                      currentPlan,
                      supabaseStatus,
                      timestamp: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `saletoru-debug-${new Date().toISOString()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Debug Data</span>
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DebugTools; 