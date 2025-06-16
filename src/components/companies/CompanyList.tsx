import React, { useState } from 'react';
import { Building, Globe, Users, Edit, Trash2, Eye, DollarSign, Check, X, Zap, Target, Clock } from 'lucide-react';
import { Company } from '../../types/company';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import EnrichmentStatusBadge from '../enrichment/EnrichmentStatusBadge';

interface CompanyListProps {
  companies: Company[];
  onView: (companyId: string) => void;
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  viewMode: 'table' | 'cards';
}

const CompanyList: React.FC<CompanyListProps> = ({ 
  companies, 
  onView, 
  onEdit, 
  onDelete,
  viewMode
}) => {
  const { showToast } = useToastContext();
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" size="sm">Inactive</Badge>;
      case 'lead':
        return <Badge variant="warning" size="sm">Lead</Badge>;
      case 'customer':
        return <Badge variant="primary" size="sm">Customer</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      onDelete(companyId);
      setDeletingCompanyId(null);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete company',
        type: 'error'
      });
    }
  };

  if (viewMode === 'table') {
    return (
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Company</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Website</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Industry</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Contacts</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Data</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name} 
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{company.name}</div>
                        <div className="text-sm text-secondary-400">{company.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {company.website ? (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-secondary-400" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    ) : (
                      <span className="text-secondary-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {company.industry ? (
                      <span className="text-secondary-300">{company.industry}</span>
                    ) : (
                      <span className="text-secondary-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-secondary-400" />
                      <span className="text-secondary-300">{company.contact_count}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(company.status)}
                  </td>
                  <td className="py-3 px-4">
                    {company.enrichment_status && (
                      <EnrichmentStatusBadge 
                        status={company.enrichment_status} 
                        lastUpdated={company.enriched_at}
                        showTimestamp={false}
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onView(company.id)}
                        className="p-1 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                        title="View Company"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(company)}
                        className="p-1 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Edit Company"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {deletingCompanyId === company.id ? (
                        <div className="flex space-x-1 bg-red-900/20 rounded-lg p-1">
                          <button 
                            onClick={() => setDeletingCompanyId(null)}
                            className="p-1 text-secondary-400 hover:text-white transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCompany(company.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Confirm Delete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingCompanyId(company.id)}
                          className="p-1 text-secondary-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {companies.map((company) => (
        <Card 
          key={company.id} 
          className="bg-white/10 backdrop-blur-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onView(company.id)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name} 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white">{company.name}</h3>
                    {company.enrichment_status === 'completed' && (
                      <Zap className="w-4 h-4 text-primary-400" title="Data Enriched" />
                    )}
                  </div>
                  <p className="text-secondary-400 text-sm">{company.industry}</p>
                  <p className="text-secondary-500 text-sm">{company.size}</p>
                </div>
              </div>
              {company.total_deal_value && (
                <div className="text-right">
                  <div className="text-lg font-bold text-green-500">
                    ${(company.total_deal_value / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-secondary-400">Deal Value</div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {company.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-secondary-400" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-300">{company.contact_count} contacts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-300">{company.deal_count} deals</span>
                </div>
              </div>
              {company.last_contacted_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-300">
                    Last contacted: {company.last_contacted_at.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {company.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {company.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{company.tags.length - 3}
                </Badge>
              )}
              {getStatusBadge(company.status)}
            </div>

            <div className="flex space-x-2 pt-2 border-t border-secondary-700">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
                className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(company.id);
                }}
                className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CompanyList;