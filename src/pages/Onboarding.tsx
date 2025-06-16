import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, X, Users, Calendar, Target, Bot, Settings, Zap, Bell } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spline from '@splinetool/react-spline';

// Onboarding steps
const STEPS = [
  'welcome',
  'pipeline',
  'team',
  'preferences',
  'complete'
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Janar Kuusk',
    email: 'janar@example.com',
    company: 'SaleToru Inc.',
    role: 'Sales Manager',
    pipeline: 'sales',
    teamInvites: [] as { email: string; role: string }[],
    workHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    },
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    }
  });

  // Pipeline options
  const pipelineOptions = [
    { id: 'sales', name: 'Sales Pipeline', description: 'Standard B2B sales process', stages: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed'] },
    { id: 'enterprise', name: 'Enterprise Pipeline', description: 'Complex sales with multiple stakeholders', stages: ['Prospect', 'Discovery', 'Technical Validation', 'Business Validation', 'Contract', 'Closed'] },
    { id: 'simple', name: 'Simple Pipeline', description: 'Streamlined process for quick sales', stages: ['Lead', 'Meeting', 'Proposal', 'Closed'] }
  ];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Complete onboarding
      showToast({
        type: 'success',
        title: 'Onboarding Complete',
        message: 'Welcome to SaleToru CRM! Your workspace is ready.'
      });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    showToast({
      type: 'info',
      title: 'Onboarding Skipped',
      message: 'You can complete setup anytime from Settings'
    });
    navigate('/dashboard');
  };

  const handleAddTeamMember = () => {
    const newMember = { email: '', role: 'member' };
    setUserData(prev => ({
      ...prev,
      teamInvites: [...prev.teamInvites, newMember]
    }));
  };

  const handleUpdateTeamMember = (index: number, field: string, value: string) => {
    setUserData(prev => {
      const updatedInvites = [...prev.teamInvites];
      updatedInvites[index] = { ...updatedInvites[index], [field]: value };
      return { ...prev, teamInvites: updatedInvites };
    });
  };

  const handleRemoveTeamMember = (index: number) => {
    setUserData(prev => {
      const updatedInvites = [...prev.teamInvites];
      updatedInvites.splice(index, 1);
      return { ...prev, teamInvites: updatedInvites };
    });
  };

  const handleToggleWorkDay = (day: number) => {
    setUserData(prev => {
      const days = [...prev.workHours.days];
      
      if (days.includes(day)) {
        const index = days.indexOf(day);
        days.splice(index, 1);
      } else {
        days.push(day);
        days.sort();
      }
      
      return {
        ...prev,
        workHours: {
          ...prev.workHours,
          days
        }
      };
    });
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome':
        return (
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <img 
                  src="https://i.imgur.com/Zylpdjy.png" 
                  alt="SaleToru Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Welcome to SaleToru CRM</h1>
              <p className="text-secondary-300 max-w-md mx-auto">
                Let's set up your workspace in just a few steps to get you started with the most powerful AI-driven CRM.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Your SaleToru Pro Account</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-400">Name:</span>
                      <span className="text-white font-medium">{userData.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-400">Email:</span>
                      <span className="text-white font-medium">{userData.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-400">Company:</span>
                      <span className="text-white font-medium">{userData.company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-400">Role:</span>
                      <span className="text-white font-medium">{userData.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">What you'll be able to do with SaleToru:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-secondary-700/60 backdrop-blur-md p-4 rounded-lg border border-secondary-600/50">
                  <Target className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Track Deals</h4>
                  <p className="text-sm text-secondary-400">Manage your sales pipeline with AI-powered insights</p>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md p-4 rounded-lg border border-secondary-600/50">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Manage Leads</h4>
                  <p className="text-sm text-secondary-400">Score and nurture leads with intelligent automation</p>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md p-4 rounded-lg border border-secondary-600/50">
                  <Bot className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">AI Assistant</h4>
                  <p className="text-sm text-secondary-400">Get smart suggestions and automate routine tasks</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'pipeline':
        return (
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Set Up Your Sales Pipeline</h2>
              <p className="text-secondary-300 max-w-md mx-auto">
                Choose a pipeline template that matches your sales process. You can customize it later.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {pipelineOptions.map((pipeline) => (
                <div
                  key={pipeline.id}
                  onClick={() => setUserData(prev => ({ ...prev, pipeline: pipeline.id }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    userData.pipeline === pipeline.id
                      ? 'border-primary-600 bg-primary-600/10'
                      : 'border-secondary-600 hover:border-secondary-500 bg-secondary-700/60 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{pipeline.name}</h3>
                    {userData.pipeline === pipeline.id && (
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-secondary-400 mb-4">{pipeline.description}</p>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {pipeline.stages.map((stage, index) => (
                      <div key={index} className="flex items-center">
                        <div className="px-2 py-1 bg-secondary-600 rounded text-xs text-white whitespace-nowrap">
                          {stage}
                        </div>
                        {index < pipeline.stages.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-secondary-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <Card className="max-w-2xl mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">AI Pipeline Recommendation</h3>
                  <p className="text-secondary-300 mb-4">
                    Based on your company size and industry, we recommend the <span className="text-primary-400 font-medium">Enterprise Pipeline</span> for optimal results.
                  </p>
                  <button 
                    onClick={() => setUserData(prev => ({ ...prev, pipeline: 'enterprise' }))}
                    className="btn-primary"
                  >
                    Use Recommended Pipeline
                  </button>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case 'team':
        return (
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Invite Your Team</h2>
              <p className="text-secondary-300 max-w-md mx-auto">
                Collaborate with your team members by inviting them to your SaleToru workspace.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
              
              <div className="space-y-4 mb-6">
                {/* Current User (You) */}
                <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg border border-secondary-600/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">JK</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{userData.name}</div>
                      <div className="text-sm text-secondary-400">{userData.email}</div>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">Owner</Badge>
                </div>
                
                {/* Invited Members */}
                {userData.teamInvites.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg border border-secondary-600/50">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-secondary-400" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleUpdateTeamMember(index, 'email', e.target.value)}
                          placeholder="colleague@example.com"
                          className="w-full bg-transparent border-b border-secondary-600 text-white focus:outline-none focus:border-primary-600 px-0 py-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateTeamMember(index, 'role', e.target.value)}
                        className="bg-secondary-600 border border-secondary-500 rounded px-2 py-1 text-sm text-white"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        onClick={() => handleRemoveTeamMember(index)}
                        className="p-1 text-secondary-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleAddTeamMember}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            </Card>
            
            <div className="text-center text-secondary-400 text-sm max-w-md mx-auto">
              You can skip this step and invite team members later from the Settings page.
            </div>
          </div>
        );
      
      case 'preferences':
        return (
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Set Your Preferences</h2>
              <p className="text-secondary-300 max-w-md mx-auto">
                Configure your working hours and notification preferences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Working Hours */}
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <span>Working Hours</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={userData.workHours.start}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          workHours: { ...prev.workHours, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={userData.workHours.end}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          workHours: { ...prev.workHours, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Working Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { day: 0, label: 'Sun' },
                        { day: 1, label: 'Mon' },
                        { day: 2, label: 'Tue' },
                        { day: 3, label: 'Wed' },
                        { day: 4, label: 'Thu' },
                        { day: 5, label: 'Fri' },
                        { day: 6, label: 'Sat' }
                      ].map((item) => (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() => handleToggleWorkDay(item.day)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            userData.workHours.days.includes(item.day)
                              ? 'bg-primary-600 text-white'
                              : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Notification Preferences */}
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary-500" />
                  <span>Notifications</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">Email Notifications</h4>
                      <p className="text-sm text-secondary-400">Receive updates via email</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={userData.notifications.email}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                      />
                      <span className={`absolute inset-0 rounded-full transition-colors ${
                        userData.notifications.email ? 'bg-primary-600' : 'bg-secondary-600'
                      }`}></span>
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        userData.notifications.email ? 'translate-x-5' : 'translate-x-0'
                      }`}></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">Browser Notifications</h4>
                      <p className="text-sm text-secondary-400">Show desktop alerts</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={userData.notifications.browser}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, browser: e.target.checked }
                        }))}
                      />
                      <span className={`absolute inset-0 rounded-full transition-colors ${
                        userData.notifications.browser ? 'bg-primary-600' : 'bg-secondary-600'
                      }`}></span>
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        userData.notifications.browser ? 'translate-x-5' : 'translate-x-0'
                      }`}></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">Quiet Hours</h4>
                      <p className="text-sm text-secondary-400">Pause notifications during off hours</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={userData.notifications.quietHours.enabled}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          notifications: { 
                            ...prev.notifications, 
                            quietHours: { 
                              ...prev.notifications.quietHours,
                              enabled: e.target.checked 
                            } 
                          }
                        }))}
                      />
                      <span className={`absolute inset-0 rounded-full transition-colors ${
                        userData.notifications.quietHours.enabled ? 'bg-primary-600' : 'bg-secondary-600'
                      }`}></span>
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        userData.notifications.quietHours.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}></span>
                    </div>
                  </div>
                  
                  {userData.notifications.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-2">
                          Quiet Hours Start
                        </label>
                        <input
                          type="time"
                          value={userData.notifications.quietHours.start}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            notifications: { 
                              ...prev.notifications, 
                              quietHours: { 
                                ...prev.notifications.quietHours,
                                start: e.target.value 
                              } 
                            }
                          }))}
                          className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-2">
                          Quiet Hours End
                        </label>
                        <input
                          type="time"
                          value={userData.notifications.quietHours.end}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            notifications: { 
                              ...prev.notifications, 
                              quietHours: { 
                                ...prev.notifications.quietHours,
                                end: e.target.value 
                              } 
                            }
                          }))}
                          className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">You're All Set!</h1>
              <p className="text-secondary-300 max-w-md mx-auto">
                Your SaleToru CRM workspace is ready to use. Let's start boosting your sales productivity!
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Your Setup Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-primary-500" />
                    <span className="text-white">Sales Pipeline</span>
                  </div>
                  <Badge variant="success" size="sm">Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary-500" />
                    <span className="text-white">Team Members</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {userData.teamInvites.length > 0 ? `${userData.teamInvites.length} Invited` : 'Ready'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <span className="text-white">Working Hours</span>
                  </div>
                  <Badge variant="success" size="sm">Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-primary-500" />
                    <span className="text-white">Notifications</span>
                  </div>
                  <Badge variant="success" size="sm">Configured</Badge>
                </div>
              </div>
            </Card>
            
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary-700/60 backdrop-blur-md p-4 rounded-lg border border-secondary-600/50">
                  <Target className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Add Your First Deal</h4>
                  <p className="text-xs text-secondary-400">Start tracking your sales opportunities</p>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md p-4 rounded-lg border border-secondary-600/50">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Import Contacts</h4>
                  <p className="text-xs text-secondary-400">Bring your existing contacts into SaleToru</p>
                </div>
                <div className="bg-secondary-700/60 backdrop-blur-md p-4 rounded-lg border border-secondary-600/50">
                  <Bot className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Try SaleToruGuru</h4>
                  <p className="text-xs text-secondary-400">Explore the AI assistant capabilities</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-secondary-900/50 to-secondary-900/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-secondary-400">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              {currentStep < STEPS.length - 1 ? 'Skip Setup' : ''}
            </button>
          </div>
          <div className="w-full bg-secondary-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="max-w-4xl mx-auto mt-12 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`btn-secondary flex items-center space-x-2 ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNext}
            className="btn-primary flex items-center space-x-2"
          >
            <span>{currentStep < STEPS.length - 1 ? 'Continue' : 'Get Started'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;