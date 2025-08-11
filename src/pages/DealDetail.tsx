import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Save, X, DollarSign, Calendar, User, Building2, Tag, 
  TrendingUp, MessageSquare, Paperclip, Activity, Phone, Mail, Plus, 
  Cloud, FileText, Briefcase, Repeat, SlidersHorizontal, CheckCircle, 
  XCircle, Clock, Eye, Target, Video, PhoneCall, Globe, Users, Trash2,
  Send, FilePlus, CalendarDays, CheckSquare, Bot, Sparkles, ArrowRight,
  Settings, Download, Share2, Star, Zap, ChevronRight, Bell, UserPlus,
  GitBranch, Play, Pause, RotateCcw, MoreHorizontal, Filter, Search,
  BarChart3, PieChart, LineChart, TrendingDown, AlertTriangle, Info
} from 'lucide-react';
import { Deal, DealNote, DealActivity, DealEmail } from '../types/deals';
import { DealsAPI } from '../lib/deals-api';
import { Card } from '../components/common/Card';
import { formatDistanceToNow } from 'date-fns';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import QuickActionButton from '../components/ui/QuickActionButton';
import { supabase } from '../services/supabase';
import Container from '../components/layout/Container';
import Spline from '@splinetool/react-spline';

interface DealDetailProps {}

