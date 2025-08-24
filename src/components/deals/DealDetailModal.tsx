import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  Building2, 
  Tag, 
  Percent,
  MessageSquare,
  Paperclip,
  Activity,
  Phone,
  Mail,
  Plus,
  TrendingUp,
  Mail as MailIcon,
  Cloud,
  Link,
  FileText,
  Briefcase,
  Repeat,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Target,
  Video,
  PhoneCall,
  Globe,
  Users,
  Trash2,
  Send,
  FilePlus,
  CalendarDays,
  CheckSquare,
  Bot,
  Sparkles,
  ArrowRight,
  Settings,
  Download,
  Share2,
  Star,
  Zap
} from 'lucide-react';
import { Deal, DealNote, DealActivity, DealEmail } from '../../types/deals';
import { DealsAPI } from '../../lib/deals-api';
import { Card } from '../common/Card';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import QuickActionButton from '../ui/QuickActionButton';
import { supabase } from '../../services/supabase';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onEdit: (deal: Deal) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ deal, onClose, onEdit }) => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'files' | 'activity' | 'scoring' | 'emails' | 'cloud' | 'recurring' | 'projects' | 'invoices' | 'custom'>('overview');
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [emails, setEmails] = useState<DealEmail[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  useEffect(() => {
    loadDealData();
  }, [deal.id]);

  const loadDealData = async () => {
    try {
      setLoading(true);
      const [notesData, activitiesData, emailsData] = await Promise.all([
        DealsAPI.getDealNotes(deal.id),
        DealsAPI.getDealActivities(deal.id),
        DealsAPI.getDealEmails(deal.id)
      ]);

      setNotes(notesData);
      setActivities(activitiesData);
      setEmails(emailsData);
    } catch (error) {
      console.error('Error loading deal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const note = await DealsAPI.createDealNote(deal.id, newNote);
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

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      // Create task in database
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask,
          description: `Task for deal: ${deal.title}`,
          deal_id: deal.id,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setNewTask('');
      setShowTaskInput(false);
      showToast({
        type: 'success',
        title: 'Task Created',
        description: 'Task has been created successfully'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create task'
      });
    }
  };

  const handleSendEmail = () => {
    setShowEmailComposer(true);
    setActiveTab('emails');
  };

  const handleCreateNote = () => {
    setShowNoteEditor(true);
    setActiveTab('notes');
  };

  const handleScheduleMeeting = () => {
    navigate('/calendar', { state: { prefillDeal: deal } });
    onClose();
  };

  const handleViewCompany = () => {
    if (deal.company?.id) {
      navigate(`/companies/${deal.company.id}`);
      onClose();
    } else {
      showToast({
        type: 'warning',
        title: 'No Company',
        description: 'This deal is not associated with a company'
      });
    }
  };

  const handleViewContact = () => {
    if (deal.contact?.id) {
      navigate(`/contacts/${deal.contact.id}`);
      onClose();
    } else {
      showToast({
        type: 'warning',
        title: 'No Contact',
        description: 'This deal is not associated with a contact'
      });
    }
  };

  const handleAskGuru = () => {
    openGuru();
    setTimeout(() => {
      // Send a contextual message to Guru about this deal
      const message = `Analyze deal "${deal.title}" with value $${deal.value} and ${deal.probability}% probability. Provide insights and recommendations.`;
      // Note: This would need to be implemented in the Guru context
    }, 300);
  };

  const handleExportDeal = () => {
    // Create a downloadable JSON file with deal data
    const dealData = {
      ...deal,
      notes,
      activities,
      emails,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dealData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-${deal.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Deal Exported',
      description: 'Deal data has been exported successfully'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'open':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    if (probability >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-400" />;
      case 'meeting':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'task':
        return <Target className="w-4 h-4 text-orange-400" />;
      case 'note':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <Activity className="w-4 h-4 text-dark-400" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: activities.length },
    { id: 'emails', label: 'Emails', icon: Mail, count: emails.length },
    { id: 'files', label: 'Files', icon: Paperclip, count: 0 },
    { id: 'cloud', label: 'Cloud', icon: Cloud },
    { id: 'scoring', label: 'Scoring', icon: TrendingUp },
    { id: 'recurring', label: 'Recurring Revenue', icon: Repeat },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'custom', label: 'Custom Fields', icon: SlidersHorizontal },
  ];

  // Quick Actions for Deal
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
      action: handleCreateNote
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
      action: () => setShowTaskInput(true)
    },
    {
      icon: Building,
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
    },
    {
      icon: Download,
      label: 'Export Deal',
      gradient: 'bg-gradient-to-br from-slate-500 via-slate-600 to-gray-700 hover:from-slate-600 hover:via-slate-700 hover:to-gray-800',
      action: handleExportDeal
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#23233a]/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col relative border border-[#23233a]/50" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-[#23233a]/50 bg-[#23233a]/40 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center space-x-4">
            {getStatusIcon(deal.status)}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{deal.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#b0b0d0]">
                <span className="font-mono">#{deal.id.slice(0, 8)}</span>
                {deal.stage && <Badge variant="primary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">{deal.stage.name}</Badge>}
                {deal.company && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{deal.company.name}</span>}
                {deal.contact && <span className="flex items-center gap-1"><User className="w-4 h-4" />{deal.contact.name}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 bg-[#23233a]/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#23233a]/50">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-lg font-semibold text-white">{formatCurrency(deal.value)}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#23233a]/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#23233a]/50">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold text-white">{deal.probability}%</span>
            </div>
            <button 
              onClick={() => onEdit(deal)} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
            >
              <Edit className="w-4 h-4" />Edit
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center flex-wrap gap-1 px-6 pt-4 border-b border-[#23233a]/50 bg-[#23233a]/40 backdrop-blur-sm sticky top-0 z-10">
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#18182c]/50 rounded-b-2xl">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions Grid */}
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Quick Actions
                </h3>
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

              {/* Deal Health Summary */}
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Deal Health & Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-[#23233a]/60 backdrop-blur-sm rounded-lg border border-[#23233a]/50">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Guru Health</p>
                      <p className="text-white font-semibold">Healthy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#23233a]/60 backdrop-blur-sm rounded-lg border border-[#23233a]/50">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Lead Score</p>
                      <p className="text-white font-semibold">85/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#23233a]/60 backdrop-blur-sm rounded-lg border border-[#23233a]/50">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Days in Stage</p>
                      <p className="text-white font-semibold">3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#23233a]/60 backdrop-blur-sm rounded-lg border border-[#23233a]/50">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Followers</p>
                      <p className="text-white font-semibold">2</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Deal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Deal Value</p>
                      <p className="text-lg font-semibold text-white">{formatCurrency(deal.value)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Probability</p>
                      <p className="text-lg font-semibold text-white">{deal.probability}%</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Expected Close</p>
                      <p className="text-lg font-semibold text-white">{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <Tag className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Tags</p>
                      <p className="text-lg font-semibold text-white">{deal.tags && deal.tags.length > 0 ? deal.tags.join(', ') : '—'}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Company & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300">
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
                <Card className="p-4 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300">
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

              {/* Add Task Input */}
              {showTaskInput && (
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Add Task</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      placeholder="Task title..."
                      className="flex-1 px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleAddTask}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowTaskInput(false)}
                      className="px-4 py-2 rounded-lg bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Notes ({notes.length})
                </h3>
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                    <MessageSquare className="w-10 h-10 mb-2 text-purple-400" />
                    <span>No notes yet. Add your first note!</span>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Activity ({activities.length})
                </h3>
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                    <Activity className="w-10 h-10 mb-2 text-purple-400" />
                    <span>No activity yet. Add a call, meeting, or task!</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <Card key={activity.id} className="p-4 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50">
                        <div className="flex items-center gap-2 mb-2">
                          {getActivityIcon(activity.type)}
                          <span className="text-[#b0b0d0] text-xs">{formatDistanceToNow(new Date(activity.created_at))} ago</span>
                        </div>
                        <div className="text-white text-sm font-semibold mb-1">{activity.title}</div>
                        <div className="text-[#b0b0d0] text-sm">{activity.description}</div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    Emails ({emails.length})
                  </h3>
                  <button
                    onClick={handleSendEmail}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
                {emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                    <Mail className="w-10 h-10 mb-2 text-purple-400" />
                    <span>No emails yet. Send or log an email!</span>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                <Paperclip className="w-10 h-10 mb-2 text-purple-400" />
                <span>No files yet. Upload or link files here soon!</span>
              </div>
            </div>
          )}

          {/* Cloud Tab */}
          {activeTab === 'cloud' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                <Cloud className="w-10 h-10 mb-2 text-purple-400" />
                <span>Cloud storage integration coming soon!</span>
              </div>
            </div>
          )}

          {/* Scoring Tab */}
          {activeTab === 'scoring' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Deal Scoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50 flex flex-col items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-purple-400 mb-2" />
                  <h4 className="text-white font-semibold mb-2">Engagement Score</h4>
                  <span className="text-[#b0b0d0]">Current Score: 85/100</span>
                </Card>
                <Card className="p-6 bg-[#23233a]/60 backdrop-blur-sm border border-[#23233a]/50 flex flex-col items-center justify-center">
                  <Activity className="w-10 h-10 text-purple-400 mb-2" />
                  <h4 className="text-white font-semibold mb-2">Score Logs</h4>
                  <span className="text-[#b0b0d0]">No score logs yet.</span>
                </Card>
              </div>
            </div>
          )}

          {/* Recurring Revenue Tab */}
          {activeTab === 'recurring' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                <Repeat className="w-10 h-10 mb-2 text-purple-400" />
                <span>No recurring revenue data yet.</span>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                <Briefcase className="w-10 h-10 mb-2 text-purple-400" />
                <span>No projects linked yet.</span>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                <FileText className="w-10 h-10 mb-2 text-purple-400" />
                <span>No invoices yet.</span>
              </div>
            </div>
          )}

          {/* Custom Fields Tab */}
          {activeTab === 'custom' && (
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex flex-col items-center justify-center py-12 text-[#b0b0d0]">
                <SlidersHorizontal className="w-10 h-10 mb-2 text-purple-400" />
                <span>No custom fields set for this deal.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 