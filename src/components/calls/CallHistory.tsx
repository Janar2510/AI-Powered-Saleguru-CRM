import React, { useState, useEffect } from 'react';
import { CallTranscriptionService } from '../../services/callTranscriptionService';
import { CallTranscript } from '../../types/call';
import { useToastContext } from '../../contexts/ToastContext';

interface CallHistoryProps {
  contactId?: string;
  dealId?: string;
  className?: string;
}

const CallHistory: React.FC<CallHistoryProps> = ({
  contactId,
  dealId,
  className = ''
}) => {
  const [calls, setCalls] = useState<CallTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallTranscript | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showTranscript, setShowTranscript] = useState(false);
  
  const { showToast } = useToastContext();

  useEffect(() => {
    loadCalls();
  }, [contactId, dealId]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await CallTranscriptionService.getCallTranscripts({
        contactId,
        dealId,
        limit: 50
      });
      
      setCalls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.transcript.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || call.call_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCall = async (callId: string) => {
    if (!confirm('Are you sure you want to delete this call transcript?')) {
      return;
    }

    try {
      await CallTranscriptionService.deleteCallTranscript(callId);
      setCalls(calls.filter(call => call.id !== callId));
      showToast('Call transcript deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete call transcript', 'error');
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getCallTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'sales_call': 'Sales Call',
      'discovery_call': 'Discovery Call',
      'demo_call': 'Demo Call',
      'negotiation_call': 'Negotiation Call',
      'follow_up': 'Follow-up Call'
    };
    return labels[type] || type;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-secondary-700 rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Call History</h3>
          <span className="text-sm text-secondary-400">{calls.length} calls</span>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Types</option>
            <option value="sales_call">Sales Calls</option>
            <option value="discovery_call">Discovery Calls</option>
            <option value="demo_call">Demo Calls</option>
            <option value="negotiation_call">Negotiation Calls</option>
            <option value="follow_up">Follow-up Calls</option>
          </select>
        </div>
      </div>

      {/* Call List */}
      <div className="divide-y divide-secondary-700">
        {filteredCalls.length === 0 ? (
          <div className="p-6 text-center text-secondary-400">
            <svg className="mx-auto h-12 w-12 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
            </svg>
            <p className="mt-2 text-sm">
              {searchTerm || filterType !== 'all' 
                ? 'No calls match your search criteria' 
                : 'No call transcripts available'
              }
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div key={call.id} className="p-6 hover:bg-secondary-800 transition-colors rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getSentimentIcon(call.sentiment)}</span>
                    <span className="text-sm font-medium text-white">
                      {getCallTypeLabel(call.call_type)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(call.sentiment)}`}>
                      {call.sentiment}
                    </span>
                    <span className="text-sm text-secondary-400">
                      {formatDuration(call.duration)}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-300 mb-2 line-clamp-2">
                    {call.summary}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-secondary-500">
                    <span>{formatDate(call.created_at)}</span>
                    <span>Confidence: {(call.confidence_score * 100).toFixed(0)}%</span>
                    {call.deal_stage && (
                      <span className="capitalize">{call.deal_stage}</span>
                    )}
                  </div>
                  {/* Action Items Preview */}
                  {call.action_items && call.action_items.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-secondary-400 mb-1">Action Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {call.action_items.slice(0, 3).map((item, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-green-900/40 text-green-300 rounded-full">
                            ✓ {item}
                          </span>
                        ))}
                        {call.action_items.length > 3 && (
                          <span className="text-xs text-secondary-500">
                            +{call.action_items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedCall(call);
                      setShowTranscript(true);
                    }}
                    className="px-3 py-1 text-sm text-primary-400 hover:text-primary-200 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteCall(call.id)}
                    className="px-3 py-1 text-sm text-red-400 hover:text-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transcript Modal */}
      {selectedCall && showTranscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Call Transcript - {getCallTypeLabel(selectedCall.call_type)}
              </h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{selectedCall.summary}</p>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {selectedCall.key_points.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Action Items</h4>
                <ul className="space-y-2">
                  {selectedCall.action_items.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Transcript */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Full Transcript</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedCall.transcript}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory; 