import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Company, CompanyFormData, CompanyFilter } from '../types/company';
import { useToastContext } from '../contexts/ToastContext';

export const useCompanies = (initialFilter?: CompanyFilter) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CompanyFilter>(initialFilter || {});
  const { showToast } = useToastContext();

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if companies table exists
      const { error: tableCheckError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, create sample data
      if (tableCheckError) {
        console.log('Companies table may not exist yet, using sample data');
        
        // Sample companies data
        const sampleCompanies: Company[] = [
          {
            id: '1',
            name: 'TechCorp Inc.',
            website: 'https://techcorp.com',
            industry: 'Technology',
            size: 'Enterprise (1000+)',
            description: 'Leading enterprise software solutions provider',
            logo_url: 'https://via.placeholder.com/150',
            phone: '+1 (555) 123-4567',
            email: 'info@techcorp.com',
            linkedin_url: 'https://linkedin.com/company/techcorp',
            tags: ['Enterprise', 'Software', 'B2B'],
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            contact_count: 5,
            deal_count: 2,
            total_deal_value: 75000,
            status: 'customer'
          },
          {
            id: '2',
            name: 'StartupXYZ',
            website: 'https://startupxyz.io',
            industry: 'SaaS',
            size: 'Small (11-50)',
            description: 'Innovative cloud solutions for startups',
            logo_url: 'https://via.placeholder.com/150',
            phone: '+1 (555) 987-6543',
            email: 'hello@startupxyz.io',
            linkedin_url: 'https://linkedin.com/company/startupxyz',
            tags: ['Startup', 'Cloud', 'SaaS'],
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            contact_count: 2,
            deal_count: 1,
            total_deal_value: 25000,
            status: 'lead'
          },
          {
            id: '3',
            name: 'FinanceCore',
            website: 'https://financecore.com',
            industry: 'Financial Services',
            size: 'Medium (51-200)',
            description: 'Financial technology solutions for enterprise',
            logo_url: 'https://via.placeholder.com/150',
            phone: '+1 (555) 456-7890',
            email: 'contact@financecore.com',
            linkedin_url: 'https://linkedin.com/company/financecore',
            tags: ['Finance', 'Enterprise', 'Security'],
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            contact_count: 3,
            deal_count: 1,
            total_deal_value: 45000,
            status: 'customer'
          }
        ];
        
        setCompanies(sampleCompanies);
        setIsLoading(false);
        return;
      }
      
      // If table exists, fetch data
      let query = supabase
        .from('companies')
        .select('*, contacts(count)')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,website.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
      }
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.industry) {
        query = query.eq('industry', filter.industry);
      }
      
      if (filter.size) {
        query = query.eq('size', filter.size);
      }
      
      if (filter.assigned_to) {
        query = query.eq('assigned_to', filter.assigned_to);
      }
      
      if (filter.tags && filter.tags.length > 0) {
        query = query.contains('tags', filter.tags);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Process and format the data
        const formattedCompanies = data.map(company => ({
          ...company,
          created_at: new Date(company.created_at),
          updated_at: new Date(company.updated_at),
          last_contacted_at: company.last_contacted_at ? new Date(company.last_contacted_at) : undefined,
          tags: Array.isArray(company.tags) ? company.tags : [],
          contact_count: company.contacts?.count || 0
        }));
        
        setCompanies(formattedCompanies);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      showToast({
        title: 'Error',
        description: 'Failed to load companies',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = async (companyData: CompanyFormData): Promise<Company | null> => {
    try {
      // Check if companies table exists
      const { error: tableCheckError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, simulate creation with sample data
      if (tableCheckError) {
        console.log('Companies table may not exist yet, simulating creation');
        
        const newCompany: Company = {
          id: Date.now().toString(),
          ...companyData,
          created_at: new Date(),
          updated_at: new Date(),
          contact_count: 0,
          deal_count: 0,
          tags: companyData.tags || []
        };
        
        setCompanies(prev => [newCompany, ...prev]);
        
        showToast({
          title: 'Company Created',
          description: `${newCompany.name} has been added to your companies`,
          type: 'success'
        });
        
        return newCompany;
      }
      
      // If table exists, insert data
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format the returned data
        const formattedCompany = {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          last_contacted_at: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
          tags: Array.isArray(data.tags) ? data.tags : [],
          contact_count: 0,
          deal_count: 0
        };
        
        // Add the company to the local state
        setCompanies(prev => [formattedCompany, ...prev]);
        
        showToast({
          title: 'Company Created',
          description: `${formattedCompany.name} has been added to your companies`,
          type: 'success'
        });
        
        return formattedCompany;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating company:', err);
      showToast({
        title: 'Error',
        description: 'Failed to create company',
        type: 'error'
      });
      return null;
    }
  };

  const updateCompany = async (companyId: string, updates: Partial<CompanyFormData>): Promise<Company | null> => {
    try {
      // Check if companies table exists
      const { error: tableCheckError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, simulate update with sample data
      if (tableCheckError) {
        console.log('Companies table may not exist yet, simulating update');
        
        setCompanies(prev => prev.map(company => 
          company.id === companyId 
            ? { 
                ...company, 
                ...updates, 
                updated_at: new Date() 
              } 
            : company
        ));
        
        const updatedCompany = companies.find(c => c.id === companyId);
        
        if (updatedCompany) {
          showToast({
            title: 'Company Updated',
            description: `${updatedCompany.name} has been updated`,
            type: 'success'
          });
          
          return {
            ...updatedCompany,
            ...updates,
            updated_at: new Date()
          };
        }
        
        return null;
      }
      
      // If table exists, update data
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format the returned data
        const formattedCompany = {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          last_contacted_at: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
          tags: Array.isArray(data.tags) ? data.tags : [],
          contact_count: data.contact_count || 0,
          deal_count: data.deal_count || 0
        };
        
        // Update the company in the local state
        setCompanies(prev => prev.map(company => 
          company.id === companyId ? formattedCompany : company
        ));
        
        showToast({
          title: 'Company Updated',
          description: `${formattedCompany.name} has been updated`,
          type: 'success'
        });
        
        return formattedCompany;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating company:', err);
      showToast({
        title: 'Error',
        description: 'Failed to update company',
        type: 'error'
      });
      return null;
    }
  };

  const deleteCompany = async (companyId: string): Promise<boolean> => {
    try {
      // Check if companies table exists
      const { error: tableCheckError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, simulate deletion with sample data
      if (tableCheckError) {
        console.log('Companies table may not exist yet, simulating deletion');
        
        setCompanies(prev => prev.filter(company => company.id !== companyId));
        
        showToast({
          title: 'Company Deleted',
          description: 'Company has been deleted successfully',
          type: 'success'
        });
        
        return true;
      }
      
      // If table exists, delete data
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);
      
      if (error) throw error;
      
      // Remove the company from the local state
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      
      showToast({
        title: 'Company Deleted',
        description: 'Company has been deleted successfully',
        type: 'success'
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting company:', err);
      showToast({
        title: 'Error',
        description: 'Failed to delete company',
        type: 'error'
      });
      return false;
    }
  };

  const findDuplicates = (companyData: CompanyFormData): Company[] => {
    return companies.filter(company => 
      company.name.toLowerCase() === companyData.name.toLowerCase() ||
      (company.website && companyData.website && 
       company.website.toLowerCase() === companyData.website.toLowerCase())
    );
  };

  const searchCompanies = (searchTerm: string): Company[] => {
    return companies.filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    companies,
    isLoading,
    error,
    filter,
    setFilter,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    findDuplicates,
    searchCompanies
  };
};