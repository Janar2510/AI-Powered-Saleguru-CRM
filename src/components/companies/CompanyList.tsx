import React, { useState } from 'react';
import { Building, Globe, Users, Edit, Trash2, Eye, DollarSign, Check, X, Zap, Target, Clock } from 'lucide-react';
import { Company } from '../../types/company';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import EnrichmentStatusBadge from '../enrichment/EnrichmentStatusBadge';

interface CompanyListProps {
  companies: Company[];
  onView: (companyId: string) => void;
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  viewMode: 'table' | 'cards' | 'kanban';
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
      <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#23233a]/30">
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Company</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Website</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Industry</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Contacts</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Status</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Data</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-[#23233a]/30 hover:bg-[#23233a]/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#a259ff] rounded-lg flex items-center justify-center">
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
                        <div className="text-sm text-[#b0b0d0]">{company.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {company.website ? (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-[#b0b0d0]" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#a259ff] hover:text-[#8b5cf6] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    ) : (
                      <span className="text-[#b0b0d0]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {company.industry ? (
                      <span className="text-white">{company.industry}</span>
                    ) : (
                      <span className="text-[#b0b0d0]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#b0b0d0]" />
                      <span className="text-white">{company.contact_count}</span>
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
                      <Button
                        onClick={() => onView(company.id)}
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        title="View Company"
                      />
                      <Button
                        onClick={() => onEdit(company)}
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        title="Edit Company"
                      />
                      {deletingCompanyId === company.id ? (
                        <div className="flex space-x-1 bg-[#ef4444]/20 rounded-lg p-1">
                          <Button
                            onClick={() => setDeletingCompanyId(null)}
                            variant="ghost"
                            size="sm"
                            icon={X}
                            title="Cancel"
                          />
                          <Button
                            onClick={() => handleDeleteCompany(company.id)}
                            variant="ghost"
                            size="sm"
                            icon={Check}
                            title="Confirm Delete"
                            className="text-[#ef4444] hover:text-[#ef4444]"
                          />
                        </div>
                      ) : (
                        <Button
                          onClick={() => setDeletingCompanyId(company.id)}
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          title="Delete Company"
                          className="text-[#b0b0d0] hover:text-[#ef4444] hover:bg-[#ef4444]/20"
                        />
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

  if (viewMode === 'kanban') {
    // Group companies by status for Kanban view
    const statusGroups = {
      'lead': companies.filter(c => c.status === 'lead'),
      'active': companies.filter(c => c.status === 'active'),
      'customer': companies.filter(c => c.status === 'customer'),
      'inactive': companies.filter(c => c.status === 'inactive')
    };

    const columns = [
      { id: 'lead', title: 'Leads', companies: statusGroups.lead, color: 'border-[#f59e0b]' },
      { id: 'active', title: 'Active', companies: statusGroups.active, color: 'border-[#43e7ad]' },
      { id: 'customer', title: 'Customers', companies: statusGroups.customer, color: 'border-[#a259ff]' },
      { id: 'inactive', title: 'Inactive', companies: statusGroups.inactive, color: 'border-[#6b7280]' }
    ];

    return (
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[320px]">
            <Card className={`bg-[#23233a]/50 backdrop-blur-md border ${column.color}/30 h-full`}>
              <div className="flex items-center justify-between mb-4 p-4 border-b border-[#23233a]/30">
                <h3 className="text-lg font-bold text-white">{column.title}</h3>
                <Badge variant="secondary" size="sm">{column.companies.length}</Badge>
              </div>
              <div className="p-4 space-y-3">
                {column.companies.length > 0 ? (
                  column.companies.map((company) => (
                    <Card 
                      key={company.id} 
                      className="bg-[#23233a]/30 backdrop-blur-md border border-[#23233a]/30 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onView(company.id)}
                    >
                      <div className="p-3 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#a259ff] rounded-lg flex items-center justify-center">
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
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-white text-sm">{company.name}</h4>
                              {company.enrichment_status === 'completed' && (
                                <Zap className="w-3 h-3 text-[#a259ff]" title="Data Enriched" />
                              )}
                            </div>
                            <p className="text-[#b0b0d0] text-xs">{company.industry}</p>
                            <p className="text-[#b0b0d0] text-xs">{company.size}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          {company.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-3 h-3 text-[#b0b0d0]" />
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#a259ff] hover:text-[#8b5cf6] transition-colors truncate"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users className="w-3 h-3 text-[#b0b0d0]" />
                              <span className="text-white">{company.contact_count} contacts</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-3 h-3 text-[#b0b0d0]" />
                              <span className="text-white">{company.deal_count} deals</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#23233a]/30">
                          <div className="flex space-x-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(company);
                              }}
                              variant="ghost"
                              size="sm"
                              icon={Edit}
                              className="w-6 h-6 p-0"
                            />
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(company.id);
                              }}
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              className="w-6 h-6 p-0"
                            />
                          </div>
                          {company.total_deal_value && (
                            <div className="text-xs">
                              <span className="text-[#b0b0d0]">Value: </span>
                              <span className="text-[#43e7ad] font-bold">
                                ${(company.total_deal_value / 1000).toFixed(0)}K
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building className="w-8 h-8 text-[#b0b0d0] mx-auto mb-2" />
                    <p className="text-[#b0b0d0] text-sm">No companies</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {companies.map((company) => (
        <Card 
          key={company.id} 
          className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onView(company.id)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#a259ff] rounded-lg flex items-center justify-center">
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
                      <Zap className="w-4 h-4 text-[#a259ff]" title="Data Enriched" />
                    )}
                  </div>
                  <p className="text-[#b0b0d0] text-sm">{company.industry}</p>
                  <p className="text-[#b0b0d0] text-sm">{company.size}</p>
                </div>
              </div>
              {company.total_deal_value && (
                <div className="text-right">
                  <div className="text-lg font-bold text-[#43e7ad]">
                    ${(company.total_deal_value / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-[#b0b0d0]">Deal Value</div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {company.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[#b0b0d0]" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#a259ff] hover:text-[#8b5cf6] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-white">{company.contact_count} contacts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-white">{company.deal_count} deals</span>
                </div>
              </div>
              {company.last_contacted_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-white">
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

            <div className="flex gap-2 pt-2 border-t border-[#23233a]/30">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
                variant="secondary"
                size="sm"
                icon={Edit}
                className="flex-1"
              >
                Edit
              </Button>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(company.id);
                }}
                variant="gradient"
                size="sm"
                icon={Eye}
                className="flex-1"
              >
                View
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CompanyList;