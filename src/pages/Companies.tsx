import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Building, Bot, Download, Upload, AlertTriangle, Kanban } from 'lucide-react';

import Container from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
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
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');
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
    // Only set selectedCompany if we're not already viewing this company
    if (!selectedCompany || selectedCompany.id !== company.id) {
      setSelectedCompany(company);
    }
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
      </Container>
    );
  }

  return (
    <Container>
      {/* Solid background (Spline removed for stability) */}
      <div className="fixed inset-0 -z-10 bg-black" />

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Companies</h1>
            <p className="text-[#b0b0d0] mt-1">Manage your company database</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={openGuru}
              variant="secondary"
              size="lg"
              icon={Bot}
            >
              Ask Guru
            </Button>
            <Button 
              onClick={() => {
                setIsEditing(false);
                setShowCreateModal(true);
              }}
              variant="gradient"
              size="lg"
              icon={Plus}
            >
              Add Company
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleImportCompanies}
                variant="secondary"
                size="sm"
                icon={Upload}
              >
                Import
              </Button>
              <Button 
                onClick={handleExportCompanies}
                variant="secondary"
                size="sm"
                icon={Download}
              >
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Dropdown
              options={statusOptions}
              value={filter.status || 'all'}
              onChange={(value) => setFilter(prev => ({ ...prev, status: value !== 'all' ? value : undefined }))}
              className="w-36"
            />
            
            <Dropdown
              options={industryOptions}
              value={filter.industry || 'all'}
              onChange={(value) => setFilter(prev => ({ ...prev, industry: value !== 'all' ? value : undefined }))}
              className="w-36"
            />
            
            <div className="flex space-x-1 bg-[#23233a]/50 border-2 border-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              variant="secondary"
              size="sm"
              icon={Filter}
            >
              More Filters
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{companies.length}</div>
              <div className="text-[#b0b0d0] text-sm">Total Companies</div>
            </div>
          </Card>
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#43e7ad]">
                {companies.filter(c => c.status === 'active').length}
              </div>
              <div className="text-[#b0b0d0] text-sm">Active</div>
            </div>
          </Card>
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {companies.filter(c => c.status === 'lead').length}
              </div>
              <div className="text-[#b0b0d0] text-sm">Leads</div>
            </div>
          </Card>
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a259ff]">
                {companies.filter(c => c.status === 'customer').length}
              </div>
              <div className="text-[#b0b0d0] text-sm">Customers</div>
            </div>
          </Card>
        </div>

        {/* Companies List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#b0b0d0]">Loading companies...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-center py-8">
            <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Companies</h3>
            <p className="text-[#ef4444]">{error}</p>
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