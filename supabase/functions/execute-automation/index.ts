import { serve } from "npm:@supabase/functions-js";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get request body
    const { ruleId, triggerType, triggerData } = await req.json();
    
    // Either ruleId or triggerType must be provided
    if (!ruleId && !triggerType) {
      return new Response(
        JSON.stringify({ error: "Either ruleId or triggerType is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration is missing" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If ruleId is provided, execute that specific rule
    if (ruleId) {
      const { data: rule, error: ruleError } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("id", ruleId)
        .single();
      
      if (ruleError) {
        console.error("Error fetching automation rule:", ruleError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to fetch automation rule",
            details: ruleError.message
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        );
      }

      if (!rule) {
        return new Response(
          JSON.stringify({ error: "Automation rule not found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404
          }
        );
      }

      // Execute the rule
      const testData = triggerData || generateTestData(rule.trigger_type);
      const startTime = Date.now();
      
      try {
        // Check conditions if any
        let conditionsMatched = true;
        
        if (rule.condition_config && rule.condition_config.length > 0) {
          conditionsMatched = evaluateConditions(rule.condition_config, testData);
        }
        
        if (!conditionsMatched) {
          // Log execution with conditions not met
          const { error: logError } = await supabase
            .from("automation_execution_logs")
            .insert({
              rule_id: rule.id,
              trigger_data: testData,
              execution_result: {
                success: false,
                message: "Conditions not met",
                conditionsMatched: false
              },
              execution_time: Date.now() - startTime
            });
          
          if (logError) {
            console.error("Error logging execution:", logError);
          }
          
          // Increment execution count
          const { error: updateError } = await supabase
            .from("automation_rules")
            .update({
              execution_count: rule.execution_count + 1,
              last_executed: new Date().toISOString()
            })
            .eq("id", rule.id);
          
          if (updateError) {
            console.error("Error updating execution count:", updateError);
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Conditions not met",
              results: [{
                ruleId: rule.id,
                ruleName: rule.name,
                success: false,
                message: "Conditions not met",
                executionTime: Date.now() - startTime
              }]
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200
            }
          );
        }
        
        // Execute actions
        const actionResults = await executeActions(rule.action_config, testData, supabase);
        
        // Log execution
        const { error: logError } = await supabase
          .from("automation_execution_logs")
          .insert({
            rule_id: rule.id,
            trigger_data: testData,
            execution_result: {
              success: true,
              actions: actionResults,
              conditionsMatched: true
            },
            execution_time: Date.now() - startTime
          });
        
        if (logError) {
          console.error("Error logging execution:", logError);
        }
        
        // Increment execution count
        const { error: updateError } = await supabase
          .from("automation_rules")
          .update({
            execution_count: rule.execution_count + 1,
            last_executed: new Date().toISOString()
          })
          .eq("id", rule.id);
        
        if (updateError) {
          console.error("Error updating execution count:", updateError);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Rule executed successfully",
            results: [{
              ruleId: rule.id,
              ruleName: rule.name,
              success: true,
              actions: actionResults,
              executionTime: Date.now() - startTime
            }]
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      } catch (error) {
        console.error(`Error executing rule ${rule.id}:`, error);
        
        // Log execution error
        const { error: logError } = await supabase
          .from("automation_execution_logs")
          .insert({
            rule_id: rule.id,
            trigger_data: testData,
            execution_result: {
              success: false,
              error: error.message || "Unknown error",
              conditionsMatched: true
            },
            execution_time: Date.now() - startTime
          });
        
        if (logError) {
          console.error("Error logging execution:", logError);
        }
        
        // Increment execution count
        const { error: updateError } = await supabase
          .from("automation_rules")
          .update({
            execution_count: rule.execution_count + 1,
            last_executed: new Date().toISOString()
          })
          .eq("id", rule.id);
        
        if (updateError) {
          console.error("Error updating execution count:", updateError);
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || "Unknown error",
            results: [{
              ruleId: rule.id,
              ruleName: rule.name,
              success: false,
              error: error.message || "Unknown error",
              executionTime: Date.now() - startTime
            }]
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        );
      }
    }
    
    // If triggerType is provided, find and execute matching rules
    if (triggerType) {
      // Find matching automation rules
      const { data: rules, error: rulesError } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("trigger_type", triggerType)
        .eq("is_active", true);
      
      if (rulesError) {
        console.error("Error fetching automation rules:", rulesError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to fetch automation rules",
            details: rulesError.message
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        );
      }

      if (!rules || rules.length === 0) {
        return new Response(
          JSON.stringify({ message: "No matching automation rules found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      }

      // Process each matching rule
      const results = [];
      
      for (const rule of rules) {
        try {
          console.log(`Processing rule: ${rule.name} (${rule.id})`);
          
          // Check conditions if any
          let conditionsMatched = true;
          
          if (rule.condition_config && rule.condition_config.length > 0) {
            // Implement condition checking logic here
            // This is a simplified example
            conditionsMatched = evaluateConditions(rule.condition_config, triggerData);
          }
          
          if (!conditionsMatched) {
            console.log(`Conditions not met for rule: ${rule.name}`);
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              success: false,
              message: "Conditions not met"
            });
            continue;
          }
          
          // Execute actions
          const startTime = Date.now();
          const actionResults = await executeActions(rule.action_config, triggerData, supabase);
          const executionTime = Date.now() - startTime;
          
          // Log execution
          const { error: logError } = await supabase
            .from("automation_execution_logs")
            .insert({
              rule_id: rule.id,
              trigger_data: triggerData,
              execution_result: {
                success: true,
                actions: actionResults,
                conditionsMatched: true
              },
              execution_time: executionTime
            });
          
          if (logError) {
            console.error("Error logging execution:", logError);
          }
          
          // Increment execution count
          const { error: updateError } = await supabase
            .from("automation_rules")
            .update({
              execution_count: rule.execution_count + 1,
              last_executed: new Date().toISOString()
            })
            .eq("id", rule.id);
          
          if (updateError) {
            console.error("Error incrementing execution count:", updateError);
          }
          
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: true,
            actions: actionResults,
            executionTime
          });
        } catch (error) {
          console.error(`Error processing rule ${rule.id}:`, error);
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            error: error.message
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          triggerType,
          rulesProcessed: results.length,
          results
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error("Error processing automation:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process automation", 
        details: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

// Helper function to evaluate conditions
function evaluateConditions(conditions: any[], triggerData: any): boolean {
  // Simple implementation - in a real app this would be more sophisticated
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  // For now, just return true
  // In a real implementation, you would evaluate each condition
  return true;
}

// Helper function to execute actions
async function executeActions(actions: any[], triggerData: any, supabase: any): Promise<any[]> {
  if (!actions || !Array.isArray(actions)) {
    return [];
  }
  
  const results = [];
  
  for (const action of actions) {
    try {
      const result = await executeAction(action, triggerData, supabase);
      results.push({
        actionId: action.id,
        actionType: action.type,
        success: true,
        result
      });
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
      results.push({
        actionId: action.id,
        actionType: action.type,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Helper function to execute a single action
async function executeAction(action: any, triggerData: any, supabase: any): Promise<any> {
  // This is a simplified implementation
  // In a real app, you would implement each action type
  
  switch (action.type) {
    case "send_notification":
      // Implement notification sending
      console.log(`Would send notification: ${action.config?.message}`);
      return { message: "Notification would be sent" };
      
    case "create_task":
      // Create a task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: replaceVariables(action.config?.title, triggerData),
          description: replaceVariables(action.config?.description, triggerData),
          due_date: calculateDueDate(action.config?.dueDate),
          type: "task",
          status: "pending",
          priority: action.config?.priority || "medium",
          assigned_to: action.config?.assignTo === "current_user" ? triggerData.user?.id : action.config?.assignTo,
          tags: ["Automation"]
        })
        .select();
      
      if (taskError) {
        throw new Error(`Failed to create task: ${taskError.message}`);
      }
      
      return { taskId: task?.[0]?.id };
      
    case "send_email":
      // In a real implementation, this would call the send-email function
      console.log(`Would send email to: ${action.config?.to}`);
      return { message: "Email would be sent" };
      
    case "update_record":
      // Implement record update
      console.log(`Would update record of type: ${action.config?.recordType}`);
      return { message: "Record would be updated" };
      
    default:
      return { message: `Action type ${action.type} not implemented` };
  }
}

// Helper function to replace variables in strings
function replaceVariables(template: string, data: any): string {
  if (!template) return "";
  
  // Simple implementation - in a real app this would be more sophisticated
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const parts = path.trim().split('.');
    let value = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return match; // Keep original if path not found
      }
    }
    
    return value !== undefined ? String(value) : match;
  });
}

// Helper function to calculate due date
function calculateDueDate(dueDate: string): string {
  if (!dueDate) return new Date().toISOString().split('T')[0];
  
  const today = new Date();
  
  if (dueDate === "today") {
    return today.toISOString().split('T')[0];
  }
  
  if (dueDate === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (dueDate.startsWith("in_")) {
    const days = parseInt(dueDate.replace("in_", "").replace("_day", "").replace("_days", ""));
    if (!isNaN(days)) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);
      return futureDate.toISOString().split('T')[0];
    }
  }
  
  // If it's already a date string, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return dueDate;
  }
  
  // Default to today
  return today.toISOString().split('T')[0];
}

// Helper function to generate test data based on trigger type
function generateTestData(triggerType: string): any {
  switch (triggerType) {
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
          id: "form-123",
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
}