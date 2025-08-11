import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Building, 
  User, 
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  FileText
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useToastContext } from '../contexts/ToastContext';
import { DealsAPI } from '../lib/deals-api';
import DealEmotionTimeline from '../components/deals/DealEmotionTimeline';
import { Deal } from '../types/deals';

const DealDetailViewPage: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dealId) {
      loadDealData();
    }
  }, [dealId]);

  const loadDealData = async () => {
    try {
      setIsLoading(true);
      const dealData = await DealsAPI.getDeal(dealId!);
      setDeal(dealData);
    } catch (error) {
      console.error('Error loading deal data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load deal data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'email':
        showToast({
          type: 'info',
          title: 'Email Composer',
          description: 'Opening email composer...'
        });
        break;
      case 'task':
        showToast({
          type: 'info',
          title: 'Create Task',
          description: 'Opening task creation modal...'
        });
        break;
      case 'meeting':
        showToast({
          type: 'info',
          title: 'Schedule Meeting',
          description: 'Opening calendar...'
        });
        break;
      case 'contact':
        navigate(`/contacts/${deal?.contact?.id}`);
        break;
      case 'company':
        navigate(`/companies/${deal?.company?.id}`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        <div className="relative z-10">
          <Container>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#b0b0d0]">Loading deal details...</p>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        <div className="relative z-10">
          <Container>
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-white mb-4">Deal Not Found</h2>
              <p className="text-[#b0b0d0] mb-6">The deal you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/deals')} variant="primary">
                Back to Deals
              </Button>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      <div className="relative z-10">
        <Container>
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/deals')}
                  variant="secondary"
                  size="sm"
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">{deal.title}</h1>
                  <p className="text-[#b0b0d0]">Deal Details & Analytics</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="primary" size="sm">
                  ${deal.value?.toLocaleString()}
                </Badge>
                <Badge variant={deal.stage?.name === 'Closed' ? 'success' : 'secondary'} size="sm">
                  {deal.stage?.name}
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button
                onClick={() => handleQuickAction('email')}
                variant="gradient"
                size="sm"
                icon={Mail}
                className="flex-col h-20"
              >
                <span>Send Email</span>
              </Button>
              <Button
                onClick={() => handleQuickAction('task')}
                variant="secondary"
                size="sm"
                icon={CheckSquare}
                className="flex-col h-20"
              >
                <span>Add Task</span>
              </Button>
              <Button
                onClick={() => handleQuickAction('meeting')}
                variant="secondary"
                size="sm"
                icon={Calendar}
                className="flex-col h-20"
              >
                <span>Schedule Meeting</span>
              </Button>
              <Button
                onClick={() => handleQuickAction('contact')}
                variant="secondary"
                size="sm"
                icon={User}
                className="flex-col h-20"
              >
                <span>View Contact</span>
              </Button>
              <Button
                onClick={() => handleQuickAction('company')}
                variant="secondary"
                size="sm"
                icon={Building}
                className="flex-col h-20"
              >
                <span>View Company</span>
              </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Deal Information */}
              <div className="lg:col-span-1 space-y-6">
                {/* Deal Details */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Deal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#b0b0d0] text-sm">Value</label>
                      <p className="text-white font-semibold">${deal.value?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-[#b0b0d0] text-sm">Stage</label>
                      <p className="text-white font-semibold">{deal.stage?.name}</p>
                    </div>
                    <div>
                      <label className="text-[#b0b0d0] text-sm">Probability</label>
                      <p className="text-white font-semibold">{deal.probability}%</p>
                    </div>
                    <div>
                      <label className="text-[#b0b0d0] text-sm">Expected Close Date</label>
                      <p className="text-white font-semibold">
                        {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-semibold">{deal.contact?.name}</p>
                      <p className="text-[#b0b0d0] text-sm">{deal.contact?.email}</p>
                      <p className="text-[#b0b0d0] text-sm">{deal.contact?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Company
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-semibold">{deal.company?.name}</p>
                      <p className="text-[#b0b0d0] text-sm">{deal.company?.industry}</p>
                      <p className="text-[#b0b0d0] text-sm">{deal.company?.website}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="lg:col-span-2">
                <DealEmotionTimeline dealId={dealId!} />
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="w-8 h-8 bg-[#a259ff] rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Email sent to {deal.contact?.name}</p>
                    <p className="text-[#b0b0d0] text-sm">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Task completed: Follow up call</p>
                    <p className="text-[#b0b0d0] text-sm">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Meeting scheduled with {deal.contact?.name}</p>
                    <p className="text-[#b0b0d0] text-sm">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default DealDetailViewPage; y0uplõ
ö-