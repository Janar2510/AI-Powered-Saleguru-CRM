import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Task {
  id: string;
  title: string;
  due_date: string;
  due_time?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
}

interface TaskSummaryWidgetProps {
  tasks?: Task[];
  totalTasks?: number;
  completedTasks?: number;
  overdueTasks?: number;
}

const TaskSummaryWidget: React.FC<TaskSummaryWidgetProps> = ({ 
  tasks: propTasks, 
  totalTasks: propTotalTasks, 
  completedTasks: propCompletedTasks, 
  overdueTasks: propOverdueTasks 
}) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(propTasks || []);
  const [totalTasks, setTotalTasks] = useState(propTotalTasks || 0);
  const [completedTasks, setCompletedTasks] = useState(propCompletedTasks || 0);
  const [overdueTasks, setOverdueTasks] = useState(propOverdueTasks || 0);
  const [isLoading, setIsLoading] = useState(!propTasks);
  
  // Fetch tasks if not provided as props
  useEffect(() => {
    if (propTasks) return;
    
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        // Fetch today's tasks
        const { data: todayTasks, error: todayError } = await supabase
          .from('tasks')
          .select('*')
          .eq('due_date', todayStr)
          .order('priority', { ascending: false })
          .limit(4);
        
        if (todayError) throw todayError;
        
        // Fetch task counts
        const { count: totalCount, error: totalError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        
        const { count: completedCount, error: completedError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');
        
        if (completedError) throw completedError;
        
        const { count: overdueCount, error: overdueError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'overdue');
        
        if (overdueError) throw overdueError;
        
        // Update state
        setTasks(todayTasks || []);
        setTotalTasks(totalCount || 0);
        setCompletedTasks(completedCount || 0);
        setOverdueTasks(overdueCount || 0);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        
        // Fallback to sample data
        setTasks([
          {
            id: '1',
            title: 'Follow up with TechCorp',
            due_date: new Date().toISOString().split('T')[0],
            priority: 'high',
            status: 'pending'
          },
          {
            id: '2',
            title: 'Prepare proposal for StartupXYZ',
            due_date: new Date().toISOString().split('T')[0],
            priority: 'medium',
            status: 'pending'
          }
        ]);
        setTotalTasks(8);
        setCompletedTasks(3);
        setOverdueTasks(2);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [propTasks, propTotalTasks, propCompletedTasks, propOverdueTasks]);
  
  const formatDueDate = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return taskDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <Card className="bg-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">Task Summary</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={overdueTasks > 0 ? 'danger' : 'success'} size="sm">
            {overdueTasks > 0 ? `${overdueTasks} Overdue` : 'On Track'}
          </Badge>
          <button 
            onClick={() => navigate('/tasks')}
            className="text-primary-400 hover:text-primary-300"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-secondary-700/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{totalTasks}</div>
              <div className="text-xs text-secondary-400">Total Tasks</div>
            </div>
            <div className="bg-secondary-700/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-500">{completedTasks}</div>
              <div className="text-xs text-secondary-400">Completed</div>
            </div>
            <div className="bg-secondary-700/60 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-500">{overdueTasks}</div>
              <div className="text-xs text-secondary-400">Overdue</div>
            </div>
          </div>
          
          <h4 className="font-medium text-white text-sm mb-2">Upcoming Tasks</h4>
          <div className="space-y-2">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-secondary-700/60 backdrop-blur-sm rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer"
                  onClick={() => navigate('/tasks')}
                >
                  <div className="flex items-center space-x-2">
                    {task.status === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-secondary-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">{task.title}</div>
                      <div className="text-xs text-secondary-400">
                        {formatDueDate(task.due_date)} {task.due_time ? `at ${task.due_time.substring(0, 5)}` : ''}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      task.priority === 'high' || task.priority === 'urgent' 
                        ? 'danger' 
                        : task.priority === 'medium' 
                          ? 'warning' 
                          : 'success'
                    } 
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CheckSquare className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
                <p className="text-secondary-400 text-sm">No upcoming tasks</p>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default TaskSummaryWidget;