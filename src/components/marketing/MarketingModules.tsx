import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, FileText, BarChart3, Settings, Plus, Eye, TrendingUp, Target, Users, Globe, Mail, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SEOAnalysis {
  id: string;
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  status: 'optimized' | 'needs-work' | 'not-ranked';
  lastChecked: Date;
}

interface FormBuilder {
  id: string;
  name: string;
  type: 'contact' | 'demo-request' | 'newsletter' | 'quote' | 'custom';
  status: 'active' | 'inactive' | 'draft';
  submissions: number;
  conversionRate: number;
  lastSubmission: Date;
  fields: string[];
  embedCode: string;
}

interface ABTest {
  id: string;
  name: string;
  type: 'landing-page' | 'email' | 'form' | 'cta';
  status: 'running' | 'paused' | 'completed';
  variantA: string;
  variantB: string;
  visitorsA: number;
  visitorsB: number;
  conversionsA: number;
  conversionsB: number;
  startDate: Date;
  endDate?: Date;
  winner?: 'A' | 'B' | 'tie';
}

const MarketingModules: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'seo' | 'forms' | 'ab-testing' | 'analytics'>('seo');
  
  const [seoKeywords, setSeoKeywords] = useState<SEOAnalysis[]>([
    {
      id: 'kw-1',
      keyword: 'CRM software',
      position: 3,
      searchVolume: 12000,
      difficulty: 45,
      cpc: 12.50,
      status: 'optimized',
      lastChecked: new Date()
    },
    {
      id: 'kw-2',
      keyword: 'sales automation',
      position: 8,
      searchVolume: 8900,
      difficulty: 67,
      cpc: 15.20,
      status: 'needs-work',
      lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'kw-3',
      keyword: 'lead management',
      position: 15,
      searchVolume: 5600,
      difficulty: 34,
      cpc: 8.75,
      status: 'not-ranked',
      lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'kw-4',
      keyword: 'customer relationship management',
      position: 5,
      searchVolume: 7800,
      difficulty: 52,
      cpc: 11.30,
      status: 'optimized',
      lastChecked: new Date()
    }
  ]);

  const [forms, setForms] = useState<FormBuilder[]>([
    {
      id: 'form-1',
      name: 'Contact Form',
      type: 'contact',
      status: 'active',
      submissions: 234,
      conversionRate: 12.5,
      lastSubmission: new Date(),
      fields: ['Name', 'Email', 'Company', 'Message'],
      embedCode: '<script src="https://forms.company.com/contact.js"></script>'
    },
    {
      id: 'form-2',
      name: 'Demo Request',
      type: 'demo-request',
      status: 'active',
      submissions: 156,
      conversionRate: 8.9,
      lastSubmission: new Date(Date.now() - 2 * 60 * 60 * 1000),
      fields: ['Name', 'Email', 'Company', 'Phone', 'Use Case'],
      embedCode: '<script src="https://forms.company.com/demo.js"></script>'
    },
    {
      id: 'form-3',
      name: 'Newsletter Signup',
      type: 'newsletter',
      status: 'active',
      submissions: 567,
      conversionRate: 23.4,
      lastSubmission: new Date(Date.now() - 30 * 60 * 1000),
      fields: ['Email', 'Interests'],
      embedCode: '<script src="https://forms.company.com/newsletter.js"></script>'
    },
    {
      id: 'form-4',
      name: 'Quote Calculator',
      type: 'quote',
      status: 'draft',
      submissions: 0,
      conversionRate: 0,
      lastSubmission: new Date(),
      fields: ['Company Size', 'Requirements', 'Budget', 'Timeline'],
      embedCode: '<script src="https://forms.company.com/quote.js"></script>'
    }
  ]);

  const [abTests, setAbTests] = useState<ABTest[]>([
    {
      id: 'test-1',
      name: 'Landing Page Headline',
      type: 'landing-page',
      status: 'running',
      variantA: 'Boost Sales with AI-Powered CRM',
      variantB: 'Transform Your Sales Process Today',
      visitorsA: 1247,
      visitorsB: 1189,
      conversionsA: 89,
      conversionsB: 67,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      winner: undefined
    },
    {
      id: 'test-2',
      name: 'Email Subject Line',
      type: 'email',
      status: 'completed',
      variantA: 'Your Free CRM Demo is Ready',
      variantB: 'See How Our CRM Can Help You',
      visitorsA: 2340,
      visitorsB: 2289,
      conversionsA: 156,
      conversionsB: 189,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      winner: 'B'
    },
    {
      id: 'test-3',
      name: 'CTA Button Color',
      type: 'cta',
      status: 'paused',
      variantA: 'Blue Button',
      variantB: 'Green Button',
      visitorsA: 892,
      visitorsB: 856,
      conversionsA: 45,
      conversionsB: 38,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      winner: undefined
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleAddKeyword = () => {
    const newKeyword: SEOAnalysis = {
      id: `kw-${Date.now()}`,
      keyword: 'New Keyword',
      position: 0,
      searchVolume: 0,
      difficulty: 0,
      cpc: 0,
      status: 'not-ranked',
      lastChecked: new Date()
    };
    setSeoKeywords(prev => [...prev, newKeyword]);
  };

  const handleAddForm = () => {
    const newForm: FormBuilder = {
      id: `form-${Date.now()}`,
      name: 'New Form',
      type: 'contact',
      status: 'draft',
      submissions: 0,
      conversionRate: 0,
      lastSubmission: new Date(),
      fields: ['Name', 'Email'],
      embedCode: '<script src="https://forms.company.com/new.js"></script>'
    };
    setForms(prev => [...prev, newForm]);
  };

  const handleAddTest = () => {
    const newTest: ABTest = {
      id: `test-${Date.now()}`,
      name: 'New A/B Test',
      type: 'landing-page',
      status: 'running',
      variantA: 'Variant A',
      variantB: 'Variant B',
      visitorsA: 0,
      visitorsB: 0,
      conversionsA: 0,
      conversionsB: 0,
      startDate: new Date()
    };
    setAbTests(prev => [...prev, newTest]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return 'success';
      case 'needs-work': return 'warning';
      case 'not-ranked': return 'danger';
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'draft': return 'secondary';
      case 'running': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const getConversionRate = (conversions: number, visitors: number) => {
    return visitors > 0 ? ((conversions / visitors) * 100).toFixed(1) : '0.0';
  };

  const getWinner = (test: ABTest) => {
    if (!test.winner) return null;
    const rateA = test.visitorsA > 0 ? (test.conversionsA / test.visitorsA) * 100 : 0;
    const rateB = test.visitorsB > 0 ? (test.conversionsB / test.visitorsB) * 100 : 0;
    
    if (rateA > rateB) return 'A';
    if (rateB > rateA) return 'B';
    return 'tie';
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#a259ff]" />
              <span>Marketing Modules</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              SEO tools, form builders, and A/B testing for lead acquisition
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#23233a]/30">
          {[
            { id: 'seo', name: 'SEO Tools', icon: Search },
            { id: 'forms', name: 'Form Builders', icon: FileText },
            { id: 'ab-testing', name: 'A/B Testing', icon: Target },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">SEO Keyword Analysis</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={handleAddKeyword}>
                  Add Keyword
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#23233a]/30">
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">Keyword</th>
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">Position</th>
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">Search Volume</th>
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">Difficulty</th>
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">CPC</th>
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">Status</th>
                      <th className="text-left py-3 text-[#b0b0d0] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoKeywords.map(keyword => (
                      <tr key={keyword.id} className="border-b border-[#23233a]/20">
                        <td className="py-3 text-white font-medium">{keyword.keyword}</td>
                        <td className="py-3 text-white">{keyword.position || 'Not ranked'}</td>
                        <td className="py-3 text-white">{keyword.searchVolume.toLocaleString()}</td>
                        <td className="py-3 text-white">{keyword.difficulty}/100</td>
                        <td className="py-3 text-white">${keyword.cpc}</td>
                        <td className="py-3">
                          <Badge variant={getStatusColor(keyword.status) as any} size="sm">
                            {keyword.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button variant="secondary" size="sm">
                            Optimize
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Form Builders</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={handleAddForm}>
                  Create Form
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.map(form => (
                  <Card key={form.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white">{form.name}</h5>
                        <p className="text-sm text-[#b0b0d0] capitalize">Type: {form.type.replace('-', ' ')}</p>
                      </div>
                      <Badge variant={getStatusColor(form.status) as any} size="sm">
                        {form.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Submissions:</span>
                        <span className="text-white font-medium">{form.submissions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Conversion Rate:</span>
                        <span className="text-white font-medium">{form.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Fields:</span>
                        <span className="text-white">{form.fields.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Embed
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ab-testing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">A/B Testing</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={handleAddTest}>
                  Create Test
                </Button>
              </div>
              
              <div className="space-y-4">
                {abTests.map(test => (
                  <Card key={test.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{test.name}</h5>
                        <p className="text-sm text-[#b0b0d0] capitalize">Type: {test.type.replace('-', ' ')}</p>
                      </div>
                      <Badge variant={getStatusColor(test.status) as any} size="sm">
                        {test.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-white">Variant A</h6>
                        <p className="text-sm text-[#b0b0d0]">{test.variantA}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#b0b0d0]">Visitors: {test.visitorsA}</span>
                          <span className="text-[#b0b0d0]">Conversions: {test.conversionsA}</span>
                          <span className="text-white">{getConversionRate(test.conversionsA, test.visitorsA)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-white">Variant B</h6>
                        <p className="text-sm text-[#b0b0d0]">{test.variantB}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#b0b0d0]">Visitors: {test.visitorsB}</span>
                          <span className="text-[#b0b0d0]">Conversions: {test.conversionsB}</span>
                          <span className="text-white">{getConversionRate(test.conversionsB, test.visitorsB)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {test.winner && (
                      <div className="mb-4 p-2 bg-[#a259ff]/20 rounded-lg">
                        <p className="text-sm text-white">
                          Winner: <span className="font-medium">Variant {test.winner}</span>
                        </p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        {test.status === 'running' ? 'Pause' : 'Start'}
                      </Button>
                      <Button variant="secondary" size="sm">
                        View Results
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Marketing Analytics</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Total Visitors</p>
                      <p className="text-xl font-semibold text-white">12,847</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Lead Conversions</p>
                      <p className="text-xl font-semibold text-white">1,234</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Conversion Rate</p>
                      <p className="text-xl font-semibold text-white">9.6%</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Email Opens</p>
                      <p className="text-xl font-semibold text-white">68.5%</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h5 className="font-medium text-white mb-4">Top Performing Keywords</h5>
                  <div className="space-y-3">
                    {seoKeywords.slice(0, 5).map(keyword => (
                      <div key={keyword.id} className="flex justify-between items-center">
                        <span className="text-sm text-white">{keyword.keyword}</span>
                        <span className="text-sm text-[#b0b0d0]">Position {keyword.position}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h5 className="font-medium text-white mb-4">Form Performance</h5>
                  <div className="space-y-3">
                    {forms.slice(0, 5).map(form => (
                      <div key={form.id} className="flex justify-between items-center">
                        <span className="text-sm text-white">{form.name}</span>
                        <span className="text-sm text-[#b0b0d0]">{form.conversionRate}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MarketingModules; 