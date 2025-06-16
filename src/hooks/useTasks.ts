import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Task, TaskFormData, TaskFilter } from '../types/task';
import { useToastContext } from '../contexts/ToastContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export const useTasks = (initialFilter?: TaskFilter) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>(initialFilter || {});
  const { showToast } = useToastContext();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          deals!tasks_deal_id_fkey (
            title
          ),
          contacts!tasks_contact_id_fkey (
            name
          )
        `)
        .order('due_date', { ascending: true });
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.type) {
        query = query.eq('type', filter.type);
      }
      
      if (filter.priority) {
        query = query.eq('priority', filter.priority);
      }
      
      if (filter.assigned_to) {
        query = query.eq('assigned_to', filter.assigned_to);
      }
      
      if (filter.deal_id) {
        query = query.eq('deal_id', filter.deal_id);
      }
      
      if (filter.contact_id) {
        query = query.eq('contact_id', filter.contact_id);
      }
      
      // Apply timeframe filter
      if (filter.timeframe) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() - today.getDay() + 7); // Next Sunday
        
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // Next Saturday
        
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay()); // This Sunday
        
        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // This Saturday
        
        switch (filter.timeframe) {
          case 'today':
            query = query.eq('due_date', today.toISOString().split('T')[0]);
            break;
          case 'tomorrow':
            query = query.eq('due_date', tomorrow.toISOString().split('T')[0]);
            break;
          case 'this-week':
            query = query
              .gte('due_date', thisWeekStart.toISOString().split('T')[0])
              .lte('due_date', thisWeekEnd.toISOString().split('T')[0]);
            break;
          case 'next-week':
            query = query
              .gte('due_date', nextWeekStart.toISOString().split('T')[0])
              .lte('due_date', nextWeekEnd.toISOString().split('T')[0]);
            break;
          case 'overdue':
            query = query
              .lt('due_date', today.toISOString().split('T')[0])
              .eq('status', 'overdue');
            break;
        }
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Process and format the data
        const formattedTasks = data.map(task => ({
          ...task,
          deal_title: task.deals?.title,
          contact_name: task.contacts?.name
        }));
        
        // Check for overdue tasks and update their status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const updatedTasks = formattedTasks.map(task => {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          
          if (dueDate < today && task.status !== 'completed' && task.status !== 'cancelled' && task.status !== 'overdue') {
            return { ...task, status: 'overdue' as const };
          }
          
          return task;
        });
        
        setTasks(updatedTasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load tasks'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: TaskFormData): Promise<Task | null> => {
    try {
      // Format the data for Supabase
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        due_time: taskData.due_time || null,
        type: taskData.type,
        status: 'pending',
        priority: taskData.priority,
        assigned_to: taskData.assigned_to || null,
        contact_id: taskData.contact_id || null,
        deal_id: taskData.deal_id || null,
        tags: taskData.tags,
        created_by: null // In a real app, this would be the current user's ID
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Add the task to the local state
        setTasks(prev => [data, ...prev]);
        
        showToast({
          type: 'success',
          title: 'Task Created',
          message: 'Task has been created successfully'
        });
        
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating task:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create task'
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update the task in the local state
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...data } : task
        ));
        
        showToast({
          type: 'success',
          title: 'Task Updated',
          message: 'Task has been updated successfully'
        });
        
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating task:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update task'
      });
      return null;
    }
  };

  const completeTask = async (taskId: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update the task in the local state
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...data } : task
        ));
        
        showToast({
          type: 'success',
          title: 'Task Completed',
          message: 'Task has been marked as complete'
        });
        
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error completing task:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete task'
      });
      return null;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Remove the task from the local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      showToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task has been deleted successfully'
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete task'
      });
      return false;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    filter,
    setFilter,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask
  };
};