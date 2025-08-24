import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckSquare, Clock, AlertTriangle, Edit, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedNumber from '../analytics/AnimatedNumber';
import CreateTaskModal from '../tasks/CreateTaskModal';

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
  loading?: boolean;
}

const TaskSummaryWidget: React.FC<TaskSummaryWidgetProps> = ({ 
  tasks: propTasks, 
  totalTasks: propTotalTasks, 
  completedTasks: propCompletedTasks, 
  overdueTasks: propOverdueTasks,
  loading
}) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    // If props are provided, use them
    if (propTasks !== undefined && propTotalTasks !== undefined && 
        propCompletedTasks !== undefined && propOverdueTasks !== undefined) {
      setTasks(propTasks);
      setTotalTasks(propTotalTasks);
      setCompletedTasks(propCompletedTasks);
      setOverdueTasks(propOverdueTasks);
      return;
    }

    // Otherwise, fetch from API
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tasks/summary');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.todayTasks || []);
          setTotalTasks(data.totalCount || 0);
          setCompletedTasks(data.completedCount || 0);
          setOverdueTasks(data.overdueCount || 0);
        } else {
          throw new Error('Failed to fetch tasks');
        }
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

  const getPriorityDisplay = (priority?: string) => {
    if (!priority) return 'Low';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  // Progress calculation
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Refresh tasks after adding
  const handleTaskCreated = () => {
    setTaskModalOpen(false);
    // Optionally, refetch tasks here if needed
    window.location.reload(); // Quick fix for now, can be improved
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#23233a]/50 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#23233a]/50 rounded"></div>
            ))}
          </div>
          <div className="h-2 bg-[#23233a]/50 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-[#23233a]/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-[#a259ff]" />
            <h3 className="text-lg font-semibold text-white">Task Summary</h3>
          </div>
          <Button
            onClick={() => navigate('/tasks')}
            variant="secondary"
            size="sm"
            icon={ArrowRight}
            className="ml-2"
          >
            See All Tasks
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stat Boxes with Animated Numbers and Gradients */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-[#377dff]/30 to-[#377dff]/50 rounded-lg p-3 text-center shadow-md">
                <div className="text-2xl font-bold text-[#377dff]">
                  <AnimatedNumber value={totalTasks} duration={800} />
                </div>
                <div className="text-xs text-[#b0b0d0]">Total Tasks</div>
              </div>
              <div className="bg-gradient-to-br from-[#43e7ad]/30 to-[#43e7ad]/50 rounded-lg p-3 text-center shadow-md">
                <div className="text-2xl font-bold text-[#43e7ad]">
                  <AnimatedNumber value={completedTasks} duration={800} />
                </div>
                <div className="text-xs text-[#b0b0d0]">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-[#ef4444]/30 to-[#ef4444]/50 rounded-lg p-3 text-center shadow-md">
                <div className="text-2xl font-bold text-[#ef4444]">
                  <AnimatedNumber value={overdueTasks} duration={800} />
                </div>
                <div className="text-xs text-[#b0b0d0]">Overdue</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#b0b0d0]">Progress</span>
                <span className="text-xs text-[#b0b0d0]">{completionRate}% Complete</span>
              </div>
              <div className="w-full h-2 bg-[#23233a]/50 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-[#43e7ad] to-[#a259ff] transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            {/* Upcoming Tasks */}
            <h4 className="font-medium text-white text-sm mb-2">Upcoming Tasks</h4>
            <div className="space-y-2">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-[#23233a]/30 rounded-lg hover:bg-[#23233a]/50 transition-colors cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => {/* TODO: Mark as complete logic */}}
                        className="accent-[#43e7ad] w-4 h-4 rounded focus:ring-2 focus:ring-[#a259ff]"
                      />
                      {task.status === 'overdue' ? (
                        <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#b0b0d0]" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-[#43e7ad]' : 'text-white'}`}>{task.title}</div>
                        <div className="text-xs text-[#b0b0d0]">
                          {formatDueDate(task.due_date)} {task.due_time ? `at ${task.due_time.substring(0, 5)}` : ''}
                        </div>
                      </div>
                      <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${task.priority === 'high' ? 'bg-[#ef4444]/30 text-[#ef4444]' : task.priority === 'medium' ? 'bg-[#f59e0b]/30 text-[#f59e0b]' : 'bg-[#377dff]/30 text-[#377dff]'}`}>{getPriorityDisplay(task.priority)}</span>
                    </div>
                    <Button
                      onClick={() => {/* TODO: Open edit modal for this task */}}
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      className="p-1"
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#a259ff" fillOpacity="0.12"/><path d="M16 24h16M24 16v16" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/></svg>
                  <div className="text-[#b0b0d0] mt-2">No upcoming tasks!</div>
                  <div className="text-xs text-[#b0b0d0] mt-1">Use the quick action button to create tasks</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        currentUserId={null}
      />
    </>
  );
};

export default TaskSummaryWidget;