import React, { useState } from 'react';
import { Zap, Plus, Play, Pause, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    condition: string;
  };
  action: {
    type: string;
    details: string;
  };
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
}

interface AutomationRulesProps {
  onChanges: (hasChanges: boolean) => void;
}

const AutomationRules: React.FC<AutomationRulesProps> = ({ onChanges }) => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Welcome Email for New Leads',
      description: 'Send welcome email when a new lead is created',
      trigger: {
        type: 'Deal Created',
        condition: 'Stage equals "Lead"'
      },
      action: {
        type: 'Send Email',
        details: 'Welcome email template'
      },
      isActive: true,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      runCount: 24
    },
    {
      id: '2',
      name: 'Follow-up Task Creation',
      description: 'Create follow-up task when deal moves to proposal',
      trigger: {
        type: 'Deal Updated',
        condition: 'Stage changed to "Proposal"'
      },
      action: {
        type: 'Create Task',
        details: 'Follow up on proposal in 3 days'
      },
      isActive: true,
      lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000),
      runCount: 12
    },
    {
      id: '3',
      name: 'Stuck Deal Alert',
      description: 'Send alert when deal is inactive for 14 days',
      trigger: {
        type: 'Time Based',
        condition: 'Deal not updated for 14 days'
      },
      action: {
        type: 'Send Notification',
        details: 'Alert assigned user about stuck deal'
      },
      isActive: false,
      runCount: 0
    }
  ]);

  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    onChanges(true);
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    onChanges(true);
  };

  const triggerTypes = [
    { value: 'deal_created', label: 'Deal Created' },
    { value: 'deal_updated', label: 'Deal Updated' },
    { value: 'deal_stage_changed', label: 'Deal Stage Changed' },
    { value: 'task_created', label: 'Task Created' },
    { value: 'task_completed', label: 'Task Completed' },
    { value: 'contact_created', label: 'Contact Created' },
    { value: 'time_based', label: 'Time Based' }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'send_notification', label: 'Send Notification' },
    { value: 'update_deal', label: 'Update Deal' },
    { value: 'assign_user', label: 'Assign User' },
    { value: 'add_tag', label: 'Add Tag' }
  ];

  const RuleCard = ({ rule }: { rule: AutomationRule }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-white">{rule.name}</h4>
            <Badge variant={rule.isActive ? 'success' : 'secondary'} size="sm">
              {rule.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-secondary-400 mb-4">{rule.description}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-secondary-300">{rule.trigger.type}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-secondary-500" />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-secondary-300">{rule.action.type}</span>
            </div>
          </div>

          {rule.lastRun && (
            <div className="mt-3 text-xs text-secondary-500">
              Last run: {rule.lastRun.toLocaleString()} • {rule.runCount} executions
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={() => toggleRule(rule.id)}
            variant={rule.isActive ? 'success' : 'secondary'}
            size="sm"
            className="p-2"
          >
            {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => {
              setEditingRule(rule);
              setShowRuleBuilder(true);
            }}
            variant="secondary"
            size="sm"
            className="p-2"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => deleteRule(rule.id)}
            variant="danger"
            size="sm"
            className="p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-xl font-semibold text-white">Automation Rules</h3>
              <p className="text-secondary-400 text-sm">Automate repetitive tasks and workflows</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingRule(null);
              setShowRuleBuilder(true);
            }}
            variant="primary"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{rules.length}</div>
            <div className="text-sm text-secondary-400">Total Rules</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              {rules.filter(r => r.isActive).length}
            </div>
            <div className="text-sm text-secondary-400">Active Rules</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">
              {rules.reduce((sum, r) => sum + r.runCount, 0)}
            </div>
            <div className="text-sm text-secondary-400">Total Executions</div>
          </div>
        </div>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>

      {/* Rule Builder Modal */}
      {showRuleBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-6">
              {editingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </h3>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter rule name"
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this rule does"
                    rows={3}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              {/* Trigger Configuration */}
              <div className="p-4 bg-secondary-700 rounded-lg">
                <h4 className="font-medium text-white mb-4">When this happens (Trigger)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Trigger Type
                    </label>
                    <select className="w-full px-4 py-3 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600">
                      {triggerTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Condition
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Stage equals 'Proposal'"
                      className="w-full px-4 py-3 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Configuration */}
              <div className="p-4 bg-secondary-700 rounded-lg">
                <h4 className="font-medium text-white mb-4">Do this (Action)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Action Type
                    </label>
                    <select className="w-full px-4 py-3 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600">
                      {actionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Action Details
                    </label>
                    <textarea
                      placeholder="Configure the action details"
                      rows={3}
                      className="w-full px-4 py-3 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* Example Rules */}
              <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h4 className="font-medium text-blue-200 mb-2">Example Rules</h4>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• When deal moves to "Closed Won" → Send thank you email</li>
                  <li>• When task is overdue by 2 days → Send reminder notification</li>
                  <li>• When new contact is created → Add to welcome email sequence</li>
                  <li>• When deal is stuck for 14 days → Create follow-up task</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowRuleBuilder(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRuleBuilder(false);
                  onChanges(true);
                }}
                variant="primary"
                size="sm"
              >
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationRules;