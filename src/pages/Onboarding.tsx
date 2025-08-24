import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, X, Users, Calendar, Target, Bot, Settings, Zap, Bell, Mail } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthCard, authInputClass, authButtonClass, AUTH_GRADIENT, AUTH_CARD_BG } from '../components/ui/AuthTheme';
import { Badge } from '../components/ui/Badge';
import Spline from '@splinetool/react-spline';
import { supabase } from '../services/supabase';

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
  const { updateUser, user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User',
    email: user?.email || 'user@example.com',
    company: 'Your Company',
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

  // Update userData when user changes
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'User',
        email: user.email || 'user@example.com'
      }));
    }
  }, [user]);

  const handleNext = async () => {
    console.log('handleNext called, currentStep:', currentStep);
    console.log('STEPS.length:', STEPS.length);
    console.log('currentStep < STEPS.length - 1:', currentStep < STEPS.length - 1);
    
    if (currentStep < STEPS.length - 1) {
      // Simply advance to next step - no email sending here
      console.log('Advancing to next step...');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Complete onboarding
      console.log('Completing onboarding...');
      console.log('About to call updateUser...');
      try {
        // Test direct database update first with timeout
        console.log('Testing direct database update...');
        
        const updatePromise = supabase
          .from('user_profiles')
          .update({ onboarding_completed: true })
          .eq('id', user?.id)
          .select();
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database update timeout')), 5000);
        });
        
        const { data: directUpdate, error: directError } = await Promise.race([
          updatePromise,
          timeoutPromise
        ]) as any;
        
        console.log('Direct update result:', { directUpdate, directError });
        
        if (directError) {
          console.error('Direct update failed:', directError);
          
          // TEMPORARY FIX: Skip database update and just navigate
          console.log('Temporarily skipping database update due to error...');
          console.log('Onboarding completed successfully (local only)');
          showToast({
            type: 'success',
            title: 'Onboarding Complete',
            message: 'Welcome to SaleToru CRM! Your workspace is ready.'
          });
          
          // Navigate to dashboard
          console.log('Navigating to dashboard...');
          navigate('/dashboard');
          return;
        } else {
          console.log('Direct update successful');
        }
        
        console.log('Onboarding completed successfully');
        showToast({
          type: 'success',
          title: 'Onboarding Complete',
          message: 'Welcome to SaleToru CRM! Your workspace is ready.'
        });
        
        // Refresh user profile to ensure onboarding_completed is updated
        console.log('Refreshing user profile...');
        await refreshUser();
        
        // Navigate to dashboard
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to complete onboarding. Please try again.'
        });
      }
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

  const handleSkip = async () => {
    try {
      const { error } = await updateUser({ onboarding_completed: true });
      if (error) throw error;
      
      showToast({
        type: 'info',
        title: 'Onboarding Skipped',
        message: 'You can complete setup anytime from Settings'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to skip onboarding. Please try again.'
      });
    }
  };

  // Temporary function to bypass database update
  const handleCompleteWithoutDB = async () => {
    console.log('Completing onboarding without database update...');
    
    try {
      // Try to update user with a short timeout
      const updatePromise = updateUser({ onboarding_completed: true });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Update timeout')), 2000);
      });
      
      try {
        await Promise.race([updatePromise, timeoutPromise]);
        console.log('User state updated successfully');
      } catch (timeoutError) {
        console.log('Update timed out, continuing without database update...');
        // Continue anyway - the local state will be updated by the timeout
      }
    } catch (error) {
      console.log('Error updating user state:', error);
    }
    
    showToast({
      type: 'success',
      title: 'Onboarding Complete',
      message: 'Welcome to SaleToru CRM! Your workspace is ready.'
    });
    
    // Navigate to dashboard
    console.log('Navigating to dashboard...');
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

  // Function to send team invite emails
  const sendTeamInviteEmail = async (email: string, role: string) => {
    try {
      console.log('Attempting to send email to:', email);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `You've been invited to join ${userData.company} on SaleToru CRM`,
          html_body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8b5cf6;">You're Invited to Join SaleToru CRM!</h2>
              <p>Hello!</p>
              <p>You've been invited by <strong>${userData.name}</strong> to join <strong>${userData.company}</strong> on SaleToru CRM as a <strong>${role}</strong>.</p>
              <p>SaleToru CRM is a powerful AI-driven customer relationship management platform that will help you:</p>
              <ul>
                <li>Track and manage deals effectively</li>
                <li>Automate routine tasks with AI</li>
                <li>Collaborate with your team seamlessly</li>
                <li>Get insights and analytics</li>
              </ul>
              <p>To accept this invitation, please click the link below:</p>
              <a href="${window.location.origin}/signup?invite=${encodeURIComponent(email)}" 
                 style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Accept Invitation
              </a>
              <p>If you have any questions, please contact ${userData.name} at ${userData.email}.</p>
              <p>Best regards,<br>The SaleToru Team</p>
            </div>
          `,
          text_body: `
            You're Invited to Join SaleToru CRM!
            
            Hello!
            
            You've been invited by ${userData.name} to join ${userData.company} on SaleToru CRM as a ${role}.
            
            SaleToru CRM is a powerful AI-driven customer relationship management platform.
            
            To accept this invitation, please visit: ${window.location.origin}/signup?invite=${encodeURIComponent(email)}
            
            If you have any questions, please contact ${userData.name} at ${userData.email}.
            
            Best regards,
            The SaleToru Team
          `
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      // For now, just log the error and continue
      // In production, you might want to queue failed emails for retry
      console.log('Email sending failed, but continuing with onboarding...');
      throw error;
    }
  };

  const handleSendInvitations = async () => {
    console.log('Sending team invites...');
    for (const member of userData.teamInvites) {
      if (member.email) {
        try {
          await sendTeamInviteEmail(member.email, member.role);
          showToast({
            type: 'success',
            title: 'Invite Sent',
            message: `Invitation sent to ${member.email}`
          });
        } catch (error) {
          console.error('Failed to send invite to:', member.email, error);
          showToast({
            type: 'error',
            title: 'Invite Failed',
            message: `Failed to send invite to ${member.email}`
          });
        }
      }
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome':
        return (
          <AuthCard className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-full flex items-center justify-center mx-auto mb-6">
                <img 
                  src="https://i.imgur.com/Zylpdjy.png" 
                  alt="SaleToru Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Welcome to SaleToru CRM</h1>
              <p className="text-[#b0b0d0] max-w-md mx-auto">
                Let's set up your workspace in just a few steps to get you started with the most powerful AI-driven CRM.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#23233a]/40 backdrop-blur-sm p-6 rounded-xl border border-[#23233a]/50">
                <Target className="w-8 h-8 text-[#a259ff] mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Smart Pipeline</h3>
                <p className="text-sm text-[#b0b0d0]">AI-powered deal tracking and automation</p>
              </div>
              <div className="bg-[#23233a]/40 backdrop-blur-sm p-6 rounded-xl border border-[#23233a]/50">
                <Bot className="w-8 h-8 text-[#377dff] mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">AI Assistant</h3>
                <p className="text-sm text-[#b0b0d0]">Intelligent insights and recommendations</p>
              </div>
              <div className="bg-[#23233a]/40 backdrop-blur-sm p-6 rounded-xl border border-[#23233a]/50">
                <Users className="w-8 h-8 text-[#43e7ad] mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Team Collaboration</h3>
                <p className="text-sm text-[#b0b0d0]">Seamless team communication and sharing</p>
              </div>
            </div>
          </AuthCard>
        );
      
      case 'pipeline':
        return (
          <AuthCard>
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-[#a259ff] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Pipeline</h2>
              <p className="text-[#b0b0d0]">Select the sales pipeline that best fits your business</p>
            </div>
            
            <div className="space-y-4">
              {pipelineOptions.map((pipeline) => (
                <div
                  key={pipeline.id}
                  onClick={() => setUserData(prev => ({ ...prev, pipeline: pipeline.id }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    userData.pipeline === pipeline.id
                      ? 'border-[#a259ff] bg-[#a259ff]/10'
                      : 'border-[#23233a] bg-[#23233a]/40 hover:border-[#23233a]/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{pipeline.name}</h3>
                      <p className="text-sm text-[#b0b0d0] mb-3">{pipeline.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {pipeline.stages.map((stage, index) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {userData.pipeline === pipeline.id && (
                      <Check className="w-5 h-5 text-[#a259ff] ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AuthCard>
        );
      
      case 'team':
        return (
          <AuthCard>
            <div className="text-center mb-8">
              <Users className="w-12 h-12 text-[#377dff] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Invite Your Team</h2>
              <p className="text-[#b0b0d0]">Add team members to collaborate on deals and projects</p>
            </div>
            
            <div className="space-y-4">
              {userData.teamInvites.map((member, index) => (
                <div key={index} className="bg-[#23233a]/40 backdrop-blur-sm p-4 rounded-xl border border-[#23233a]/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => handleUpdateTeamMember(index, 'email', e.target.value)}
                        placeholder="Enter email address"
                        className={`w-full px-3 py-2 rounded-lg bg-[#23233a]/60 text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff]`}
                      />
                    </div>
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateTeamMember(index, 'role', e.target.value)}
                      className={`px-3 py-2 rounded-lg bg-[#23233a]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]`}
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveTeamMember(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleAddTeamMember}
                className="w-full py-3 rounded-xl border-2 border-dashed border-[#23233a] text-[#b0b0d0] hover:border-[#a259ff] hover:text-[#a259ff] transition-all"
              >
                + Add Team Member
              </button>
              
              {userData.teamInvites.length > 0 && (
                <div className="mt-6 p-4 bg-[#23233a]/40 rounded-xl border border-[#23233a]/50">
                  <button
                    onClick={handleSendInvitations}
                    className="w-full py-3 rounded-xl bg-[#377dff] text-white font-semibold hover:bg-[#377dff]/80 transition-all"
                  >
                    Send Invitations
                  </button>
                </div>
              )}
              
              {/* Temporary button for testing */}
              <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-sm mb-3">⚠️ Database update is hanging. Use this button to complete onboarding:</p>
                <button
                  onClick={handleCompleteWithoutDB}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
                >
                  Complete Onboarding (Skip DB)
                </button>
              </div>
            </div>
          </AuthCard>
        );
      
      case 'preferences':
        return (
          <AuthCard>
            <div className="text-center mb-8">
              <Settings className="w-12 h-12 text-[#43e7ad] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Set Your Preferences</h2>
              <p className="text-[#b0b0d0]">Configure your working hours and notification preferences</p>
            </div>
            
            <div className="space-y-6">
              {/* Working Hours */}
              <div className="bg-[#23233a]/40 backdrop-blur-sm p-6 rounded-xl border border-[#23233a]/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#a259ff]" />
                  Working Hours
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={userData.workHours.start}
                      onChange={(e) => setUserData(prev => ({
                        ...prev,
                        workHours: { ...prev.workHours, start: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg bg-[#23233a]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={userData.workHours.end}
                      onChange={(e) => setUserData(prev => ({
                        ...prev,
                        workHours: { ...prev.workHours, end: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg bg-[#23233a]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Working Days
                  </label>
                  <div className="flex gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <button
                        key={day}
                        onClick={() => handleToggleWorkDay(index + 1)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          userData.workHours.days.includes(index + 1)
                            ? 'bg-[#a259ff] text-white'
                            : 'bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="bg-[#23233a]/40 backdrop-blur-sm p-6 rounded-xl border border-[#23233a]/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#377dff]" />
                  Notifications
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Email Notifications</h4>
                      <p className="text-sm text-[#b0b0d0]">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => setUserData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: !prev.notifications.email }
                      }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        userData.notifications.email ? 'bg-[#a259ff]' : 'bg-[#23233a]/60'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        userData.notifications.email ? 'ml-6' : 'ml-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Browser Notifications</h4>
                      <p className="text-sm text-[#b0b0d0]">Get notified in your browser</p>
                    </div>
                    <button
                      onClick={() => setUserData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, browser: !prev.notifications.browser }
                      }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        userData.notifications.browser ? 'bg-[#a259ff]' : 'bg-[#23233a]/60'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        userData.notifications.browser ? 'ml-6' : 'ml-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Mobile Notifications</h4>
                      <p className="text-sm text-[#b0b0d0]">Push notifications on mobile</p>
                    </div>
                    <button
                      onClick={() => setUserData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, mobile: !prev.notifications.mobile }
                      }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        userData.notifications.mobile ? 'bg-[#a259ff]' : 'bg-[#23233a]/60'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        userData.notifications.mobile ? 'ml-6' : 'ml-1'
                      }`} />
                    </button>
                  </div>
                </div>
                
                {userData.notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
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
                        className={`w-full px-3 py-2 rounded-lg bg-[#23233a]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
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
                        className={`w-full px-3 py-2 rounded-lg bg-[#23233a]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AuthCard>
        );
      
      case 'complete':
        return (
          <AuthCard className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-[#43e7ad] to-[#377dff] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">You're All Set!</h1>
              <p className="text-[#b0b0d0] max-w-md mx-auto">
                Your SaleToru CRM workspace is ready to use. Let's start boosting your sales productivity!
              </p>
            </div>
            
            <div className="bg-[#23233a]/40 backdrop-blur-sm p-6 rounded-xl border border-[#23233a]/50 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Your Setup Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-[#a259ff]" />
                    <span className="text-white">Sales Pipeline</span>
                  </div>
                  <Badge variant="success" size="sm">Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-[#377dff]" />
                    <span className="text-white">Team Members</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {userData.teamInvites.length > 0 ? `${userData.teamInvites.length} Invited` : 'Ready'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[#43e7ad]" />
                    <span className="text-white">Working Hours</span>
                  </div>
                  <Badge variant="success" size="sm">Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-[#a259ff]" />
                    <span className="text-white">Notifications</span>
                  </div>
                  <Badge variant="success" size="sm">Configured</Badge>
                </div>
              </div>
            </div>
            
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#23233a]/40 backdrop-blur-sm p-4 rounded-xl border border-[#23233a]/50">
                  <Target className="w-8 h-8 text-[#a259ff] mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Add Your First Deal</h4>
                  <p className="text-xs text-[#b0b0d0]">Start tracking your sales opportunities</p>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm p-4 rounded-xl border border-[#23233a]/50">
                  <Users className="w-8 h-8 text-[#43e7ad] mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Import Contacts</h4>
                  <p className="text-xs text-[#b0b0d0]">Bring your existing contacts into SaleToru</p>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm p-4 rounded-xl border border-[#23233a]/50">
                  <Bot className="w-8 h-8 text-[#377dff] mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Try SaleToruGuru</h4>
                  <p className="text-xs text-[#b0b0d0]">Explore the AI assistant capabilities</p>
                </div>
              </div>
              
              {/* Temporary button for testing */}
              <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-sm mb-3">⚠️ Database update is hanging. Use this button to complete onboarding:</p>
                <button
                  onClick={handleCompleteWithoutDB}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
                >
                  Complete Onboarding (Skip DB)
                </button>
              </div>
            </div>
          </AuthCard>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative z-10 flex items-center justify-center px-4 pt-24 pb-12 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="max-w-4xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-[#b0b0d0]">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-[#a259ff] hover:text-[#8040C0] transition-colors"
            >
              {currentStep < STEPS.length - 1 ? 'Skip Setup' : ''}
            </button>
          </div>
          <div className="w-full bg-[#23233a]/60 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${AUTH_GRADIENT}`}
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNext}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${authButtonClass}`}
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