export const DealDetail: React.FC<DealDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'activity' | 'emails' | 'calls' | 'automations' | 'tasks' | 'team' | 'analytics' | 'files' | 'edit'>('overview');
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [emails, setEmails] = useState<DealEmail[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMentions, setTeamMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Editable fields state
  const [editableFields, setEditableFields] = useState({
    title: '',
    description: '',
    value: 0,
    probability: 0,
    expected_close_date: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (id) {
      loadDealData();
    }
  }, [id]);

  const loadDealData = async () => {
    try {
      console.log('Loading deal data for ID:', id);
      setLoading(true);
      
      if (!id) {
        console.error('No deal ID provided');
        showToast({
          type: 'error',
          title: 'Error',
          description: 'No deal ID provided'
        });
        return;
      }

      const dealData = await DealsAPI.getDeal(id);
      console.log('Deal data loaded:', dealData);
      
      if (!dealData) {
        console.error('Deal not found');
        showToast({
          type: 'error',
          title: 'Error',
          description: 'Deal not found'
        });
        return;
      }

      setDeal(dealData);
      setEditableFields({
        title: dealData.title,
        description: dealData.description || '',
        value: dealData.value,
        probability: dealData.probability,
        expected_close_date: dealData.expected_close_date || '',
        tags: dealData.tags || []
      });

      // Load related data with individual error handling
      try {
        const notesData = await DealsAPI.getDealNotes(id);
        setNotes(notesData);
      } catch (error) {
        console.warn('Failed to load deal notes:', error);
        setNotes([]);
      }

      try {
        const activitiesData = await DealsAPI.getDealActivities(id);
        setActivities(activitiesData);
      } catch (error) {
        console.warn('Failed to load deal activities:', error);
        setActivities([]);
      }

      try {
        const emailsData = await DealsAPI.getDealEmails(id);
        setEmails(emailsData);
      } catch (error) {
        console.warn('Failed to load deal emails:', error);
        setEmails([]);
      }

      try {
        const callsData = await loadDealCalls(id);
        setCalls(callsData);
      } catch (error) {
        console.warn('Failed to load deal calls:', error);
        setCalls([]);
      }

      try {
        const automationsData = await loadDealAutomations(id);
        setAutomations(automationsData);
      } catch (error) {
        console.warn('Failed to load deal automations:', error);
        setAutomations([]);
      }

      try {
        const tasksData = await loadDealTasks(id);
        setTasks(tasksData);
      } catch (error) {
        console.warn('Failed to load deal tasks:', error);
        setTasks([]);
      }

      try {
        const teamData = await loadTeamMentions(id);
        setTeamMentions(teamData);
      } catch (error) {
        console.warn('Failed to load team mentions:', error);
        setTeamMentions([]);
      }

    } catch (error) {
      console.error('Error loading deal data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load deal data'
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const loadDealCalls = async (dealId: string) => {
    // Mock call data - replace with actual API call
    return [
      { id: '1', type: 'incoming', duration: '15:30', date: new Date(), contact: 'Jane Smith', notes: 'Discussed pricing' },
      { id: '2', type: 'outgoing', duration: '08:45', date: new Date(Date.now() - 86400000), contact: 'John Doe', notes: 'Follow-up call' }
    ];
  };

  const loadDealAutomations = async (dealId: string) => {
    // Mock automation data - replace with actual API call
    return [
      { id: '1', name: 'Follow-up Reminder', status: 'active', lastTriggered: new Date(), triggerCount: 3 },
      { id: '2', name: 'Stage Change Alert', status: 'active', lastTriggered: new Date(Date.now() - 86400000), triggerCount: 1 }
    ];
  };

  const loadDealTasks = async (dealId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Error in loadDealTasks:', error);
      return [];
    }
  };

  const loadTeamMentions = async (dealId: string) => {
    // Mock team mentions data - replace with actual API call
    return [
      { id: '1', user: 'Sarah Johnson', message: 'Please review the proposal', date: new Date(), type: 'mention' },
      { id: '2', user: 'Mike Wilson', message: 'Client requested demo', date: new Date(Date.now() - 86400000), type: 'task' }
    ];
  };

  const handleSaveDeal = async () => {
    if (!deal) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          title: editableFields.title,
          description: editableFields.description,
          value: editableFields.value,
          probability: editableFields.probability,
          expected_close_date: editableFields.expected_close_date || null,
          tags: editableFields.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);

      if (error) throw error;

      setDeal(prev => prev ? { ...prev, ...editableFields } : null);
      setIsEditing(false);
      showToast({
        type: 'success',
        title: 'Deal Updated',
        description: 'Deal has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating deal:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update deal'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !deal) return;

    try {
      const note = await DealsAPI.createDealNote({
        deal_id: deal.id,
        content: newNote,
        owner_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setNotes(prev => [note, ...prev]);
      setNewNote('');
      showToast({
        type: 'success',
        title: 'Note Added',
        description: 'Note has been added successfully'
      });
    } catch (error) {
      console.error('Error adding note:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to add note'
      });
    }
  };

  const handleSendEmail = () => {
    setShowEmailComposer(true);
    setActiveTab('emails');
  };

  const handleAddTask = () => {
    setShowTaskModal(true);
  };

  const handleScheduleMeeting = () => {
    setShowEventModal(true);
  };

  const handleMakeCall = () => {
    setShowCallModal(true);
  };

  const handleViewCompany = () => {
    if (deal?.company?.id) {
      navigate(`/companies/${deal.company.id}`);
    }
  };

  const handleViewContact = () => {
    if (deal?.contact?.id) {
      navigate(`/contacts/${deal.contact.id}`);
    }
  };

  const handleAskGuru = () => {
    openGuru();
    setTimeout(() => {
      const message = `Analyze deal "${deal?.title}" with value $${deal?.value} and ${deal?.probability}% probability. Provide insights and recommendations.`;
      // Send message to Guru
    }, 300);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: activities.length },
    { id: 'emails', label: 'Emails', icon: Mail, count: emails.length },
    { id: 'calls', label: 'Calls', icon: Phone, count: calls.length },
    { id: 'automations', label: 'Automations', icon: GitBranch, count: automations.length },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'team', label: 'Team', icon: Users, count: teamMentions.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'edit', label: 'Edit', icon: Edit }
  ];

  const quickActions = [
    {
      icon: Mail,
      label: 'Send Email',
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: handleSendEmail
    },
    {
      icon: FileText,
      label: 'Add Note',
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: () => setActiveTab('notes')
    },
    {
      icon: CalendarDays,
      label: 'Schedule Meeting',
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: handleScheduleMeeting
    },
    {
      icon: CheckSquare,
      label: 'Add Task',
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: handleAddTask
    },
    {
      icon: Phone,
      label: 'Make Call',
      gradient: 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 hover:from-green-600 hover:via-green-700 hover:to-emerald-800',
      action: handleMakeCall
    },
    {
      icon: Building2,
      label: 'View Company',
      gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 hover:from-indigo-600 hover:via-indigo-700 hover:to-purple-800',
      action: handleViewCompany
    },
    {
      icon: User,
      label: 'View Contact',
      gradient: 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-700 hover:from-pink-600 hover:via-pink-700 hover:to-rose-800',
      action: handleViewContact
    },
    {
      icon: Bot,
      label: 'Ask Guru',
      gradient: 'bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 hover:from-violet-600 hover:via-violet-700 hover:to-purple-800',
      action: handleAskGuru
    }
  ];

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#b0b0d0]">Loading deal details...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!deal) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-[#b0b0d0]">Deal not found</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Container>
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/deals')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 text-white hover:bg-[#23233a]/60 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Deals
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
                  <p className="text-[#b0b0d0]">Deal #{deal.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveDeal}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Deal
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <QuickActionButton
                    key={index}
                    icon={action.icon}
                    label={action.label}
                    onClick={action.action}
                    gradient={action.gradient}
                    className="min-h-[60px] text-sm"
                  />
                ))}
              </div>
            </div>

            {/* Deal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-sm text-[#b0b0d0]">Deal Value</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(deal.value)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-sm text-[#b0b0d0]">Probability</p>
                    <p className="text-lg font-semibold text-white">{deal.probability}%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <div>
                    <p className="text-sm text-[#b0b0d0]">Expected Close</p>
                    <p className="text-lg font-semibold text-white">{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-6 h-6 text-orange-400" />
                  <div>
                    <p className="text-sm text-[#b0b0d0]">Automations</p>
                    <p className="text-lg font-semibold text-white">{automations.length} active</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
              <div className="flex items-center flex-wrap gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      activeTab === tab.id 
                        ? 'bg-[#23233a]/60 text-purple-300 shadow-lg border border-purple-500/30' 
                        : 'text-[#b0b0d0] hover:text-purple-300 hover:bg-[#23233a]/40'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="ml-1 text-xs font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 min-h-[400px]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Deal Overview</h3>
                  
                  {/* Deal Health & Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Guru Health</p>
                          <p className="text-white font-semibold">Healthy</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Lead Score</p>
                          <p className="text-white font-semibold">85/100</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Days in Stage</p>
                          <p className="text-white font-semibold">3 days</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Followers</p>
                          <p className="text-white font-semibold">2</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Company & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-blue-400" />
                        <div className="flex-1">
                          <p className="text-sm text-[#b0b0d0]">Company</p>
                          <p className="text-lg font-semibold text-white">{deal.company?.name || '—'}</p>
                        </div>
                        {deal.company && (
                          <button
                            onClick={handleViewCompany}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </Card>
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-green-400" />
                        <div className="flex-1">
                          <p className="text-sm text-[#b0b0d0]">Contact</p>
                          <p className="text-lg font-semibold text-white">{deal.contact?.name || '—'}</p>
                        </div>
                        {deal.contact && (
                          <button
                            onClick={handleViewContact}
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Description */}
                  {deal.description && (
                    <Card className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <h4 className="text-white font-semibold mb-2">Description</h4>
                      <p className="text-[#b0b0d0]">{deal.description}</p>
                    </Card>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Notes</h3>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-4">
                    {notes.map(note => (
                      <Card key={note.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-purple-400" />
                          <span className="text-[#b0b0d0] text-xs">{formatDistanceToNow(new Date(note.created_at))} ago</span>
                        </div>
                        <div className="text-white text-sm">{note.content}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Activity Timeline</h3>
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <Card key={activity.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-purple-400" />
                          <span className="text-[#b0b0d0] text-xs">{formatDistanceToNow(new Date(activity.created_at))} ago</span>
                        </div>
                        <div className="text-white text-sm font-semibold mb-1">{activity.title}</div>
                        <div className="text-[#b0b0d0] text-sm">{activity.description}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Emails Tab */}
              {activeTab === 'emails' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Emails</h3>
                    <button
                      onClick={handleSendEmail}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                    >
                      <Send className="w-4 h-4" />
                      Send Email
                    </button>
                  </div>
                  <div className="space-y-4">
                    {emails.map(email => (
                      <Card key={email.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <span className="text-[#b0b0d0] text-xs">{formatDistanceToNow(new Date(email.created_at))} ago</span>
                        </div>
                        <div className="text-white text-sm font-semibold mb-1">{email.subject}</div>
                        <div className="text-[#b0b0d0] text-sm">{email.body}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Calls Tab */}
              {activeTab === 'calls' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Call History</h3>
                    <button
                      onClick={handleMakeCall}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                    >
                      <Phone className="w-4 h-4" />
                      Make Call
                    </button>
                  </div>
                  <div className="space-y-4">
                    {calls.map(call => (
                      <Card key={call.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{call.contact}</div>
                            <div className="text-[#b0b0d0] text-sm">{call.notes}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{call.duration}</div>
                            <div className="text-[#b0b0d0] text-sm">{call.date.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Automations Tab */}
              {activeTab === 'automations' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Active Automations</h3>
                  <div className="space-y-4">
                    {automations.map(automation => (
                      <Card key={automation.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{automation.name}</div>
                            <div className="text-[#b0b0d0] text-sm">Triggered {automation.triggerCount} times</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">Active</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Tasks</h3>
                    <button
                      onClick={handleAddTask}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <Card key={task.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{task.title}</div>
                            <div className="text-[#b0b0d0] text-sm">{task.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{task.status}</div>
                            <div className="text-[#b0b0d0] text-sm">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Team Activity</h3>
                  <div className="space-y-4">
                    {teamMentions.map(mention => (
                      <Card key={mention.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold">{mention.user}</div>
                            <div className="text-[#b0b0d0] text-sm">{mention.message}</div>
                          </div>
                          <div className="text-[#b0b0d0] text-xs">{mention.date.toLocaleDateString()}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Deal Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <h4 className="text-white font-semibold mb-4">Engagement Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#b0b0d0]">Email Opens</span>
                          <span className="text-white font-semibold">85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b0b0d0]">Response Rate</span>
                          <span className="text-white font-semibold">60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b0b0d0]">Meeting Attendance</span>
                          <span className="text-white font-semibold">100%</span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                      <h4 className="text-white font-semibold mb-4">Activity Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#b0b0d0]">Total Calls</span>
                          <span className="text-white font-semibold">{calls.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b0b0d0]">Emails Sent</span>
                          <span className="text-white font-semibold">{emails.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b0b0d0]">Tasks Completed</span>
                          <span className="text-white font-semibold">{tasks.filter(t => t.status === 'completed').length}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Edit Tab */}
              {activeTab === 'edit' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Edit Deal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Deal Title</label>
                      <input
                        type="text"
                        value={editableFields.title}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Deal Value</label>
                      <input
                        type="number"
                        value={editableFields.value}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Probability (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editableFields.probability}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Expected Close Date</label>
                      <input
                        type="date"
                        value={editableFields.expected_close_date}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, expected_close_date: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      value={editableFields.description}
                      onChange={(e) => setEditableFields(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveDeal}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 rounded-lg bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}; 