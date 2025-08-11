import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  Target, 
  Star,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Zap,
  Bot,
  Users,
  Briefcase
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spline from '@splinetool/react-spline';

interface Contact {
  id: string;
  org_id?: string;
  company_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  address?: any;
  metadata?: any;
  created_at?: Date;
  company?: {
    name: string;
    domain?: string;
  };
  deals?: any[];
  quotes?: any[];
  invoices?: any[];
}

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadContact();
    }
  }, [id]);

  const loadContact = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          companies (
            name,
            domain
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const formattedContact: Contact = {
          ...data,
          created_at: new Date(data.created_at),
          company: data.companies
        };
        
        setContact(formattedContact);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load contact details'
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

  if (!contact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="relative z-10 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Contact Not Found</h1>
            <p className="text-[#b0b0d0] mb-6">The contact you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate('/contacts')}
              className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
            >
              Back to Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();

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
                onClick={() => navigate('/contacts')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-lg text-[#b0b0d0] hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{fullName}</h1>
                <p className="text-[#b0b0d0]">{contact.title} at {contact.company?.name || 'Unknown Company'}</p>
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
                onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => navigate(`/deals/new?contact_id=${contact.id}`)}
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
              {/* Contact Information */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-[#a259ff]" />
                    <span>Contact Information</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Full Name</label>
                      <p className="text-white font-medium">{fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Title</label>
                      <p className="text-white">{contact.title || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-[#b0b0d0]" />
                        <a href={`mailto:${contact.email}`} className="text-[#a259ff] hover:text-[#8b4dff] transition-colors">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-[#b0b0d0]" />
                        <a href={`tel:${contact.phone}`} className="text-[#a259ff] hover:text-[#8b4dff] transition-colors">
                          {contact.phone || 'Not specified'}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company</label>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-[#b0b0d0]" />
                        <span className="text-white">{contact.company?.name || 'Not specified'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Created</label>
                      <p className="text-white">{contact.created_at?.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Address Information */}
              {contact.address && (
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-[#a259ff]" />
                      <span>Address Information</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {contact.address.street && (
                        <div>
                          <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Street</label>
                          <p className="text-white">{contact.address.street}</p>
                        </div>
                      )}
                      {contact.address.city && (
                        <div>
                          <label className="block text-sm font-medium text-[#b0b0d0] mb-1">City</label>
                          <p className="text-white">{contact.address.city}</p>
                        </div>
                      )}
                      {contact.address.state && (
                        <div>
                          <label className="block text-sm font-medium text-[#b0b0d0] mb-1">State</label>
                          <p className="text-white">{contact.address.state}</p>
                        </div>
                      )}
                      {contact.address.postal_code && (
                        <div>
                          <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Postal Code</label>
                          <p className="text-white">{contact.address.postal_code}</p>
                        </div>
                      )}
                      {contact.address.country && (
                        <div>
                          <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Country</label>
                          <p className="text-white">{contact.address.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Related Deals */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-[#a259ff]" />
                    <span>Related Deals</span>
                  </h2>
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
                    <p className="text-[#b0b0d0] mb-4">No deals found for this contact</p>
                    <button
                      onClick={() => navigate(`/deals/new?contact_id=${contact.id}`)}
                      className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
                    >
                      Create Deal
                    </button>
                  </div>
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
                      onClick={() => navigate(`/deals/new?contact_id=${contact.id}`)}
                      className="w-full bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Create Deal</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Meeting</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Company Information */}
              {contact.company && (
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company Name</label>
                        <p className="text-white font-medium">{contact.company.name}</p>
                      </div>
                      {contact.company.domain && (
                        <div>
                          <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Domain</label>
                          <a href={`https://${contact.company.domain}`} target="_blank" rel="noopener noreferrer" className="text-[#a259ff] hover:text-[#8b4dff] transition-colors flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>{contact.company.domain}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Timeline */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#a259ff] rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Contact Created</p>
                        <p className="text-[#b0b0d0] text-xs">{contact.created_at?.toLocaleDateString()}</p>
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

export default ContactDetail;
