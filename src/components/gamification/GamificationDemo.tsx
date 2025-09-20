// Gamification Demo Component
// Shows how to integrate gamification with existing CRM actions

import React from 'react';
import { BrandCard, BrandButton } from '../../contexts/BrandDesignContext';
import { useGamificationIntegration } from '../../hooks/useGamificationIntegration';
import { Target, Phone, Mail, CheckCircle, Users, Calendar } from 'lucide-react';

const GamificationDemo: React.FC = () => {
  const gamification = useGamificationIntegration({
    userId: 'demo-user',
    showNotifications: true,
    autoUpdateStreak: true
  });

  // Demo functions to simulate CRM actions
  const simulateDealClosed = async () => {
    const dealId = `deal_${Date.now()}`;
    const dealValue = Math.floor(Math.random() * 50000) + 10000; // Random value between 10k-60k
    await gamification.onDealClosed(dealId, dealValue, true);
    console.log(`🎯 Deal closed! ID: ${dealId}, Value: $${dealValue.toLocaleString()}`);
  };

  const simulateCallMade = async () => {
    const callId = `call_${Date.now()}`;
    const duration = Math.floor(Math.random() * 30) + 5; // Random duration 5-35 minutes
    await gamification.onCallAnswered(callId, duration);
    console.log(`📞 Call completed! ID: ${callId}, Duration: ${duration} minutes`);
  };

  const simulateEmailSent = async () => {
    const emailId = `email_${Date.now()}`;
    await gamification.onEmailSent(emailId);
    console.log(`📧 Email sent! ID: ${emailId}`);
  };

  const simulateTaskCompleted = async () => {
    const taskId = `task_${Date.now()}`;
    await gamification.onTaskCompleted(taskId);
    console.log(`✅ Task completed! ID: ${taskId}`);
  };

  const simulateLeadConverted = async () => {
    const leadId = `lead_${Date.now()}`;
    await gamification.onLeadConverted(leadId);
    console.log(`🎯 Lead converted! ID: ${leadId}`);
  };

  const simulateMeetingAttended = async () => {
    const meetingId = `meeting_${Date.now()}`;
    await gamification.onMeetingAttended(meetingId);
    console.log(`👥 Meeting attended! ID: ${meetingId}`);
  };

  return (
    <BrandCard borderGradient="green">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-green-500/20">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gamification Demo</h3>
            <p className="text-white/70">Try out different CRM actions to earn points and badges!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BrandButton 
            variant="blue" 
            onClick={simulateDealClosed}
            className="flex flex-col items-center space-y-2 h-20"
          >
            <Target className="w-5 h-5" />
            <span className="text-sm">Close Deal</span>
            <span className="text-xs opacity-70">+100-140 pts</span>
          </BrandButton>

          <BrandButton 
            variant="green" 
            onClick={simulateCallMade}
            className="flex flex-col items-center space-y-2 h-20"
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm">Make Call</span>
            <span className="text-xs opacity-70">+10-70 pts</span>
          </BrandButton>

          <BrandButton 
            variant="purple" 
            onClick={simulateEmailSent}
            className="flex flex-col items-center space-y-2 h-20"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm">Send Email</span>
            <span className="text-xs opacity-70">+3 pts</span>
          </BrandButton>

          <BrandButton 
            variant="orange" 
            onClick={simulateTaskCompleted}
            className="flex flex-col items-center space-y-2 h-20"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Complete Task</span>
            <span className="text-xs opacity-70">+10 pts</span>
          </BrandButton>

          <BrandButton 
            variant="yellow" 
            onClick={simulateLeadConverted}
            className="flex flex-col items-center space-y-2 h-20"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Convert Lead</span>
            <span className="text-xs opacity-70">+50 pts</span>
          </BrandButton>

          <BrandButton 
            variant="red" 
            onClick={simulateMeetingAttended}
            className="flex flex-col items-center space-y-2 h-20"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Attend Meeting</span>
            <span className="text-xs opacity-70">+20 pts</span>
          </BrandButton>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-white font-medium mb-2">💡 Integration Tips</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Points are awarded automatically when CRM actions are performed</li>
            <li>• Badges are unlocked when you reach specific milestones</li>
            <li>• Streaks give bonus points for consecutive daily activities</li>
            <li>• Check the console to see the gamification events being triggered</li>
            <li>• Larger deals give bonus points based on value</li>
          </ul>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <h4 className="text-white font-medium mb-2">🏆 Example Integration</h4>
          <pre className="text-white/70 text-xs overflow-x-auto">
{`// In your Deal component:
import { useGamificationIntegration } from '../hooks/useGamificationIntegration';

const gamification = useGamificationIntegration();

const handleDealClose = async (deal) => {
  // Your existing deal closing logic
  await closeDeal(deal.id);
  
  // Award gamification points
  await gamification.onDealClosed(deal.id, deal.value, true);
};`}
          </pre>
        </div>
      </div>
    </BrandCard>
  );
};

export default GamificationDemo;


