import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Search, Filter, Calendar, RefreshCw, BarChart3, CheckCircle, AlertCircle, Edit, ArrowLeft, Home, Calculator } from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard,
  BrandStatsGrid
} from '../../contexts/BrandDesignContext';
import { useJournals, Journal } from '../../hooks/useAccounting';
import { QuickActionsBar } from '../../components/accounting/QuickActionsBar';

const Journals: React.FC = () => {
  const navigate = useNavigate();
  const { journals, loading, error, fetchJournals, setError } = useJournals();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const sources = ['AR Invoice', 'AP Bill', 'Payment', 'COGS', 'Manual', 'Closing Entries'];

  const filteredJournals = journals.filter(journal => {
    const matchesSearch = 
      journal.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = !sourceFilter || journal.source === sourceFilter;
    
    const matchesDateRange = (!dateRange.start || journal.jdate >= dateRange.start) &&
                           (!dateRange.end || journal.jdate <= dateRange.end);
    
    return matchesSearch && matchesSource && matchesDateRange;
  });

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'AR Invoice': return 'success';
      case 'AP Bill': return 'warning';
      case 'Payment': return 'info';
      case 'COGS': return 'purple';
      case 'Manual': return 'secondary';
      case 'Closing Entries': return 'error';
      default: return 'secondary';
    }
  };

  const handleRefresh = () => {
    fetchJournals();
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Journal Entries"
        subtitle="View and manage all accounting journal entries"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/accounting')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/accounting/manual-entry')}>
              <Calculator className="w-4 h-4 mr-2" />
              Manual Entry
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </BrandButton>
            
            <BrandButton variant="primary" onClick={() => navigate('/accounting/manual-entry')}>
              <FileText className="w-4 h-4 mr-2" />
              New Entry
            </BrandButton>
          </div>
        }
      >
        <QuickActionsBar currentPage="/accounting/journals" />
        
        {/* Filters */}
        <BrandCard borderGradient="primary" className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <BrandInput
                placeholder="Search journals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
            >
              <option value="">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="Start date"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="End date"
              />
            </div>
          </div>
        </BrandCard>

        {/* Statistics */}
        <BrandStatsGrid className="mb-6">
          <BrandStatCard
            title="Total Entries"
            value={filteredJournals.length.toString()}
            icon={<BarChart3 className="w-8 h-8 text-green-300" />}
            borderGradient="success"
          />
          
          <BrandStatCard
            title="Posted"
            value={filteredJournals.filter(j => j.posted).length.toString()}
            icon={<CheckCircle className="w-8 h-8 text-blue-400" />}
            borderGradient="primary"
          />
          
          <BrandStatCard
            title="Unposted"
            value={filteredJournals.filter(j => !j.posted).length.toString()}
            icon={<AlertCircle className="w-8 h-8 text-yellow-400" />}
            borderGradient="yellow"
          />
          
          <BrandStatCard
            title="Manual"
            value={filteredJournals.filter(j => j.source === 'Manual').length.toString()}
            icon={<Edit className="w-8 h-8 text-purple-400" />}
            borderGradient="purple"
          />
        </BrandStatsGrid>

        {/* Journal Entries List */}
        <BrandCard borderGradient="secondary" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#23233a]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Source</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Reference</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23233a]/30">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#b0b0d0]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading journal entries...
                    </td>
                  </tr>
                ) : filteredJournals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#b0b0d0]">
                      {searchTerm || sourceFilter || dateRange.start || dateRange.end 
                        ? 'No journal entries match your filters' 
                        : 'No journal entries found'}
                    </td>
                  </tr>
                ) : (
                  filteredJournals.map((journal) => (
                    <tr 
                      key={journal.id} 
                      className="hover:bg-white/5 cursor-pointer"
                      onClick={() => navigate(`/accounting/journals/${journal.id}`)}
                    >
                      <td className="px-6 py-4 text-white">
                        {new Date(journal.jdate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <BrandBadge variant={getSourceColor(journal.source)} size="sm">
                          {journal.source}
                        </BrandBadge>
                      </td>
                      <td className="px-6 py-4 text-[#b0b0d0] font-mono text-sm">
                        {journal.source_id ? 
                          `${journal.source_table}:${journal.source_id.slice(-8)}` : 
                          journal.id.slice(-8)
                        }
                      </td>
                      <td className="px-6 py-4 text-white max-w-xs truncate">
                        {journal.memo || 'No description'}
                      </td>
                      <td className="px-6 py-4">
                        <BrandBadge variant={journal.posted ? 'success' : 'warning'} size="sm">
                          {journal.posted ? 'Posted' : 'Unposted'}
                        </BrandBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <BrandButton 
                          variant="secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/accounting/journals/${journal.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </BrandButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </BrandCard>

        {error && (
          <BrandCard borderGradient="error" className="p-4 mt-6">
            <p className="text-red-400">{error}</p>
          </BrandCard>
        )}

        {/* Summary Information */}
        {filteredJournals.length > 0 && (
          <BrandCard borderGradient="accent" className="p-4 mt-6">
            <div className="flex items-center justify-between text-sm text-[#b0b0d0]">
              <span>
                Showing {filteredJournals.length} of {journals.length} journal entries
              </span>
              <span>
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
          </BrandCard>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Journals;

