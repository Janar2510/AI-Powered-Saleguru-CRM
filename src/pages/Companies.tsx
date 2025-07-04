import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Building, Bot, Download, Upload } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../components/common/EmptyState';
import CompanyList from '../components/companies/CompanyList';
import CompanyDetail from '../components/companies/CompanyDetail';
import CreateCompanyModal from '../components/companies/CreateCompanyModal';
import { useCompanies } from '../hooks/useCompanies';
import { Company, CompanyFilter } from '../types/company';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';

const Companies: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  
  // State for UI
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize companies hook
  const { 
    companies, 
    isLoading, 
    error, 
    filter, 
    setFilter,
    createCompany,
    updateCompany,
    deleteCompany
  } = useCompanies();

  // Apply search filter when searchTerm changes
  useEffect(() => {
    setFilter(prev => ({ ...prev, search: searchTerm }));
  }, [searchTerm, setFilter]);

  const handleViewCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    const success = await deleteCompany(companyId);
    if (success && selectedCompany?.id === companyId) {
      setSelectedCompany(null);
    }
  };

  const handleCompanyCreated = async (company: Company) => {
    if (isEditing && selectedCompany) {
      await updateCompany(selectedCompany.id, company);
      // Update the selected company if it's currently being viewed
      setSelectedCompany(prev => prev && prev.id === selectedCompany.id ? { ...prev, ...company } : prev);
    } else {
      await createCompany(company);
    }
    setShowCreateModal(false);
    setIsEditing(false);
  };

  const handleImportCompanies = () => {
    showToast({
      title: 'Import Companies',
      description: 'Opening company import wizard...',
      type: 'info'
    });
    // In a real app, this would open an import wizard
  };

  const handleExportCompanies = () => {
    showToast({
      title: 'Export Companies',
      description: 'Exporting companies to CSV...',
      type: 'info'
    });
    // In a real app, this would export companies to CSV
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'lead', label: 'Lead' },
    { value: 'customer', label: 'Customer' }
  ];

  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    { value: 'Technology', label: 'Technology' },
    { value: 'SaaS', label: 'SaaS' },
    { value: 'Financial Services', label: 'Financial Services' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' }
  ];

  // Render the company detail view if a company is selected
  if (selectedCompany) {
    return (
      <Container>
        <CompanyDetail
          company={selectedCompany}
          onBack={() => setSelectedCompany(null)}
          onEdit={() => handleEditCompany(selectedCompany)}
          onDelete={() => handleDeleteCompany(selectedCompany.id)}
        />
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Companies</h1>
            <p className="text-secondary-400 mt-1">Manage your company database</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setShowCreateModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleImportCompanies}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button 
                onClick={handleExportCompanies}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filter.status || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value !== 'all' ? e.target.value : undefined }))}
              className="bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filter.industry || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, industry: e.target.value !== 'all' ? e.target.value : undefined }))}
              className="bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {industryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-1 bg-secondary-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{companies.length}</div>
              <div className="text-secondary-400 text-sm">Total Companies</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {companies.filter(c => c.status === 'active').length}
              </div>
              <div className="text-secondary-400 text-sm">Active</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {companies.filter(c => c.status === 'lead').length}
              </div>
              <div className="text-secondary-400 text-sm">Leads</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">
                {companies.filter(c => c.status === 'customer').length}
              </div>
              <div className="text-secondary-400 text-sm">Customers</div>
            </div>
          </Card>
        </div>

        {/* Companies List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-400">Loading companies...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border border-red-600/30 text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Companies</h3>
            <p className="text-red-300">{error}</p>
          </Card>
        ) : companies.length > 0 ? (
          <CompanyList
            companies={companies}
            onView={handleViewCompany}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
            viewMode={viewMode}
          />
        ) : (
          <EmptyState
            icon={Building}
            title="No companies found"
            description={searchTerm ? 'Try adjusting your search criteria' : 'Add your first company to get started'}
            guruSuggestion="Help me import companies from my spreadsheet"
            actionLabel="Add Company"
            onAction={() => {
              setIsEditing(false);
              setShowCreateModal(true);
            }}
          />
        )}

        {/* Create/Edit Company Modal */}
        <CreateCompanyModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setIsEditing(false);
          }}
          onCompanyCreated={handleCompanyCreated}
          initialData={isEditing ? selectedCompany : undefined}
          isEditing={isEditing}
        />
      </div>
    </Container>
  );
};

export default Companies;