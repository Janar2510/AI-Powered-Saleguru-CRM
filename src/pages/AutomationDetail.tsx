import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Play, 
  Pause, 
  Save, 
  Code, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Settings,
  ArrowLeft,
  Bot,
  Zap,
  Clock,
  GitBranch,
  Mail,
  Plus
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  BrandBackground,
  BrandPageLayout,
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
  status: 'running' | 'success' | 'failed' | 'cancelled';
  started_at: string;
  finished_at?: string;
  last_error?: string;
}

// Custom node types for workflow visualization
const nodeTypes = {
  action: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 text-white">
      <div className="flex items-center space-x-2">
        <Zap className="w-4 h-4" />
        <div>
          <div className="font-medium text-sm">{data.name || 'Action'}</div>
          <div className="text-xs opacity-70">{data.type}</div>
        </div>
      </div>
    </div>
  ),
  condition: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30 text-white">
      <div className="flex items-center space-x-2">
        <GitBranch className="w-4 h-4" />
        <div>
          <div className="font-medium text-sm">Condition</div>
          <div className="text-xs opacity-70">{data.expr || 'if/else'}</div>
        </div>
      </div>
    </div>
  ),
  delay: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 text-white">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <div>
          <div className="font-medium text-sm">Delay</div>
          <div className="text-xs opacity-70">{data.duration || '1 day'}</div>
        </div>
      </div>
    </div>
  )
};

const AutomationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (id) {
      loadAutomation();
      loadRuns();
    }
  }, [id]);

  const loadAutomation = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setAutomation(data);
      convertGraphToFlow(data.graph);
    } catch (error) {
      console.error('Error loading automation:', error);
      showToast({ title: 'Failed to load automation', type: 'error' });
      navigate('/automations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRuns = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('automation_id', id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRuns(data || []);
    } catch (error) {
      console.error('Error loading runs:', error);
    }
  };

  const convertGraphToFlow = (graph: any) => {
    if (!graph?.nodes) return;

    const flowNodes: Node[] = graph.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        name: node.name,
        type: node.type,
        expr: node.config?.expr,
        duration: node.config?.ms ? `${Math.round(node.config.ms / 86400000)} days` : undefined,
        ...node.config
      }
    }));

    const flowEdges: Edge[] = (graph.edges || []).map((edge: any) => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.condition || undefined,
      animated: true,
      style: { stroke: '#a259ff' }
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const convertFlowToGraph = () => {
    const graphNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.data.name,
      position: node.position,
      config: {
        ...node.data,
        expr: node.data.expr,
        ms: node.data.duration ? parseInt(node.data.duration) * 86400000 : undefined
      }
    }));

    const graphEdges = edges.map(edge => ({
      from: edge.source,
      to: edge.target,
      condition: edge.label || undefined
    }));

    return { nodes: graphNodes, edges: graphEdges };
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const saveAutomation = async () => {
    if (!automation) return;
    
    setIsSaving(true);
    try {
      const graph = convertFlowToGraph();
      
      const { error } = await supabase
        .from('automations')
        .update({ graph, updated_at: new Date().toISOString() })
        .eq('id', automation.id);

      if (error) throw error;
      
      showToast({ title: 'Automation saved', type: 'success' });
      loadAutomation(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving automation:', error);
      showToast({ title: 'Failed to save automation', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAutomationStatus = async () => {
    if (!automation) return;
    
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: newStatus })
        .eq('id', automation.id);

      if (error) throw error;
      
      setAutomation({ ...automation, status: newStatus });
      showToast({ 
        title: `Automation ${newStatus === 'active' ? 'activated' : 'paused'}`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error updating automation:', error);
      showToast({ title: 'Failed to update automation', type: 'error' });
    }
  };

  const openJsonEditor = () => {
    if (automation) {
      setJsonText(JSON.stringify(automation.graph, null, 2));
      setShowJsonModal(true);
    }
  };

  const applyJsonChanges = () => {
    try {
      const parsedGraph = JSON.parse(jsonText);
      convertGraphToFlow(parsedGraph);
      setShowJsonModal(false);
      showToast({ title: 'JSON changes applied', type: 'success' });
    } catch (error) {
      showToast({ title: 'Invalid JSON format', type: 'error' });
    }
  };

  // Governance functions
  const requestApproval = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-approval', { 
        body: { 
          automation_id: id, 
          action: 'request', 
          actor_id: user?.id, 
          notes: 'Please approve this automation workflow' 
        }
      });
      
      if (error || data?.error) throw new Error(error?.message || data?.error);
      
      loadAutomation();
      showToast({ title: 'Approval requested', type: 'success' });
    } catch (error: any) {
      showToast({ title: 'Failed to request approval', type: 'error' });
    }
  };

  const approve = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-approval', { 
        body: { 
          automation_id: id, 
          action: 'approve', 
          actor_id: user?.id, 
          notes: 'Workflow approved for execution' 
        }
      });
      
      if (error || data?.error) throw new Error(error?.message || data?.error);
      
      loadAutomation();
      showToast({ title: 'Automation approved', type: 'success' });
    } catch (error: any) {
      showToast({ title: 'Failed to approve automation', type: 'error' });
    }
  };

  const reject = async () => {
    const notes = prompt('Reason for rejection:') || '';
    try {
      const { data, error } = await supabase.functions.invoke('automation-approval', { 
        body: { 
          automation_id: id, 
          action: 'reject', 
          actor_id: user?.id, 
          notes 
        }
      });
      
      if (error || data?.error) throw new Error(error?.message || data?.error);
      
      loadAutomation();
      showToast({ title: 'Automation rejected', type: 'success' });
    } catch (error: any) {
      showToast({ title: 'Failed to reject automation', type: 'error' });
    }
  };

  const addSplit = () => {
    const nodeId = `split_${Date.now()}`;
    const newNode = {
      id: nodeId,
      type: 'split',
      name: 'A/B Split',
      position: { x: 200, y: 200 },
      data: { label: 'A/B Split' }
    };
    
    setNodes(prev => [...prev, newNode]);
    showToast({ title: 'Split node added', type: 'success' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'draft': return <Settings className="w-4 h-4 text-blue-400" />;
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

  if (isLoading) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Loading..." subtitle="Loading automation details">
          <div className="flex items-center justify-center min-h-96">
            <Activity className="w-8 h-8 text-white/60 animate-spin" />
          </div>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  if (!automation) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Not Found" subtitle="Automation not found">
          <div className="text-center">
            <BrandButton onClick={() => navigate('/automations')}>
              Back to Automations
            </BrandButton>
          </div>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title={automation.name}
        subtitle={automation.description || 'Workflow automation'}
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/automations')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </BrandButton>
            {automation.status !== 'active' ? (
              <BrandButton variant="green" onClick={toggleAutomationStatus}>
                <Play className="w-4 h-4 mr-1" />
                Activate
              </BrandButton>
            ) : (
              <BrandButton variant="yellow" onClick={toggleAutomationStatus}>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </BrandButton>
            )}
            <BrandButton variant="secondary" onClick={openJsonEditor}>
              <Code className="w-4 h-4 mr-1" />
              Edit JSON
            </BrandButton>
            <BrandButton variant="secondary" onClick={addSplit}>
              <Plus className="w-4 h-4 mr-1" />
              Add A/B Split
            </BrandButton>
            {automation?.approval_status === 'draft' && (
              <BrandButton variant="secondary" onClick={requestApproval}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Request Approval
              </BrandButton>
            )}
            {automation?.approval_status === 'pending' && (
              <>
                <BrandButton variant="primary" onClick={approve}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </BrandButton>
                <BrandButton variant="secondary" onClick={reject}>
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </BrandButton>
              </>
            )}
            <BrandButton variant="primary" onClick={saveAutomation} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Activity className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </BrandButton>
          </div>
        }
      >
        {/* Status and Info Bar */}
        <BrandCard variant="glass" className="mx-5 mb-5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {getStatusIcon(automation.status)}
                <BrandBadge variant={
                  automation.status === 'active' ? 'success' : 
                  automation.status === 'paused' ? 'warning' : 'info'
                }>
                  {automation.status}
                </BrandBadge>
              </div>
              
              <div className="text-sm text-white/70">
                <span>{getTriggerDescription(automation.trigger)}</span>
              </div>
              
              <div className="text-sm text-white/70">
                <span>{nodes.length} nodes • {edges.length} connections</span>
              </div>
            </div>
            
            <div className="text-sm text-white/60">
              Updated {new Date(automation.updated_at).toLocaleString()}
            </div>
          </div>
        </BrandCard>

        {/* Workflow Builder */}
        <BrandCard variant="glass" className="mx-5 mb-5" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Background color="#ffffff20" />
            <Controls className="bg-black/20 border border-white/20" />
            <MiniMap 
              className="bg-black/20 border border-white/20" 
              nodeColor="#a259ff"
              maskColor="rgba(0, 0, 0, 0.2)"
            />
          </ReactFlow>
        </BrandCard>

        {/* Recent Runs */}
        <BrandCard variant="glass" className="mx-5 mb-5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Runs</h3>
          {runs.length === 0 ? (
            <p className="text-white/60">No runs yet</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div 
                  key={run.id} 
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(run.status)}
                    <div>
                      <div className="text-sm text-white font-medium">
                        Run {run.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-white/60">
                        Started {new Date(run.started_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <BrandBadge variant={
                      run.status === 'success' ? 'success' :
                      run.status === 'failed' ? 'error' :
                      run.status === 'running' ? 'info' : 'warning'
                    }>
                      {run.status}
                    </BrandBadge>
                    {run.finished_at && (
                      <div className="text-xs text-white/60 mt-1">
                        Finished {new Date(run.finished_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BrandCard>

        {/* JSON Editor Modal */}
        <Modal open={showJsonModal} onClose={() => setShowJsonModal(false)} size="xl">
          <div className="p-8 max-w-4xl w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Workflow JSON</h2>
              <div className="flex space-x-2">
                <BrandButton variant="secondary" onClick={() => setShowJsonModal(false)}>
                  Cancel
                </BrandButton>
                <BrandButton variant="primary" onClick={applyJsonChanges}>
                  Apply Changes
                </BrandButton>
              </div>
            </div>
            
            <textarea
              className="w-full h-96 px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30 font-mono text-sm resize-none"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Edit workflow JSON..."
            />
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">JSON Editor Warning</p>
                  <p>Editing JSON directly can break your workflow. Make sure the structure is valid before applying changes.</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default AutomationDetailPage;
