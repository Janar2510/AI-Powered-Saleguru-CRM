import { DivideIcon as LucideIcon } from 'lucide-react';

// Base component interface
export interface AutomationComponent {
  id: string;
  name: string;
  description: string;
  category: 'trigger' | 'condition' | 'action';
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  config?: Record<string, any>;
}

// Specific component types
export interface AutomationTrigger extends AutomationComponent {
  category: 'trigger';
  type: string;
}

export interface AutomationCondition extends AutomationComponent {
  category: 'condition';
  type: string;
}

export interface AutomationAction extends AutomationComponent {
  category: 'action';
  type: string;
}

// Automation rule interface
export interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  execution_count?: number;
  last_executed?: Date;
  trigger_type?: string;
  trigger_config?: string;
  condition_type?: string;
  condition_config?: string;
  action_type?: string;
  action_config?: string;
}

// Template interface
export interface AutomationRuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  popularity: 'high' | 'medium' | 'low';
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

// Execution log interface
export interface AutomationExecutionLog {
  id: string;
  rule_id: string;
  rule_name: string;
  trigger_data: any;
  execution_result: {
    success: boolean;
    message?: string;
    details?: any;
  };
  execution_time: number; // in milliseconds
  executed_at: Date;
}