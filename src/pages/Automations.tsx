import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Bot, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock, 
  Zap,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  Copy,
  BookOpen
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { SAMPLE_WORKFLOWS, installSampleWorkflow } from '../utils/sampleWorkflows';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandDropdown
} from '../contexts/BrandDesignContext';

interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: {
    kind: 'event' | 'schedule';
    event_type?: string;
    cron?: string;
  };
  graph: {
    nodes: any[];
    edges: any[];
  };
  created_at: string;
  updated_at: string;
}

interface AutomationRun {
  id: string;
  automation_id: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  started_at: string;
  finished_at?: string;
  last_error?: string;
}

const AutomationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiConstraints, setAiConstraints] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAutomations();
    loadRecentRuns();
  }, [user]);

  const loadAutomations = async () => {
    if (!user?.org_id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error loading automations:', error);
      showToast({ title: 'Failed to load automations', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentRuns = async () => {
    if (!user?.org_id) return;
    
    try {
      const { data, error } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('org_id', user.org_id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRuns(data || []);
    } catch (error) {
      console.error('Error loading runs:', error);
    }
  };

  const generateWithAI = async () => {
    if (!aiGoal.trim()) {
      showToast({ title: 'Please describe your workflow goal', type: 'error' });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('automation-generate', {
        body: { 
          org_id: user?.org_id, 
          goal: aiGoal, 
          constraints: aiConstraints 
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      showToast({ 
        title: 'AI Workflow Generated!', 
        type: 'success' 
      });
      
      setShowAIModal(false);
      setAiGoal('');
      setAiConstraints('');
      loadAutomations();
      
      // Navigate to the new automation
      if (data?.automation_id) {
        navigate(`/automations/${data.automation_id}`);
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      showToast({ 
        title: 'AI Generation Failed', 
        type: 'error' 
      });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleAutomationStatus = async (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: newStatus })
        .eq('id', automation.id);

      if (error) throw error;
      
      loadAutomations();
      showToast({ 
        title: `Automation ${newStatus === 'active' ? 'activated' : 'paused'}`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error updating automation:', error);
      showToast({ title: 'Failed to update automation', type: 'error' });
    }
  };

  const deleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', automationId);

      if (error) throw error;
      
      loadAutomations();
      showToast({ title: 'Automation deleted', type: 'success' });
    } catch (error) {
      console.error('Error deleting automation:', error);
      showToast({ title: 'Failed to delete automation', type: 'error' });
    }
  };

  const installSample = async (workflow: any) => {
    if (!user?.org_id) return;
    
    setSamplesLoading(true);
    try {
      const data = await installSampleWorkflow(workflow, user.org_id, supabase);
      
      showToast({ 
        title: `Sample workflow "${workflow.name}" installed!`, 
        type: 'success' 
      });
      
      setShowSamplesModal(false);
      loadAutomations();
      
      // Navigate to the new workflow
      navigate(`/automations/${data.id}`);
    } catch (error: any) {
      console.error('Error installing sample:', error);
      showToast({ 
        title: 'Failed to install sample workflow', 
        type: 'error' 
      });
    } finally {
      setSamplesLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'draft': return <Edit className="w-4 h-4 text-blue-400" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTriggerDescription = (trigger: any) => {
    if (trigger.kind === 'event') {
      return `Event: ${trigger.event_type || 'Unknown'}`;
    }
    if (trigger.kind === 'schedule') {
      return `Schedule: ${trigger.cron || 'Unknown'}`;
    }
    return 'Unknown trigger';
  };

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || automation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeCount = automations.filter(a => a.status === 'active').length;
  const totalRuns = runs.length;
  const successfulRuns = runs.filter(r => r.status === 'success').length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Automation"
        subtitle="Self-optimizing revenue workflows powered by AI"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/automations/templates')}>
              <BookOpen className="w-4 h-4 mr-1" />
              Templates
            </BrandButton>
            <BrandButton variant="secondary" onClick={() => setShowSamplesModal(true)}>
              <Target className="w-4 h-4 mr-1" />
              Sample Workflows
            </BrandButton>
            <BrandButton variant="purple" onClick={() => setShowAIModal(true)}>
              <Bot className="w-4 h-4 mr-1" />
              Generate with AI
            </BrandButton>
            <BrandButton variant="primary" onClick={() => navigate('/automations/new')}>
              <Plus className="w-4 h-4 mr-1" />
              New Workflow
            </BrandButton>
          </div>
        }
      >
        {/* Stats Grid */}
        <BrandStatsGrid className="mx-5 mb-5">
          <BrandStatCard 
            icon={<Zap className="h-6 w-6 text-white" />} 
            title="Active Workflows" 
            value={activeCount} 
            borderGradient="blue" 
          />
          <BrandStatCard 
            icon={<Activity className="h-6 w-6 text-white" />} 
            title="Total Runs" 
            value={totalRuns} 
            borderGradient="green" 
          />
          <BrandStatCard 
            icon={<CheckCircle className="h-6 w-6 text-white" />} 
            title="Successful" 
            value={successfulRuns} 
            borderGradient="purple" 
          />
          <BrandStatCard 
            icon={<AlertCircle className="h-6 w-6 text-white" />} 
            title="Failed" 
            value={failedRuns} 
            borderGradient="red" 
          />
        </BrandStatsGrid>

        {/* Filters */}
        <BrandCard variant="glass" className="mx-5 mb-5 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BrandInput
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BrandDropdown
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'draft', label: 'Draft' }
              ]}
            />
            <div className="flex space-x-2">
              <BrandButton variant="secondary" onClick={loadAutomations}>
                <Activity className="w-4 h-4 mr-1" />
                Refresh
              </BrandButton>
            </div>
          </div>
        </BrandCard>

        {/* Automations List */}
        <div className="mx-5 space-y-4">
          {isLoading ? (
            <BrandCard variant="glass" className="p-8 text-center">
              <Activity className="w-8 h-8 text-white/60 mx-auto mb-4 animate-spin" />
              <p className="text-white/80">Loading automations...</p>
            </BrandCard>
          ) : filteredAutomations.length === 0 ? (
            <BrandCard variant="glass" className="p-8 text-center">
              <Bot className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No automations found</h3>
              <p className="text-white/60 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first workflow to automate your business processes'}
              </p>
              <div className="flex justify-center space-x-3">
                <BrandButton variant="secondary" onClick={() => setShowSamplesModal(true)}>
                  <Target className="w-4 h-4 mr-1" />
                  Use Sample
                </BrandButton>
                <BrandButton variant="purple" onClick={() => setShowAIModal(true)}>
                  <Bot className="w-4 h-4 mr-1" />
                  Generate with AI
                </BrandButton>
              </div>
            </BrandCard>
          ) : (
            filteredAutomations.map((automation) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <BrandCard 
                  variant="glass" 
                  borderGradient={automation.status === 'active' ? 'green' : automation.status === 'paused' ? 'yellow' : 'blue'}
                  className="p-6 cursor-pointer hover:bg-white/5"
                  onClick={() => navigate(`/automations/${automation.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(automation.status)}
                          <BrandBadge variant={
                            automation.status === 'active' ? 'success' : 
                            automation.status === 'paused' ? 'warning' : 'info'
                          }>
                            {automation.status}
                          </BrandBadge>
                        </div>
                      </div>
                      
                      {automation.description && (
                        <p className="text-white/70 text-sm mb-3">{automation.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <span>{getTriggerDescription(automation.trigger)}</span>
                        <span>•</span>
                        <span>{automation.graph?.nodes?.length || 0} nodes</span>
                        <span>•</span>
                        <span>Created {new Date(automation.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAutomationStatus(automation);
                        }}
                        className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      >
                        {automation.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/automations/${automation.id}/edit`);
                        }}
                        className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAutomation(automation.id);
                        }}
                        className="p-2 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </BrandCard>
              </motion.div>
            ))
          )}
        </div>

        {/* Sample Workflows Modal */}
        <Modal open={showSamplesModal} onClose={() => setShowSamplesModal(false)} size="xl">
          <div className="p-8 max-w-4xl w-full space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sample Workflows</h2>
                <p className="text-white/80">Ready-to-use automation templates for immediate value</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_WORKFLOWS.map((workflow, index) => (
                <BrandCard key={index} variant="glass" borderGradient="blue" className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white">{workflow.name}</h3>
                    <p className="text-sm text-white/70">{workflow.description}</p>
                    
                    <div className="flex items-center space-x-2 text-xs text-white/60">
                      <span>Trigger: {workflow.trigger.kind}</span>
                      <span>•</span>
                      <span>{workflow.graph.nodes.length} steps</span>
                    </div>
                    
                    <BrandButton 
                      variant="primary" 
                      size="sm" 
                      onClick={() => installSample(workflow)}
                      disabled={samplesLoading}
                      className="w-full"
                    >
                      {samplesLoading ? (
                        <>
                          <Activity className="w-3 h-3 mr-1 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Install
                        </>
                      )}
                    </BrandButton>
                  </div>
                </BrandCard>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Sample Workflow Benefits:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                    <li>**Lead Nurture**: Automatically welcome and follow up with new leads</li>
                    <li>**Deal SLA**: Prevent deals from stalling with automated escalation</li>
                    <li>**Invoice Reminders**: Ensure timely payments with smart reminders</li>
                    <li>**Order Processing**: Auto-create pro forma and reserve stock on order confirmation</li>
                  </ul>
                  <p className="mt-2 text-xs">All workflows are installed as drafts and can be customized before activation.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <BrandButton variant="secondary" onClick={() => setShowSamplesModal(false)}>
                Close
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* AI Generation Modal */}
        <Modal open={showAIModal} onClose={() => setShowAIModal(false)} size="lg">
          <div className="p-8 max-w-2xl w-full space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Workflow Generator</h2>
                <p className="text-white/80">Describe your business goal and AI will create a workflow</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Workflow Goal *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30 resize-none"
                  rows={4}
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  placeholder="e.g., When a lead with email domain *.co.uk is created, send intro email, wait 3 days, if no reply create a follow-up task and escalate deal stage."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30 resize-none"
                  rows={3}
                  value={aiConstraints}
                  onChange={(e) => setAiConstraints(e.target.value)}
                  placeholder="e.g., Only send emails during business hours, use our standard email templates, create high-priority tasks for enterprise leads..."
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Bot className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">AI can create workflows with:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                    <li>Email automation and follow-ups</li>
                    <li>Task creation and assignment</li>
                    <li>Deal stage progression</li>
                    <li>Webhook integrations</li>
                    <li>Time-based delays and conditions</li>
                    <li>Smart branching logic</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <BrandButton variant="secondary" onClick={() => setShowAIModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton 
                variant="purple" 
                onClick={generateWithAI} 
                disabled={aiLoading || !aiGoal.trim()}
              >
                {aiLoading ? (
                  <>
                    <Activity className="w-4 h-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-1" />
                    Generate Workflow
                  </>
                )}
              </BrandButton>
            </div>
          </div>
        </Modal>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default AutomationsPage;
