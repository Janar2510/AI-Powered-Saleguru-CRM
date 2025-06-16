import React, { useState, useEffect } from 'react';
import { Bot, BarChart, Calendar, Download, RefreshCw, Filter, Search, Clock, Zap, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { createClient } from '@supabase/supabase-js';
import { useToastContext } from '../../contexts/ToastContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface AILog {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  context: string;
  metadata: any;
  timestamp: Date;
  tokens_used: number;
  model: string;
  user_name?: string;
  user_email?: string;
}

interface UsageByDate {
  date: string;
  count: number;
  tokens: number;
}

interface UsageByContext {
  context: string;
  count: number;
  tokens: number;
}

const AIUsageStats: React.FC = () => {
  const { showToast } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AILog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [usageByDate, setUsageByDate] = useState<UsageByDate[]>([]);
  const [usageByContext, setUsageByContext] = useState<UsageByContext[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRequests: 0,
    totalTokens: 0,
    avgTokensPerRequest: 0,
    uniqueUsers: 0
  });

  // Fetch AI logs from Supabase
  useEffect(() => {
    const fetchAILogs = async () => {
      setIsLoading(true);
      try {
        // Get current user to check if admin
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          showToast({
            title: 'Authentication Error',
            description: 'You must be logged in to view AI usage stats',
            type: 'error'
          });
          setIsLoading(false);
          return;
        }
        
        // Check if user is admin
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        const isAdmin = profile?.role === 'admin' || profile?.role === 'developer_admin' || profile?.role === 'manager';
        
        if (!isAdmin) {
          // If not admin, only fetch own logs
          const { data, error } = await supabase
            .from('ai_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            const formattedLogs = data.map(log => ({
              ...log,
              timestamp: new Date(log.timestamp),
              user_name: 'You',
              user_email: user.email
            }));
            
            setLogs(formattedLogs);
            setFilteredLogs(formattedLogs);
          }
        } else {
          // If admin, fetch all logs with user details
          const { data, error } = await supabase
            .from('ai_logs')
            .select(`
              *,
              user_profiles:user_id(
                first_name,
                last_name,
                email
              )
            `)
            .order('timestamp', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            const formattedLogs = data.map(log => ({
              ...log,
              timestamp: new Date(log.timestamp),
              user_name: log.user_profiles ? 
                `${log.user_profiles.first_name || ''} ${log.user_profiles.last_name || ''}`.trim() || 'Unknown User' : 
                'Unknown User',
              user_email: log.user_profiles?.email || 'unknown@example.com'
            }));
            
            setLogs(formattedLogs);
            setFilteredLogs(formattedLogs);
          }
        }
      } catch (error) {
        console.error('Error fetching AI logs:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load AI usage data',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAILogs();
  }, [showToast]);

  // Apply filters when search term or date range changes
  useEffect(() => {
    const filtered = logs.filter(log => {
      const matchesSearch = 
        log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const logDate = log.timestamp.toISOString().split('T')[0];
      const matchesDateRange = 
        (!dateRange.start || logDate >= dateRange.start) &&
        (!dateRange.end || logDate <= dateRange.end);
      
      return matchesSearch && matchesDateRange;
    });
    
    setFilteredLogs(filtered);
    
    // Calculate usage by date
    const dateMap = new Map<string, {count: number, tokens: number}>();
    filtered.forEach(log => {
      const date = log.timestamp.toISOString().split('T')[0];
      const current = dateMap.get(date) || { count: 0, tokens: 0 };
      dateMap.set(date, {
        count: current.count + 1,
        tokens: current.tokens + (log.tokens_used || 0)
      });
    });
    
    const usageByDateArray = Array.from(dateMap.entries()).map(([date, stats]) => ({
      date,
      count: stats.count,
      tokens: stats.tokens
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    setUsageByDate(usageByDateArray);
    
    // Calculate usage by context
    const contextMap = new Map<string, {count: number, tokens: number}>();
    filtered.forEach(log => {
      const context = log.context || 'unknown';
      const current = contextMap.get(context) || { count: 0, tokens: 0 };
      contextMap.set(context, {
        count: current.count + 1,
        tokens: current.tokens + (log.tokens_used || 0)
      });
    });
    
    const usageByContextArray = Array.from(contextMap.entries()).map(([context, stats]) => ({
      context,
      count: stats.count,
      tokens: stats.tokens
    })).sort((a, b) => b.count - a.count);
    
    setUsageByContext(usageByContextArray);
    
    // Calculate total stats
    const totalRequests = filtered.length;
    const totalTokens = filtered.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
    const avgTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0;
    const uniqueUsers = new Set(filtered.map(log => log.user_id)).size;
    
    setTotalStats({
      totalRequests,
      totalTokens,
      avgTokensPerRequest,
      uniqueUsers
    });
    
  }, [logs, searchTerm, dateRange]);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'User', 'Context', 'Prompt', 'Tokens Used', 'Model'];
    const rows = filteredLogs.map(log => [
      log.timestamp.toLocaleString(),
      log.user_name,
      log.context,
      log.prompt,
      log.tokens_used || 0,
      log.model
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-usage-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast({
      title: 'Export Complete',
      description: 'AI usage data has been exported to CSV',
      type: 'success'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="text-xl font-semibold text-white">AI Usage Analytics</h3>
            <p className="text-secondary-400 text-sm">Monitor and analyze AI assistant usage across your organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{formatNumber(totalStats.totalRequests)}</div>
            <div className="text-sm text-secondary-400">Total Requests</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-primary-500">{formatNumber(totalStats.totalTokens)}</div>
            <div className="text-sm text-secondary-400">Total Tokens</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{formatNumber(totalStats.avgTokensPerRequest)}</div>
            <div className="text-sm text-secondary-400">Avg Tokens/Request</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{formatNumber(totalStats.uniqueUsers)}</div>
            <div className="text-sm text-secondary-400">Unique Users</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <div className="flex space-x-2">
            <button 
              onClick={handleExport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button 
              onClick={() => {
                setSearchTerm('');
                setDateRange({
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                });
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by prompt, context, or user..."
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage by Date */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart className="w-5 h-5 text-primary-500" />
            <span>Usage by Date</span>
          </h3>
          
          {usageByDate.length > 0 ? (
            <div className="h-64 overflow-hidden">
              <div className="h-full flex items-end space-x-1">
                {usageByDate.map((item) => (
                  <div 
                    key={item.date} 
                    className="flex-1 flex flex-col items-center group"
                    title={`${item.date}: ${item.count} requests, ${item.tokens} tokens`}
                  >
                    <div className="w-full flex-1 flex flex-col justify-end">
                      <div 
                        className="w-full bg-primary-600 hover:bg-primary-500 transition-colors rounded-t"
                        style={{ 
                          height: `${Math.max(5, (item.count / Math.max(...usageByDate.map(d => d.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-secondary-500 mt-1 truncate w-full text-center">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                <p className="text-secondary-400">No data available for selected date range</p>
              </div>
            </div>
          )}
        </Card>

        {/* Usage by Context */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-500" />
            <span>Usage by Context</span>
          </h3>
          
          {usageByContext.length > 0 ? (
            <div className="space-y-3">
              {usageByContext.slice(0, 5).map((item) => (
                <div key={item.context} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white capitalize">{item.context}</span>
                      <Badge variant="secondary" size="sm">{item.count} requests</Badge>
                    </div>
                    <span className="text-xs text-secondary-400">{formatNumber(item.tokens)} tokens</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(item.count / Math.max(...usageByContext.map(c => c.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                <p className="text-secondary-400">No data available for selected date range</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* AI Logs Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Interaction Logs</h3>
          <Badge variant="secondary" size="sm">{filteredLogs.length} records</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-400">Loading AI logs...</p>
            </div>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">User</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Context</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Prompt</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Tokens</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Model</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">{log.timestamp.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{log.user_name}</div>
                      <div className="text-sm text-secondary-400">{log.user_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" size="sm" className="capitalize">{log.context}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white truncate max-w-xs" title={log.prompt}>
                        {log.prompt.length > 50 ? log.prompt.substring(0, 50) + '...' : log.prompt}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-secondary-300">{log.tokens_used || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-secondary-300">{log.model}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Bot className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
              <p className="text-secondary-400">No AI logs found</p>
              <p className="text-secondary-500 text-sm mt-1">
                {searchTerm || dateRange.start || dateRange.end ? 
                  'Try adjusting your search criteria or date range' : 
                  'Start using SaleToruGuru to see logs here'}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Usage Recommendations */}
      <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">AI Usage Recommendations</h3>
            <p className="text-secondary-300 text-sm mt-2">
              Based on your usage patterns, here are some recommendations to optimize your AI usage:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-secondary-300 text-sm">
              <li>Use more specific prompts to get more accurate responses with fewer tokens</li>
              <li>Batch similar questions together to reduce the number of API calls</li>
              <li>Consider upgrading to a higher plan if you're consistently reaching your usage limits</li>
              <li>Use the AI assistant for complex tasks that benefit from AI analysis rather than simple lookups</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIUsageStats;