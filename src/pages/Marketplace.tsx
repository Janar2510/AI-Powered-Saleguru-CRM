import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  ExternalLink,
  Zap,
  Users,
  FileText,
  Bell,
  RotateCcw,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingUp,
  Clock,
  X,
  Check,
  Globe,
  Brain,
  Plus,
  Heart
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import { useGuruContext } from '../contexts/GuruContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface App {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'AI' | 'Automation' | 'Communication' | 'Files';
  rating: number;
  downloads: number;
  price: 'Free' | number;
  screenshots: string[];
  permissions: string[];
  integrations: string[];
  developer: {
    name: string;
    website?: string;
  };
  featured?: boolean;
  installed?: boolean;
}

const Marketplace: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { askGuru } = useGuruContext();

  const customCategories = [
    { id: 'all', name: 'All Apps', icon: Sparkles },
    { id: 'recommended', name: 'Recommended', icon: Brain },
    { id: 'featured', name: 'Featured', icon: Star },
    { id: 'AI', name: 'AI & Intelligence', icon: Zap },
    { id: 'Automation', name: 'Automation', icon: RotateCcw },
    { id: 'Communication', name: 'Communication', icon: MessageSquare },
    { id: 'Files', name: 'Files & Storage', icon: FileText },
    { id: 'Analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'Productivity', name: 'Productivity', icon: Clock },
  ];

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, selectedCategory, searchTerm]);

  const loadApps = async () => {
    try {
      setLoading(true);
      
      // Mock featured apps data
      const mockApps: App[] = [
        {
          id: 'shadowclone',
          name: 'ShadowClone',
          shortDescription: 'Smart project and task duplicator with AI-powered optimization',
          longDescription: 'ShadowClone revolutionizes project management by intelligently duplicating your successful projects and tasks. Using advanced AI algorithms, it analyzes your past projects to identify patterns and automatically optimizes new duplicates for better performance. Perfect for agencies and teams that handle similar projects repeatedly.',
          icon: RotateCcw,
          category: 'Automation',
          rating: 4.8,
          downloads: 12500,
          price: 'Free',
          screenshots: [
            'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
            'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'
          ],
          permissions: ['Read deals', 'Create tasks', 'Modify projects'],
          integrations: ['Deals', 'Tasks', 'Projects', 'Calendar'],
          developer: {
            name: 'ShadowTech Solutions',
            website: 'https://shadowtech.com'
          },
          featured: true
        },
        {
          id: 'echomind',
          name: 'EchoMind',
          shortDescription: 'Advanced team sentiment tracker and mood analytics',
          longDescription: 'EchoMind provides deep insights into your team\'s emotional well-being and productivity patterns. Using natural language processing and sentiment analysis, it tracks team morale, identifies potential burnout risks, and suggests actionable improvements. Integrates seamlessly with your existing communication channels.',
          icon: Users,
          category: 'AI',
          rating: 4.6,
          downloads: 8900,
          price: 29,
          screenshots: [
            'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg',
            'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg'
          ],
          permissions: ['Read messages', 'Access user data', 'Send notifications'],
          integrations: ['Teams', 'Slack', 'Email', 'Analytics'],
          developer: {
            name: 'MindTech Analytics',
            website: 'https://mindtech.ai'
          },
          featured: true
        },
        {
          id: 'papertrail',
          name: 'PaperTrail AI',
          shortDescription: 'Intelligent document clause searcher and contract analyzer',
          longDescription: 'PaperTrail AI transforms how you handle legal documents and contracts. With advanced AI-powered search capabilities, it can instantly find specific clauses, identify potential risks, and suggest improvements. Perfect for sales teams dealing with complex contracts and legal documentation.',
          icon: FileText,
          category: 'AI',
          rating: 4.9,
          downloads: 15600,
          price: 49,
          screenshots: [
            'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg',
            'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg'
          ],
          permissions: ['Read files', 'Access documents', 'Create reports'],
          integrations: ['Documents', 'Deals', 'Legal', 'Storage'],
          developer: {
            name: 'LegalTech Innovations',
            website: 'https://legaltech.com'
          },
          featured: true
        },
        {
          id: 'quiethours',
          name: 'QuietHours',
          shortDescription: 'Smart notification blocker for focused work sessions',
          longDescription: 'QuietHours intelligently manages your notifications to maximize productivity. It learns your work patterns and automatically blocks distracting notifications during focus time while ensuring critical alerts still get through. Includes smart scheduling and team coordination features.',
          icon: Bell,
          category: 'Communication',
          rating: 4.7,
          downloads: 22100,
          price: 'Free',
          screenshots: [
            'https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg',
            'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg'
          ],
          permissions: ['Manage notifications', 'Access calendar', 'Read user preferences'],
          integrations: ['Notifications', 'Calendar', 'Teams', 'Focus'],
          developer: {
            name: 'Productivity Labs',
            website: 'https://productivitylabs.com'
          },
          featured: true
        },
        {
          id: 'loopback',
          name: 'LoopBack',
          shortDescription: 'Workflow time-rewind tool for process optimization',
          longDescription: 'LoopBack provides powerful workflow versioning and rollback capabilities. Track every change in your sales processes, compare different workflow versions, and instantly revert to previous states when needed. Includes detailed analytics on workflow performance and optimization suggestions.',
          icon: Clock,
          category: 'Automation',
          rating: 4.5,
          downloads: 7800,
          price: 39,
          screenshots: [
            'https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg',
            'https://images.pexels.com/photos/3184300/pexels-photo-3184300.jpeg'
          ],
          permissions: ['Read workflows', 'Modify processes', 'Access history'],
          integrations: ['Workflows', 'Automation', 'Analytics', 'History'],
          developer: {
            name: 'TimeFlow Systems',
            website: 'https://timeflow.io'
          },
          featured: true
        },
        {
          id: 'pocketnegotiator',
          name: 'PocketNegotiator',
          shortDescription: 'AI-powered negotiation assistant and deal optimizer',
          longDescription: 'PocketNegotiator provides real-time negotiation guidance and deal optimization. Using advanced AI algorithms, it analyzes negotiation patterns, suggests optimal strategies, and helps you close deals more effectively. Includes role-play scenarios and performance tracking.',
          icon: Shield,
          category: 'AI',
          rating: 4.8,
          downloads: 12300,
          price: 59,
          screenshots: [
            'https://images.pexels.com/photos/3184301/pexels-photo-3184301.jpeg',
            'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg'
          ],
          permissions: ['Read deals', 'Access conversations', 'Create reports'],
          integrations: ['Deals', 'Communication', 'Analytics', 'Training'],
          developer: {
            name: 'DealTech Pro',
            website: 'https://dealtech.pro'
          },
          featured: true
        },
        {
          id: 'chronodeals',
          name: 'ChronoDeals™',
          shortDescription: 'Temporal lead scoring with AI-powered time-aware analysis',
          longDescription: 'ChronoDeals™ revolutionizes lead scoring by incorporating temporal factors like quarter urgency, holiday periods, seasonal trends, and role-specific timing. Using advanced AI algorithms, it adjusts base scores based on timing context, company history, and industry patterns to provide more accurate lead prioritization.',
          icon: Clock,
          category: 'AI',
          rating: 4.9,
          downloads: 8900,
          price: 79,
          screenshots: [
            'https://images.pexels.com/photos/3184303/pexels-photo-3184303.jpeg',
            'https://images.pexels.com/photos/3184304/pexels-photo-3184304.jpeg'
          ],
          permissions: ['Read contacts', 'Read deals', 'Access lead scores', 'Create reports'],
          integrations: ['Lead Scoring', 'Contacts', 'Deals', 'Analytics', 'AI'],
          developer: {
            name: 'SaleToru Labs',
            website: 'https://saletoru.com'
          },
          featured: true,
          installed: false
        },
        {
          id: 'databridge',
          name: 'DataBridge',
          shortDescription: 'Seamless data integration across multiple platforms',
          longDescription: 'DataBridge connects your CRM with over 100 external platforms, ensuring your data stays synchronized across your entire tech stack. Features automated data cleaning, duplicate detection, and custom mapping rules.',
          icon: Globe,
          category: 'Automation',
          rating: 4.7,
          downloads: 14200,
          price: 29,
          screenshots: [
            'https://images.pexels.com/photos/3184303/pexels-photo-3184303.jpeg'
          ],
          permissions: ['Read/write data', 'External API access', 'Modify records'],
          integrations: ['All modules', 'External APIs'],
          developer: {
            name: 'Integration Solutions',
            website: 'https://integrationsolutions.com'
          }
        },
        {
          id: 'securelock',
          name: 'SecureLock',
          shortDescription: 'Advanced security and compliance management',
          longDescription: 'SecureLock enhances your CRM security with advanced threat protection, compliance monitoring, and data access controls. Includes GDPR, HIPAA, and CCPA compliance tools.',
          icon: Shield,
          category: 'Files',
          rating: 4.8,
          downloads: 9600,
          price: 49,
          screenshots: [
            'https://images.pexels.com/photos/3184304/pexels-photo-3184304.jpeg'
          ],
          permissions: ['Security settings', 'User permissions', 'Audit logs'],
          integrations: ['Users', 'Security', 'Files', 'Audit'],
          developer: {
            name: 'CyberShield Security',
            website: 'https://cybershield.com'
          }
        },
        {
          id: 'live-sentiment-replay',
          name: 'Live Sentiment Replay™ – Emotional Time Machine for Deals',
          shortDescription: 'AI-powered emotional sentiment timeline across all deal interactions.',
          longDescription: 'Live Sentiment Replay™ revolutionizes deal analysis by providing an emotional timeline of every interaction. Using advanced AI sentiment analysis, it tracks emotional changes over time, helping you understand prospect engagement, identify turning points, and optimize your sales approach. See the emotional journey of each deal with beautiful D3.js visualizations and real-time sentiment scoring.',
          icon: Heart,
          category: 'AI',
          rating: 4.8,
          downloads: 750,
          price: 89,
          screenshots: [
            'https://images.pexels.com/photos/3184301/pexels-photo-3184301.jpeg',
            'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg'
          ],
          permissions: ['Read deals', 'Read emails', 'Read calls', 'Read meetings'],
          integrations: ['Deals', 'Emails', 'Calls', 'Meetings', 'AI'],
          developer: {
            name: 'SaleToru Labs',
            website: 'https://saletoru.com'
          },
          featured: true
        }
      ];
      
      setApps(mockApps);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    let filtered = [...apps];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(term) || 
        app.shortDescription.toLowerCase().includes(term)
      );
    }
    
    setFilteredApps(filtered);
  };

  const handleInstallApp = (app: App) => {
    setApps(prev => prev.map(a => 
      a.id === app.id ? { ...a, installed: true } : a
    ));
    setSelectedApp(null);
    setShowModal(false);
  };

  const handleUninstallApp = (app: App) => {
    if (confirm(`Are you sure you want to uninstall ${app.name}?`)) {
      setApps(prev => prev.map(a => 
        a.id === app.id ? { ...a, installed: false } : a
      ));
    }
  };

  const formatPrice = (price: 'Free' | number) => {
    return price === 'Free' ? 'Free' : `$${price}/mo`;
  };

  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // AI-powered recommendations (mocked for now)
  const recommendedApps = apps.filter(app => app.category === 'AI' || app.featured);
  const featuredApps = apps.filter(app => app.featured);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      {/* Content */}
      <div className="relative z-10 space-y-12 px-4 md:px-12 lg:px-32 pt-12 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent tracking-tight">
                  App Marketplace
                </h1>
                <p className="text-secondary-300 mt-1 text-lg">Discover, install, and manage powerful CRM apps and integrations</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => askGuru("What apps should I add to boost my sales workflow?")}
              variant="secondary"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md min-w-[140px] h-12 shadow-md"
            >
              <Brain className="w-5 h-5 mr-2" />
              Ask AI Guru
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white backdrop-blur-md min-w-[140px] h-12 shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit App
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-10">
          {customCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-sm text-base ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-secondary-200 hover:bg-white/20'
              }`}
            >
              <cat.icon className="w-5 h-5" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Apps Section */}
        {selectedCategory === 'all' && featuredApps.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
              <Star className="w-6 h-6 text-yellow-400" /> Featured Apps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredApps.map(app => (
                <Card key={app.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 flex flex-col items-start shadow-xl hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <app.icon className="w-7 h-7 text-accent" />
                    <span className="text-lg font-bold text-white tracking-tight">{app.name}</span>
                    <span className="ml-auto flex items-center gap-1 text-yellow-400 font-semibold"><Star className="w-4 h-4" /> {app.rating}</span>
                  </div>
                  <p className="text-secondary-200 mb-3 text-base">{app.shortDescription}</p>
                  <div className="flex items-center gap-3 mt-auto w-full">
                    <span className="text-secondary-400 flex items-center gap-1"><Download className="w-4 h-4" /> {formatDownloads(app.downloads)}</span>
                    <span className="text-green-400 font-semibold ml-auto">{app.price === 'Free' ? 'Free' : `$${app.price}/mo`}</span>
                  </div>
                  <span className="mt-2 text-xs text-blue-300 font-medium bg-blue-500/10 px-3 py-1 rounded-lg">{app.category}</span>
                  <Button
                    onClick={() => setSelectedApp(app)}
                    size="md"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white mt-4 w-full shadow-md"
                  >
                    Add
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        {selectedCategory === 'recommended' && recommendedApps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" /> Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedApps.map(app => (
                <Card key={app.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 flex flex-col items-center text-center">
                  <app.icon className="w-10 h-10 text-accent mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
                  <p className="text-secondary-300 mb-2">{app.shortDescription}</p>
                  <Button
                    onClick={() => setSelectedApp(app)}
                    size="md"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white mt-2"
                  >
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Apps Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
            <Sparkles className="w-6 h-6 text-purple-400" /> All Apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredApps.map(app => (
              <Card key={app.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 flex flex-col items-start shadow-xl hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <app.icon className="w-7 h-7 text-accent" />
                  <span className="text-lg font-bold text-white tracking-tight">{app.name}</span>
                  <span className="ml-auto flex items-center gap-1 text-yellow-400 font-semibold"><Star className="w-4 h-4" /> {app.rating}</span>
                </div>
                <p className="text-secondary-200 mb-3 text-base">{app.shortDescription}</p>
                <div className="flex items-center gap-3 mt-auto w-full">
                  <span className="text-secondary-400 flex items-center gap-1"><Download className="w-4 h-4" /> {formatDownloads(app.downloads)}</span>
                  <span className="text-green-400 font-semibold ml-auto">{app.price === 'Free' ? 'Free' : `$${app.price}/mo`}</span>
                </div>
                <span className="mt-2 text-xs text-blue-300 font-medium bg-blue-500/10 px-3 py-1 rounded-lg">{app.category}</span>
                <Button
                  onClick={() => setSelectedApp(app)}
                  size="md"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white mt-4 w-full shadow-md"
                >
                  Add
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* App Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 max-w-3xl w-full relative">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <selectedApp.icon className="w-10 h-10 text-accent" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedApp.name}</h2>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">{selectedApp.rating}</span>
                        <span className="text-secondary-400">({formatDownloads(selectedApp.downloads)} installs)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary-200 mb-2">{selectedApp.longDescription}</p>
                  {/* Screenshots carousel placeholder */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {selectedApp.screenshots.map((src, idx) => (
                      <img key={idx} src={src} alt="screenshot" className="rounded-lg border border-white/10 object-cover w-full h-32" />
                    ))}
                  </div>
                  {/* Integrations */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedApp.integrations.map((integration, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-xs">
                        {integration}
                      </span>
                    ))}
                  </div>
                  {/* Permissions */}
                  <div className="mb-2">
                    <span className="text-xs text-secondary-400">Permissions:</span>
                    <ul className="list-disc list-inside text-xs text-white/80">
                      {selectedApp.permissions.map((perm, idx) => (
                        <li key={idx}>{perm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-64 flex flex-col gap-4">
                  <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-secondary-400 mb-1">Price</p>
                        <p className={`font-medium ${selectedApp.price === 'Free' ? 'text-green-400' : 'text-white'}`}>{formatPrice(selectedApp.price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-400 mb-1">Developer</p>
                        <p className="font-medium text-white">{selectedApp.developer.name}</p>
                        {selectedApp.developer.website && (
                          <a href={selectedApp.developer.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent/80 flex items-center space-x-1 mt-1">
                            <Globe className="w-3 h-3" />
                            <span>Visit website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                  {/* Install/Purchase/Launch actions */}
                  {selectedApp.price !== 'Free' && !selectedApp.installed ? (
                    <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white w-full">Purchase (Coming Soon)</Button>
                  ) : selectedApp.installed ? (
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 text-white w-full">Launch / Manage</Button>
                  ) : (
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-full" onClick={() => handleInstallApp(selectedApp)}>Add to CRM</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredApps.length === 0 && !loading && (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
            <Search className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No apps found</h3>
            <p className="text-dark-400 mb-6">Try adjusting your search or filters</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg"
            >
              Clear Filters
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace; 