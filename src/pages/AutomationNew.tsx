import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Bot, 
  Save, 
  Play,
  Calendar,
  Zap,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandDropdown
} from '../contexts/BrandDesignContext';

interface TriggerConfig {
  kind: 'event' | 'schedule';
  event_type?: string;
  cron?: string;
}

interface NodeConfig {
  id: string;
  type: 'action' | 'condition' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface EdgeConfig {
  from: string;
  to: string;
  condition?: string;
}

const eventTypes = [
  { value: 'deal.created', label: 'Deal Created' },
  { value: 'deal.stage_changed', label: 'Deal Stage Changed' },
  { value: 'lead.created', label: 'Lead Created' },
  { value: 'lead.status_changed', label: 'Lead Status Changed' },
  { value: 'task.created', label: 'Task Created' },
  { value: 'task.status_changed', label: 'Task Status Changed' }
];

const actionTypes = [
  { value: 'email.send', label: 'Send Email' },
  { value: 'task.create', label: 'Create Task' },
  { value: 'deal.update_stage', label: 'Update Deal Stage' },
  { value: 'http.webhook', label: 'HTTP Webhook' },
  { value: 'proforma.create', label: 'Create Proforma' },
  { value: 'stock.reserve', label: 'Reserve Stock' }
];

const cronPresets = [
  { value: '0 9 * * 1', label: 'Every Monday at 9 AM' },
  { value: '0 9 * * *', label: 'Every day at 9 AM' },
  { value: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
  { value: '0 0 1 * *', label: 'First day of month' },
  { value: '0 0 * * 0', label: 'Every Sunday' }
];

const AutomationNewPage = () => {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<TriggerConfig>({ kind: 'event' });
  const [nodes, setNodes] = useState<NodeConfig[]>([]);
  const [edges, setEdges] = useState<EdgeConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addNode = (type: 'action' | 'condition' | 'delay') => {
    const newNode: NodeConfig = {
      id: generateNodeId(),
      type,
      name: type === 'action' ? 'email.send' : type === 'condition' ? 'condition' : 'delay',
      config: type === 'action' ? {
        to: '{{context.event.payload.new.email}}',
        subject: 'Hello!',
        body: 'This is an automated message.'
      } : type === 'condition' ? {
        expr: '{{context.event.payload.new.status}} == "qualified"'
      } : {
        ms: 86400000 // 1 day
      },
      position: { 
        x: Math.random() * 400 + 100, 
        y: nodes.length * 120 + 100 
      }
    };
    setNodes([...nodes, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<NodeConfig>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setEdges(edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId));
  };

  const addEdge = () => {
    if (nodes.length < 2) {
      showToast({ title: 'Need at least 2 nodes to create a connection', type: 'error' });
      return;
    }
    
    const newEdge: EdgeConfig = {
      from: nodes[0].id,
      to: nodes[1].id
    };
    setEdges([...edges, newEdge]);
  };

  const updateEdge = (index: number, updates: Partial<EdgeConfig>) => {
    setEdges(edges.map((edge, i) => 
      i === index ? { ...edge, ...updates } : edge
    ));
  };

  const deleteEdge = (index: number) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  const saveAutomation = async (status: 'draft' | 'active' = 'draft') => {
    if (!name.trim()) {
      showToast({ title: 'Please enter a workflow name', type: 'error' });
      return;
    }

    if (!trigger.kind || (trigger.kind === 'event' && !trigger.event_type) || (trigger.kind === 'schedule' && !trigger.cron)) {
      showToast({ title: 'Please configure the trigger', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const graph = { nodes, edges };
      
      const { data, error } = await supabase
        .from('automations')
        .insert({
          org_id: user?.org_id,
          name: name.trim(),
          description: description.trim() || null,
          status,
          trigger,
          graph,
          created_by: user?.id
        })
        .select('id')
        .single();

      if (error) throw error;
      
      showToast({ 
        title: `Workflow ${status === 'active' ? 'created and activated' : 'saved as draft'}`, 
        type: 'success' 
      });
      
      navigate(`/automations/${data.id}`);
    } catch (error: any) {
      console.error('Error saving automation:', error);
      showToast({ title: 'Failed to save workflow', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="New Workflow"
        subtitle="Create a self-optimizing revenue automation"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/automations')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </BrandButton>
            <BrandButton variant="secondary" onClick={() => saveAutomation('draft')} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1" />
              Save Draft
            </BrandButton>
            <BrandButton variant="green" onClick={() => saveAutomation('active')} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Bot className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Save & Activate
                </>
              )}
            </BrandButton>
          </div>
        }
      >
        {/* Basic Information */}
        <BrandCard variant="glass" className="mx-5 mb-5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Workflow Name *
              </label>
              <BrandInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lead Follow-up Sequence"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <BrandInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
        </BrandCard>

        {/* Trigger Configuration */}
        <BrandCard variant="glass" className="mx-5 mb-5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Trigger Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Trigger Type *
              </label>
              <BrandDropdown
                value={trigger.kind}
                onChange={(value) => setTrigger({ kind: value as 'event' | 'schedule' })}
                options={[
                  { value: 'event', label: 'Event-based' },
                  { value: 'schedule', label: 'Time-based' }
                ]}
              />
            </div>
            
            {trigger.kind === 'event' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Event Type *
                </label>
                <BrandDropdown
                  value={trigger.event_type || ''}
                  onChange={(value) => setTrigger({ ...trigger, event_type: value })}
                  options={eventTypes}
                />
              </div>
            )}
            
            {trigger.kind === 'schedule' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Schedule *
                </label>
                <BrandDropdown
                  value={trigger.cron || ''}
                  onChange={(value) => setTrigger({ ...trigger, cron: value })}
                  options={cronPresets}
                />
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Bot className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Trigger Help:</p>
                <p>
                  {trigger.kind === 'event' 
                    ? 'Event triggers fire when specific actions happen in your CRM (new leads, deal updates, etc.)'
                    : 'Schedule triggers run at specific times using cron expressions (daily, weekly, monthly, etc.)'
                  }
                </p>
              </div>
            </div>
          </div>
        </BrandCard>

        {/* Workflow Nodes */}
        <BrandCard variant="glass" className="mx-5 mb-5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              Workflow Steps
            </h3>
            <div className="flex space-x-2">
              <BrandButton variant="secondary" size="sm" onClick={() => addNode('action')}>
                <Plus className="w-4 h-4 mr-1" />
                Action
              </BrandButton>
              <BrandButton variant="secondary" size="sm" onClick={() => addNode('condition')}>
                <Plus className="w-4 h-4 mr-1" />
                Condition
              </BrandButton>
              <BrandButton variant="secondary" size="sm" onClick={() => addNode('delay')}>
                <Plus className="w-4 h-4 mr-1" />
                Delay
              </BrandButton>
            </div>
          </div>

          {nodes.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-4">No workflow steps yet</p>
              <p className="text-white/40 text-sm">Add actions, conditions, or delays to build your workflow</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        node.type === 'action' ? 'bg-blue-500/20 text-blue-400' :
                        node.type === 'condition' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {node.type === 'action' ? <Zap className="w-4 h-4" /> :
                         node.type === 'condition' ? <Bot className="w-4 h-4" /> :
                         <Calendar className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-white capitalize">{node.type}</h4>
                        <p className="text-xs text-white/60">Step {index + 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNode(node.id)}
                      className="p-1 text-white/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {node.type === 'action' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <BrandDropdown
                        value={node.name}
                        onChange={(value) => updateNode(node.id, { name: value })}
                        options={actionTypes}
                      />
                      {node.name === 'email.send' && (
                        <>
                          <BrandInput
                            placeholder="To: {{context.event.payload.new.email}}"
                            value={node.config.to || ''}
                            onChange={(e) => updateNode(node.id, { 
                              config: { ...node.config, to: e.target.value }
                            })}
                          />
                          <BrandInput
                            placeholder="Subject"
                            value={node.config.subject || ''}
                            onChange={(e) => updateNode(node.id, { 
                              config: { ...node.config, subject: e.target.value }
                            })}
                          />
                          <BrandInput
                            placeholder="Body"
                            value={node.config.body || ''}
                            onChange={(e) => updateNode(node.id, { 
                              config: { ...node.config, body: e.target.value }
                            })}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {node.type === 'condition' && (
                    <BrandInput
                      placeholder="{{context.event.payload.new.status}} == 'qualified'"
                      value={node.config.expr || ''}
                      onChange={(e) => updateNode(node.id, { 
                        config: { ...node.config, expr: e.target.value }
                      })}
                    />
                  )}

                  {node.type === 'delay' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <BrandInput
                        placeholder="Delay in milliseconds"
                        type="number"
                        value={node.config.ms || ''}
                        onChange={(e) => updateNode(node.id, { 
                          config: { ...node.config, ms: parseInt(e.target.value) || 0 }
                        })}
                      />
                      <div className="text-sm text-white/60 flex items-center">
                        {node.config.ms ? `${Math.round(node.config.ms / 86400000)} days` : 'Enter delay time'}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </BrandCard>

        {/* Connections */}
        {nodes.length > 1 && (
          <BrandCard variant="glass" className="mx-5 mb-5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Connections</h3>
              <BrandButton variant="secondary" size="sm" onClick={addEdge}>
                <Plus className="w-4 h-4 mr-1" />
                Add Connection
              </BrandButton>
            </div>

            <div className="space-y-3">
              {edges.map((edge, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <BrandDropdown
                    value={edge.from}
                    onChange={(value) => updateEdge(index, { from: value })}
                    options={nodes.map(node => ({ value: node.id, label: `Step: ${node.type}` }))}
                  />
                  <span className="text-white/60">→</span>
                  <BrandDropdown
                    value={edge.to}
                    onChange={(value) => updateEdge(index, { to: value })}
                    options={nodes.map(node => ({ value: node.id, label: `Step: ${node.type}` }))}
                  />
                  <BrandInput
                    placeholder="Condition (optional)"
                    value={edge.condition || ''}
                    onChange={(e) => updateEdge(index, { condition: e.target.value })}
                  />
                  <button
                    onClick={() => deleteEdge(index)}
                    className="p-1 text-white/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </BrandCard>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default AutomationNewPage;
