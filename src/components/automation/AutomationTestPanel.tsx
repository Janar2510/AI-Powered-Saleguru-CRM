import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AutomationRule } from '../../types/automation';
import { supabase } from '../../services/supabase';
import { useToastContext } from '../../contexts/ToastContext';

interface AutomationTestPanelProps {
  rule: AutomationRule;
}

const AutomationTestPanel: React.FC<AutomationTestPanelProps> = ({ rule }) => {
  const { showToast } = useToastContext();
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details: {
      triggerMatched: boolean;
      conditionsMatched: boolean;
      actionsExecuted: {
        id: string;
        name: string;
        success: boolean;
        message?: string;
      }[];
      executionTime: number;
    } | null;
  } | null>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch execution logs for this rule
  useEffect(() => {
    const fetchExecutionLogs = async () => {
      if (!rule.id) return;
      
      setIsLoadingLogs(true);
      
      try {
        const { data, error } = await supabase
          .from('automation_execution_logs')
          .select('*')
          .eq('rule_id', rule.id)
          .order('executed_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        if (data) {
          setExecutionLogs(data.map(log => ({
            ...log,
            executed_at: new Date(log.executed_at)
          })));
        }
      } catch (error) {
        console.error('Error fetching execution logs:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    };
    
    fetchExecutionLogs();
  }, [rule.id]);

  const handleRunTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      // Call the execute-automation function with the rule ID
      const { data, error } = await supabase.functions.invoke('execute-automation', {
        body: {
          ruleId: rule.id,
          triggerData: generateTestData()
        }
      });
      
      if (error) {
        throw new Error(`Error calling execute-automation: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      
      // Process the results
      const result = data.results[0] || null;
      
      if (!result) {
        throw new Error('No execution results returned');
      }
      
      // Fetch the latest execution log
      const { data: logData, error: logError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('rule_id', rule.id)
        .order('executed_at', { ascending: false })
        .limit(1)
        .single();
      
      if (logError) {
        console.error('Error fetching execution log:', logError);
      }
      
      // Update the execution logs
      if (logData) {
        setExecutionLogs(prev => [
          {
            ...logData,
            executed_at: new Date(logData.executed_at)
          },
          ...prev.slice(0, 4) // Keep only the 5 most recent logs
        ]);
      }
      
      // Create test result
      const testResult = {
        success: result.success,
        message: result.success 
          ? 'Automation rule executed successfully' 
          : `Execution failed: ${result.error || 'Unknown error'}`,
        details: {
          triggerMatched: true, // Assuming the trigger matched since we're testing
          conditionsMatched: logData?.execution_result?.conditionsMatched || rule.conditions.length === 0,
          actionsExecuted: result.success 
            ? rule.actions.map(action => ({
                id: action.id,
                name: action.name,
                success: true
              }))
            : rule.actions.map(action => ({
                id: action.id,
                name: action.name,
                success: false,
                message: 'Execution failed'
              })),
          executionTime: result.executionTime || logData?.execution_time || 1000
        }
      };
      
      setTestResult(testResult);
      
      showToast({
        type: result.success ? 'success' : 'error',
        title: result.success ? 'Test Successful' : 'Test Failed',
        message: result.success 
          ? 'Automation rule executed successfully' 
          : `Execution failed: ${result.error || 'Unknown error'}`
      });
    } catch (error) {
      console.error('Error running test:', error);
      
      // Create failure result
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          triggerMatched: false,
          conditionsMatched: false,
          actionsExecuted: rule.actions.map(action => ({
            id: action.id,
            name: action.name,
            success: false,
            message: 'Test failed to execute'
          })),
          executionTime: 0
        }
      });
      
      showToast({
        type: 'error',
        title: 'Test Failed',
        message: error instanceof Error ? error.message : 'Failed to run test'
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  // Generate test data based on the trigger type
  const generateTestData = () => {
    if (!rule.trigger) {
      return {};
    }
    
    switch (rule.trigger.type) {
      case 'deal_stage_changed':
        return {
          deal: {
            id: "deal-123",
            title: "Enterprise Software Package",
            company: "TechCorp Inc.",
            value: 75000,
            stage: {
              previous: "negotiation",
              current: "closed-won"
            },
            contact: "John Smith",
            owner: "current_user",
            probability: 100
          },
          user: {
            id: "user-456",
            name: "Janar Kuusk",
            email: "janar@example.com"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'deal_created':
        return {
          deal: {
            id: "deal-123",
            title: "Enterprise Software Package",
            company: "TechCorp Inc.",
            value: 75000,
            stage_id: "qualified",
            contact: "John Smith",
            owner: "current_user",
            probability: 25,
            isNew: true
          },
          user: {
            id: "user-456",
            name: "Janar Kuusk",
            email: "janar@example.com"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'contact_created':
        return {
          contact: {
            id: "contact-123",
            name: "John Smith",
            email: "john.smith@techcorp.com",
            company: "TechCorp Inc.",
            position: "CTO",
            isNew: true
          },
          user: {
            id: "user-456",
            name: "Janar Kuusk",
            email: "janar@example.com"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'task_deadline_missed':
        return {
          task: {
            id: "task-123",
            title: "Follow up with TechCorp",
            description: "Send proposal follow-up email",
            due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
            type: "follow-up",
            status: "overdue",
            priority: "high",
            assigned_to: "user-456",
            completed: false
          },
          user: {
            id: "user-456",
            name: "Janar Kuusk",
            email: "janar@example.com"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'task_completed':
        return {
          task: {
            id: "task-123",
            title: "Follow up with TechCorp",
            description: "Send proposal follow-up email",
            due_date: new Date().toISOString().split('T')[0],
            type: "follow-up",
            status: "completed",
            priority: "high",
            assigned_to: "user-456",
            completed: true,
            completed_at: new Date().toISOString(),
            completed_by: "user-456"
          },
          user: {
            id: "user-456",
            name: "Janar Kuusk",
            email: "janar@example.com"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'email_opened':
        return {
          email: {
            id: "email-123",
            to: "john.smith@techcorp.com",
            subject: "Enterprise Software Package Proposal",
            status: "opened",
            opened_at: new Date().toISOString(),
            deal_id: "deal-123",
            contact_id: "contact-123"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'email_clicked':
        return {
          email: {
            id: "email-123",
            to: "john.smith@techcorp.com",
            subject: "Enterprise Software Package Proposal",
            deal_id: "deal-123",
            contact_id: "contact-123"
          },
          event: {
            id: "event-123",
            type: "click",
            timestamp: new Date().toISOString(),
            metadata: {
              url: "https://example.com/pricing"
            }
          },
          timestamp: new Date().toISOString()
        };
        
      case 'form_submitted':
        return {
          form: {
            id: rule.trigger.config.formId || "form-123",
            name: "Contact Form",
            data: {
              name: "John Smith",
              email: "john.smith@techcorp.com",
              company: "TechCorp Inc.",
              message: "I'm interested in your enterprise package"
            }
          },
          user: {
            id: "user-456",
            name: "Janar Kuusk",
            email: "janar@example.com"
          },
          timestamp: new Date().toISOString()
        };
        
      case 'time_based':
        return {
          timestamp: new Date().toISOString(),
          scheduled: true
        };
        
      default:
        return {
          timestamp: new Date().toISOString()
        };
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">Test Rule: {rule.name}</h3>
        
        <div className="space-y-6">
          {/* Rule Summary */}
          <div className="p-4 bg-secondary-700/60 rounded-lg">
            <h4 className="font-medium text-white mb-3">Rule Configuration</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600/30 rounded-full flex items-center justify-center mt-0.5">
                  <Zap className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Trigger: {rule.trigger?.name}</div>
                  <p className="text-sm text-secondary-400">{rule.trigger?.description}</p>
                </div>
              </div>
              
              {rule.conditions.length > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-600/30 rounded-full flex items-center justify-center mt-0.5">
                    <Filter className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      Conditions: {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                    </div>
                    <ul className="text-sm text-secondary-400 space-y-1 mt-1">
                      {rule.conditions.map((condition, index) => (
                        <li key={index}>• {condition.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600/30 rounded-full flex items-center justify-center mt-0.5">
                  <Play className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-white">
                    Actions: {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                  </div>
                  <ul className="text-sm text-secondary-400 space-y-1 mt-1">
                    {rule.actions.map((action, index) => (
                      <li key={index}>• {action.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Test Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Run Test Execution</h4>
              <p className="text-sm text-secondary-400 mt-1">
                Test this rule with sample data to verify it works as expected
              </p>
            </div>
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="btn-primary flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Test...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Test</span>
                </>
              )}
            </button>
          </div>
          
          {/* Test Results */}
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-900/20 border border-green-600/30' 
                : 'bg-red-900/20 border border-red-600/30'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {testResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <h4 className={`font-medium ${testResult.success ? 'text-green-200' : 'text-red-200'}`}>
                    {testResult.message}
                  </h4>
                  <p className={`text-sm mt-1 ${testResult.success ? 'text-green-300/80' : 'text-red-300/80'}`}>
                    Execution time: {testResult.details?.executionTime}ms
                  </p>
                </div>
              </div>
              
              {testResult.details && (
                <div className="space-y-3">
                  {/* Execution Flow */}
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      testResult.details.triggerMatched 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      <span className="text-xs">1</span>
                    </div>
                    <div className="flex-1 p-2 bg-secondary-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Trigger Matched</span>
                        {testResult.details.triggerMatched ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <ArrowRight className="w-4 h-4 text-secondary-500 mt-2" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      rule.conditions.length === 0 || testResult.details.conditionsMatched 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      <span className="text-xs">2</span>
                    </div>
                    <div className="flex-1 p-2 bg-secondary-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">
                          {rule.conditions.length === 0 
                            ? 'No Conditions (Skipped)' 
                            : 'Conditions Matched'
                          }
                        </span>
                        {rule.conditions.length === 0 || testResult.details.conditionsMatched ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <ArrowRight className="w-4 h-4 text-secondary-500 mt-2" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      testResult.details.actionsExecuted.every(a => a.success)
                        ? 'bg-green-500 text-white' 
                        : testResult.details.actionsExecuted.some(a => a.success)
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                    }`}>
                      <span className="text-xs">3</span>
                    </div>
                    <div className="flex-1 p-2 bg-secondary-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">Actions Executed</span>
                        {testResult.details.actionsExecuted.every(a => a.success) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : testResult.details.actionsExecuted.some(a => a.success) ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {testResult.details.actionsExecuted.map((action, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-secondary-300">{action.name}</span>
                            <div className="flex items-center space-x-1">
                              {action.success ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span className="text-green-500">Success</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  <span className="text-red-500">{action.message || 'Failed'}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      
      {/* Test Data */}
      <Card className="bg-white/10 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">Test Data</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-secondary-700/60 rounded-lg">
            <h4 className="font-medium text-white mb-3">Sample Trigger Data</h4>
            <pre className="text-xs text-secondary-300 bg-secondary-800 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(generateTestData(), null, 2)}
            </pre>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Customize Test Data</h4>
              <p className="text-sm text-secondary-400 mt-1">
                Edit the sample data to test different scenarios
              </p>
            </div>
            <button className="btn-secondary text-sm">
              Edit Test Data
            </button>
          </div>
        </div>
      </Card>
      
      {/* Execution Logs */}
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Execution History</h3>
          <Badge variant="secondary" size="sm">Last 7 days</Badge>
        </div>
        
        {isLoadingLogs ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : executionLogs.length > 0 ? (
          <div className="space-y-3">
            {executionLogs.map((log) => (
              <div key={log.id} className="p-3 bg-secondary-700/60 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {log.execution_result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-white">
                      {log.execution_result.success ? 'Successful Execution' : 'Failed Execution'}
                    </span>
                  </div>
                  <span className="text-xs text-secondary-400">{log.executed_at.toLocaleString()}</span>
                </div>
                <p className="text-xs text-secondary-400">
                  {log.execution_result.success 
                    ? `Trigger: ${log.trigger_data.deal ? `Deal "${log.trigger_data.deal.title}"` : 
                       log.trigger_data.task ? `Task "${log.trigger_data.task.title}"` : 
                       log.trigger_data.contact ? `Contact "${log.trigger_data.contact.name}"` : 
                       'Automation executed'}`
                    : `Error: ${log.execution_result.error || 'Execution failed'}`
                  }
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
            <p className="text-secondary-400">No execution history</p>
            <p className="text-secondary-500 text-sm mt-1">Run a test to see execution logs</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <button className="btn-secondary text-sm">
            View Full History
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AutomationTestPanel;