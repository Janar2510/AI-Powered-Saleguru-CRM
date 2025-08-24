import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import TaskList from '../components/tasks/TaskList';
import KanbanDealBoard from '../components/deals/KanbanDealBoard';
import { useGuru } from '../contexts/GuruContext';
import GuruPanel from '../components/ai/GuruPanel';
// import GuruPanel from '../components/ai/GuruPanel'; // Placeholder for AI
import { supabase } from '../services/supabase';
import { FrappeGantt, Task as GanttTask, ViewMode } from 'frappe-gantt-react';
import { KanbanBoard, KanbanColumn } from '../components/kanban/KanbanBoard';
import Container from '../components/layout/Container';
import Spline from '@splinetool/react-spline';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  completion_percent?: number;
}

const ProjectDetailView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'board' | 'gantt'>('list');
  const guru = useGuru();
  const [showGuru, setShowGuru] = useState(false);

  useEffect(() => {
    // Fetch project details
    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      setProject(data);
    };
    // Fetch tasks for this project
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
      if (data && data.length > 0) {
        setTasks(data);
      } else {
        // Add dummy tasks if none exist
        setTasks([
          {
            id: '1',
            title: 'Design UI Mockups',
            description: 'Create Figma mockups for the new dashboard',
            status: 'in-progress',
            type: 'design',
            priority: 'high',
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_date: new Date().toISOString().split('T')[0],
            completion_percent: 40,
            tags: ['UI', 'Figma'],
            assignee_name: 'Janar Kuusk',
          },
          {
            id: '2',
            title: 'Backend API Setup',
            description: 'Set up Supabase tables and endpoints',
            status: 'pending',
            type: 'development',
            priority: 'medium',
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_date: new Date().toISOString().split('T')[0],
            completion_percent: 0,
            tags: ['API', 'Supabase'],
            assignee_name: 'Jane Doe',
          },
          {
            id: '3',
            title: 'Testing & QA',
            description: 'Write tests and perform QA',
            status: 'pending',
            type: 'testing',
            priority: 'low',
            due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completion_percent: 0,
            tags: ['QA'],
            assignee_name: 'QA Team',
          },
        ]);
      }
    };
    if (projectId) {
      fetchProject();
      fetchTasks();
    }
  }, [projectId]);

  // Handlers for task actions
  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', completion_percent: 100 } : t));
  };
  const handleEditTask = (task: any) => {
    // For demo, just toggle priority
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: t.priority === 'high' ? 'medium' : 'high' } : t));
  };
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  if (!project) return <div>Loading project...</div>;

  // Map tasks to Gantt format
  const ganttTasks = tasks.map(task => new GanttTask({
    id: task.id,
    name: task.title || 'Untitled',
    start: task.start_date || task.due_date || new Date().toISOString().split('T')[0],
    end: task.due_date || task.start_date || new Date().toISOString().split('T')[0],
    progress: task.completion_percent || 0,
    dependencies: '',
  }));

  return (
    <Container>
      {/* 3D Spline Background */}
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-[#b0b0d0] mt-1">{project.description}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setShowGuru(true)}>
              <span role="img" aria-label="AI">🤖</span> Guru AI Insights
            </Button>
          </div>
        </div>
        {/* Project Info Card */}
        <Card variant="glass" className="p-6 flex flex-col gap-4">
          <div className="flex items-center space-x-4">
            <Badge variant={project.status === 'Active' ? 'success' : project.status === 'Completed' ? 'primary' : 'warning'} size="md">
              {project.status}
            </Badge>
            <div className="text-[#b0b0d0]">Due: <span className="text-white font-medium">{project.due_date || 'N/A'}</span></div>
            <div className="flex items-center space-x-2">
              <span className="text-[#b0b0d0] text-xs">Progress</span>
              <div className="flex-1 h-2 bg-[#23233a]/50 rounded-full overflow-hidden min-w-[120px]">
                <div
                  className="h-2 bg-[#a259ff] rounded-full transition-all"
                  style={{ width: `${project.completion_percent || 0}%` }}
                />
              </div>
              <span className="text-[#a259ff] text-xs font-semibold">{Math.round(project.completion_percent || 0)}%</span>
            </div>
          </div>
        </Card>
        {/* View Toggle */}
        <div className="flex items-center space-x-3 bg-[#23233a]/50 rounded-lg p-1 w-fit">
          <Button onClick={() => setView('list')} variant={view === 'list' ? 'gradient' : 'secondary'} size="sm">List View</Button>
          <Button onClick={() => setView('board')} variant={view === 'board' ? 'gradient' : 'secondary'} size="sm">Board View</Button>
          <Button onClick={() => setView('gantt')} variant={view === 'gantt' ? 'gradient' : 'secondary'} size="sm">Gantt View</Button>
        </div>
        {/* Main Content */}
        <div className="space-y-6">
          {view === 'list' ? (
            <Card variant="glass" className="p-6">
              <TaskList
                tasks={tasks}
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </Card>
          ) : view === 'board' ? (
            <Card variant="glass" className="p-6">
              <KanbanBoard
                columns={['pending', 'in-progress', 'completed', 'cancelled', 'overdue'].map(status => ({
                  id: status,
                  title: status.replace(/\b\w/g, c => c.toUpperCase()),
                  items: tasks.filter(t => t.status === status),
                }))}
                renderItem={(task, isDragging) => (
                  <div
                    className={`rounded-xl p-4 mb-3 shadow-lg border border-[#23233a]/50 bg-[#23233a]/80 transition-all duration-200 ${
                      isDragging ? 'ring-2 ring-[#a259ff] scale-105' : 'hover:border-[#a259ff]/60 hover:scale-[1.02]'
                    }`}
                    tabIndex={0}
                    aria-label={task.title}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-base">{task.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        task.priority === 'high' ? 'border-red-500 text-red-400' :
                        task.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                        task.priority === 'low' ? 'border-green-500 text-green-400' :
                        'border-[#b0b0d0] text-[#b0b0d0]'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="text-[#b0b0d0] text-xs mb-1">Due: {task.due_date}</div>
                    <div className="text-[#b0b0d0] text-xs">{task.description}</div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-[#b0b0d0]">Assignee:</span>
                      <span className="text-xs text-white font-medium">{task.assignee_name || 'Unassigned'}</span>
                    </div>
                  </div>
                )}
                getItemId={task => task.id}
                getColumnIdOfItem={itemId => tasks.find(t => t.id === itemId)?.status || 'pending'}
                onDragEnd={(itemId, sourceCol, destCol, destIdx) => {
                  setTasks(prev => prev.map(t => t.id === itemId ? { ...t, status: destCol } : t));
                }}
              />
            </Card>
          ) : (
            <Card variant="glass" className="p-6">
              <div className="gantt-view">
                <FrappeGantt
                  tasks={ganttTasks}
                  viewMode={ViewMode.Day}
                />
              </div>
            </Card>
          )}
        </div>
        {/* Guru Panel Modal */}
        {showGuru && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-[#23233a]/90 backdrop-blur-sm border border-[#23233a]/50 p-6 w-full max-w-2xl">
              <GuruPanel />
              <div className="flex justify-end mt-4">
                <Button variant="secondary" onClick={() => setShowGuru(false)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ProjectDetailView; 