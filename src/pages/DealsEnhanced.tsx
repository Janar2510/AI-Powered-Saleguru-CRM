import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Grid3X3,
  List,
  LayoutGrid as Kanban,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  FileText,
  File,
  Eye,
  Edit
} from 'lucide-react';

import {
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard
} from '../contexts/BrandDesignContext';

import { DealsKanbanBoard } from '../components/deals/DealsKanbanBoard';
import { Deal, useDeals } from '../hooks/useDeals';

type ViewType = 'kanban' | 'list' | 'grid' | 'calendar';
type ExportFormat = 'excel' | 'csv' | 'pdf';

const DealsEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { 
    dealsByStage, 
    stats, 
    loading 
  } = useDeals();

  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExport = (format: ExportFormat) => {
    console.log('Exporting deals in format:', format);
    // Implementation would generate and download the file
    setShowExportModal(false);
    
    // Mock download
    const filename = `deals-export-${new Date().toISOString().split('T')[0]}.${format}`;
    console.log('Downloaded:', filename);
  };

  const handleImport = (file: File) => {
    console.log('Importing deals from file:', file.name);
    // Implementation would parse and import the file
    setShowImportModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportOptions = [
    { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, description: 'Full data export with formatting' },
    { id: 'csv', label: 'CSV (.csv)', icon: FileText, description: 'Plain text format for data analysis' },
    { id: 'pdf', label: 'PDF Report (.pdf)', icon: File, description: 'Formatted report for presentation' }
  ];

  const viewOptions = [
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'list', label: 'List View', icon: List },
    { id: 'grid', label: 'Grid View', icon: Grid3X3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ];

  // Mock list view component
  const ListView = () => {
    const allDeals = Object.values(dealsByStage).flat();
    
    return (
      <BrandCard className="overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Deals List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Deal</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Probability</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Close Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {allDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{deal.title}</div>
                      <div className="text-white/60 text-sm">{deal.organization?.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4">
                    <BrandBadge variant="secondary">{deal.stage}</BrandBadge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {deal.contact?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <BrandButton
                        variant="secondary"
                        size="sm"
                        className="p-1 px-2"
                        onClick={() => navigate(`/deals/${deal.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </BrandButton>
                      <BrandButton
                        variant="ghost"
                        size="sm"
                        className="p-1 px-2"
                        onClick={() => {
                          console.log('Edit deal:', deal.id);
                          // Would open edit modal
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </BrandButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BrandCard>
    );
  };

  // Mock grid view component
  const GridView = () => {
    const allDeals = Object.values(dealsByStage).flat();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allDeals.map((deal) => (
          <BrandCard key={deal.id} className="p-6 hover:shadow-xl transition-all duration-200">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">{deal.title}</h3>
                <p className="text-white/60 text-sm">{deal.organization?.name}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(deal.value)}
                </span>
                <BrandBadge variant="secondary">{deal.probability}%</BrandBadge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Stage</span>
                  <span className="text-white">{deal.stage}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Contact</span>
                  <span className="text-white">{deal.contact?.name || '-'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <BrandButton 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/deals/${deal.id}`)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </BrandButton>
                <BrandButton 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => console.log('Edit deal:', deal.id)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </BrandButton>
              </div>
            </div>
          </BrandCard>
        ))}
      </div>
    );
  };

  // Mock calendar view component
  const CalendarView = () => (
    <BrandCard className="p-6">
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Calendar View</h3>
        <p className="text-white/60">Coming soon - View deals by close date on calendar</p>
      </div>
    </BrandCard>
  );

  const renderCurrentView = () => {
    switch (viewType) {
      case 'kanban':
        return <DealsKanbanBoard />;
      case 'list':
        return <ListView />;
      case 'grid':
        return <GridView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <DealsKanbanBoard />;
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white/70">Loading deals...</span>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col">
        {/* Header - Matching Leads Management Design */}
        <div className="px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">Deals Pipeline</h1>
                <p className="text-white/70 text-lg">Manage your sales opportunities and track deal progress</p>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Options */}
              <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10">
                {viewOptions.map((option) => (
                  <BrandButton
                    key={option.id}
                    variant={viewType === option.id ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewType(option.id as ViewType)}
                    className="flex items-center space-x-2"
                    title={option.label}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </BrandButton>
                ))}
              </div>

              {/* Export/Import */}
              <div className="flex items-center space-x-2">
                <BrandButton
                  variant="secondary"
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </BrandButton>
                <BrandButton
                  variant="secondary"
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </BrandButton>
              </div>

              <BrandButton
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Deal</span>
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Controls and Stats */}
        <div className="px-6">
          {/* Controls */}
          <BrandCard className="p-4 mb-6" borderGradient="secondary">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <BrandInput
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <BrandButton
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </BrandButton>

              <BrandButton
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </BrandButton>
            </div>
          </div>
          </BrandCard>

          {/* Statistics Dashboard - Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <BrandStatCard
              icon={<Target className="w-6 h-6 text-blue-400" />}
              title="Total Deals"
              value={stats.totalDeals.toString()}
              trend={`${formatCurrency(stats.totalValue)} total value`}
              borderGradient="blue"
            />
            <BrandStatCard
              icon={<TrendingUp className="w-6 h-6 text-green-400" />}
              title="Won Deals"
              value={stats.wonDeals.toString()}
              trend={`${formatCurrency(stats.wonValue)} revenue`}
              borderGradient="green"
            />
            <BrandStatCard
              icon={<DollarSign className="w-6 h-6 text-purple-400" />}
              title="Avg Deal Size"
              value={formatCurrency(stats.averageDealSize)}
              trend={`${stats.winRate.toFixed(1)}% win rate`}
              borderGradient="purple"
            />
            <BrandStatCard
              icon={<Users className="w-6 h-6 text-yellow-400" />}
              title="Pipeline Value"
              value={formatCurrency(stats.totalValue - stats.wonValue - stats.lostValue)}
              trend="Active opportunities"
              borderGradient="yellow"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 pb-6 overflow-hidden">
          <motion.div
            key={viewType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full mx-4"
            >
              <BrandCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Export Deals</h3>
                <p className="text-white/70 mb-6">Choose your preferred export format:</p>
                
                <div className="space-y-3 mb-6">
                  {exportOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleExport(option.id as ExportFormat)}
                      className="w-full flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                    >
                      <option.icon className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">{option.label}</div>
                        <div className="text-white/60 text-sm">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-3">
                  <BrandButton
                    variant="secondary"
                    onClick={() => setShowExportModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </BrandButton>
                </div>
              </BrandCard>
            </motion.div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full mx-4"
            >
              <BrandCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Import Deals</h3>
                <p className="text-white/70 mb-6">
                  Upload a CSV or Excel file with your deals data. Make sure it includes columns for title, value, stage, and contact information.
                </p>
                
                <div className="mb-6">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImport(file);
                    }}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <BrandButton
                    variant="secondary"
                    onClick={() => setShowImportModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </BrandButton>
                  <BrandButton
                    variant="primary"
                    className="flex-1"
                  >
                    Download Template
                  </BrandButton>
                </div>
              </BrandCard>
            </motion.div>
          </div>
        )}
      </div>
  );
};

export default DealsEnhanced;
