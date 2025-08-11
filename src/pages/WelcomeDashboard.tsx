import React, { useState } from 'react';
import { Plus, Users, Calendar, Target, Bot, Settings, Check, ChevronRight, FileText, Download, Upload, Zap, Sparkles, User, Video, Mail, Phone } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const WelcomeDashboard: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const setupTasks = [
    { id: 'profile', title: 'Complete your profile', description: 'Add your photo and contact details', icon: User },
    { id: 'import', title: 'Import your contacts', description: 'Bring your existing contacts into SaleToru', icon: Users },
    { id: 'deal', title: 'Create your first deal', description: 'Start tracking a sales opportunity', icon: Target },
    { id: 'calendar', title: 'Connect your calendar', description: 'Sync with Google or Outlook calendar', icon: Calendar },
    { id: 'email', title: 'Set up email integration', description: 'Connect your email account', icon: Mail }
  ];
  
  const quickActions = [
    { 
      id: 'create-deal', 
      title: 'Create Deal', 
      icon: Target, 
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => {
        showToast({
          type: 'info',
          title: 'Create Deal',
          message: 'Opening deal creation form...'
        });
        navigate('/deals');
      }
    },
    { 
      id: 'import-contacts', 
      title: 'Import Contacts', 
      icon: Upload, 
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        showToast({
          type: 'info',
          title: 'Import Contacts',
          message: 'Opening contact import wizard...'
        });
        navigate('/contacts');
      }
    },
    { 
      id: 'customize', 
      title: 'Customize CRM', 
      icon: Settings, 
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        showToast({
          type: 'info',
          title: 'Customize CRM',
          message: 'Opening settings page...'
        });
        navigate('/settings');
      }
    }
  ];
  
  const guruTips = [
    "Try asking SaleToruGuru to 'summarize my pipeline' for a quick overview",
    "Use the AI assistant to draft follow-up emails based on your conversation history",
    "Ask SaleToruGuru to 'prioritize my tasks' to focus on what matters most",
    "The AI can help you score leads based on engagement and buying signals",
    "Try 'Show me stuck deals' to identify opportunities that need attention"
  ];
  
  const [currentTip] = useState(Math.floor(Math.random() * guruTips.length));
  
  const handleCompleteTask = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      
      showToast({
        type: 'success',
        title: 'Task Completed',
        message: 'Setup task marked as complete'
      });
      
      // If all tasks are completed
      if (completedTasks.length === setupTasks.length - 1) {
        showToast({
          type: 'success',
          title: 'All Tasks Completed',
          message: 'Great job! Your CRM is fully set up.'
        });
      }
    }
  };
  
  const getCompletionPercentage = () => {
    return Math.round((completedTasks.length / setupTasks.length) * 100);
  };

  return (
    <div className="w-full px-5 py-5 space-y-5 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome to SaleToru CRM!</h1>
          <p className="text-secondary-400 mt-1">Let's get you started with your new AI-powered sales platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success" size="md">Pro Plan</Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`${action.color} p-4 rounded-xl text-white transition-all hover:scale-105 duration-200 shadow-lg`}
          >
            <div className="flex items-center justify-center space-x-3">
              <action.icon className="w-5 h-5" />
              <span className="font-medium">{action.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Setup Progress */}
        <Card className="lg:col-span-2" variant="glass">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary-500" />
              <span>Getting Started</span>
            </h2>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-secondary-400">
                {getCompletionPercentage()}% Complete
              </div>
              <div className="w-16 h-2 bg-secondary-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {setupTasks.map((task) => (
              <div 
                key={task.id}
                className={`p-4 rounded-lg border transition-all ${
                  completedTasks.includes(task.id)
                    ? 'bg-green-900/20 border-green-600/30'
                    : 'bg-secondary-700/60 backdrop-blur-md border-secondary-600/50 hover:border-primary-600/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      completedTasks.includes(task.id) ? 'bg-green-600' : 'bg-secondary-600'
                    }`}>
                      {completedTasks.includes(task.id) ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <task.icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <p className="text-sm text-secondary-400 mt-1">{task.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className={`btn-secondary text-sm ${
                      completedTasks.includes(task.id) ? 'opacity-0 pointer-events-none' : ''
                    }`}
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Guru Tip */}
          <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Guru Tip of the Day</h3>
                <p className="text-secondary-300 text-sm mt-2">
                  {guruTips[currentTip]}
                </p>
                <button 
                  onClick={openGuru}
                  className="btn-primary text-sm mt-4 flex items-center space-x-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Try SaleToruGuru</span>
                </button>
              </div>
            </div>
          </Card>
          
          {/* Resources */}
          <Card variant="glass">
            <h3 className="font-medium text-white mb-4">Helpful Resources</h3>
            <div className="space-y-3">
              <a 
                href="#" 
                className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg hover:bg-secondary-600/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary-500" />
                  <span className="text-white">Getting Started Guide</span>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-400" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg hover:bg-secondary-600/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-primary-500" />
                  <span className="text-white">Video Tutorials</span>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-400" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg hover:bg-secondary-600/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-primary-500" />
                  <span className="text-white">Sample Data</span>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-400" />
              </a>
            </div>
          </Card>
          
          {/* Smart Reminders */}
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Smart Reminders</h3>
              <Badge variant="primary" size="sm">New</Badge>
            </div>
            <div className="p-4 bg-secondary-700/60 backdrop-blur-md rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="text-white font-medium">Complete Your Profile</span>
                </div>
                <Badge variant="warning" size="sm">Today</Badge>
              </div>
              <p className="text-sm text-secondary-400">
                Add your photo and contact details to personalize your account
              </p>
              <button className="btn-secondary text-xs mt-3 w-full">
                Update Profile
              </button>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Bottom Banner */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border border-blue-600/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-blue-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Need Help Getting Started?</h3>
              <p className="text-secondary-300 text-sm">
                Our team is available to help you set up your CRM for success
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">
              View Documentation
            </button>
            <button className="btn-primary">
              Schedule Demo
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeDashboard;