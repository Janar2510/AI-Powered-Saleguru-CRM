import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Bot,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import Spline from '@splinetool/react-spline';

interface Company {
  id: string;
  org_id?: string;
  name: string;
  domain?: string;
  billing_address?: any;
  shipping_address?: any;
  metadata?: any;
  created_at?: Date;
  contacts?: any[];
  deals?: any[];
  quotes?: any[];
  invoices?: any[];
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          contacts (
            id,
            first_name,
            last_name,
            email,
            phone,
            title
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const formattedCompany: Company = {
          ...data,
          created_at: new Date(data.created_at),
          contacts: data.contacts || []
        };
        
        setCompany(formattedCompany);
      }
    } catch (error) {
      console.error('Error loading company:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load company details'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="relative z-10 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Company Not Found</h1>
            <p className="text-[#b0b0d0] mb-6">The company you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate('/companies')}
              className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/companies')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-lg text-[#b0b0d0] hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                <p className="text-[#b0b0d0]">{company.domain ? `${company.domain} • ` : ''}{company.contacts?.length || 0} contacts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openGuru}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Guru</span>
              </button>
              <button
                onClick={() => navigate(`/companies/${company.id}/edit`)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => navigate(`/deals/new?company_id=${company.id}`)}
                className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Create Deal</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Information */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Building className="w-5 h-5 text-[#a259ff]" />
                    <span>Company Information</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company Name</label>
                      <p className="text-white font-medium">{company.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Domain</label>
                      {company.domain ? (
                        <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-[#a259ff] hover:text-[#8b4dff] transition-colors flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{company.domain}</span>
                        </a>
                      ) : (
                        <p className="text-white">Not specified</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Created</label>
                      <p className="text-white">{company.created_at?.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Contacts</label>
                      <p className="text-white">{company.contacts?.length || 0} contacts</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Address Information */}
              {(company.billing_address || company.shipping_address) && (
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-[#a259ff]" />
                      <span>Address Information</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {company.billing_address && (
                        <div>
                          <h3 className="text-lg font-medium text-white mb-3">Billing Address</h3>
                          <div className="space-y-2">
                            {company.billing_address.street && (
                              <p className="text-[#b0b0d0]">{company.billing_address.street}</p>
                            )}
                            {company.billing_address.city && (
                              <p className="text-[#b0b0d0]">{company.billing_address.city}, {company.billing_address.state} {company.billing_address.postal_code}</p>
                            )}
                            {company.billing_address.country && (
                              <p className="text-[#b0b0d0]">{company.billing_address.country}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {company.shipping_address && (
                        <div>
                          <h3 className="text-lg font-medium text-white mb-3">Shipping Address</h3>
                          <div className="space-y-2">
                            {company.shipping_address.street && (
                              <p className="text-[#b0b0d0]">{company.shipping_address.street}</p>
                            )}
                            {company.shipping_address.city && (
                              <p className="text-[#b0b0d0]">{company.shipping_address.city}, {company.shipping_address.state} {company.shipping_address.postal_code}</p>
                            )}
                            {company.shipping_address.country && (
                              <p className="text-[#b0b0d0]">{company.shipping_address.country}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Contacts */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#a259ff]" />
                    <span>Contacts ({company.contacts?.length || 0})</span>
                  </h2>
                  {company.contacts && company.contacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.contacts.map((contact) => (
                        <div key={contact.id} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">
                              {contact.first_name} {contact.last_name}
                            </h3>
                            <button
                              onClick={() => navigate(`/contacts/${contact.id}`)}
                              className="text-[#a259ff] hover:text-[#8b4dff] transition-colors"
                            >
                              View
                            </button>
                          </div>
                          <p className="text-[#b0b0d0] text-sm">{contact.title}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Mail className="w-3 h-3 text-[#b0b0d0]" />
                            <span className="text-[#b0b0d0] text-sm">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="w-3 h-3 text-[#b0b0d0]" />
                              <span className="text-[#b0b0d0] text-sm">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
                      <p className="text-[#b0b0d0] mb-4">No contacts found for this company</p>
                      <button
                        onClick={() => navigate(`/contacts/new?company_id=${company.id}`)}
                        className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
                      >
                        Add Contact
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/deals/new?company_id=${company.id}`)}
                      className="w-full bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Create Deal</span>
                    </button>
                    <button
                      onClick={() => navigate(`/contacts/new?company_id=${company.id}`)}
                      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Add Contact</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Company Stats */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Company Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0]">Total Contacts</span>
                      <span className="text-white font-semibold">{company.contacts?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0]">Total Deals</span>
                      <span className="text-white font-semibold">{company.deals?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0]">Total Quotes</span>
                      <span className="text-white font-semibold">{company.quotes?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0]">Total Invoices</span>
                      <span className="text-white font-semibold">{company.invoices?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#a259ff] rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Company Created</p>
                        <p className="text-[#b0b0d0] text-xs">{company.created_at?.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
