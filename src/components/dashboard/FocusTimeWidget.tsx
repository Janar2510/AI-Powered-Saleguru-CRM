import React, { useState } from 'react';
import { Clock, Brain, TrendingUp, Play, Settings } from 'lucide-react';
import { FocusTimePanel } from '../ai/FocusTimePanel';
import { FocusTimeSlot, FocusTimePreferences, FocusTimeAnalytics } from '../../types/ai';
import { Button } from '../ui/Button';

export const FocusTimeWidget: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusTimeSlot | undefined>();
  const [sessionStartTime, setSessionStartTime] = useState<Date | undefined>();

  // Sample data
  const mockSlots: FocusTimeSlot[] = [
    {
      id: '1',
      start: new Date().setHours(9, 0, 0, 0),
      end: new Date().setHours(10, 30, 0, 0),
      quality_score: 95,
      reason: 'Deep work session - no meetings scheduled',
      category: 'deep_work',
      energy_level: 'high',
      interruptions_expected: false,
      location: 'office',
      tags: ['coding', 'planning'],
      priority_tasks: ['Complete API integration', 'Review code'],
      estimated_completion: 90
    },
    {
      id: '2',
      start: new Date().setHours(14, 0, 0, 0),
      end: new Date().setHours(15, 0, 0, 0),
      quality_score: 82,
      reason: 'Creative brainstorming - team available',
      category: 'creative',
      energy_level: 'medium',
      interruptions_expected: true,
      location: 'coffee_shop',
      tags: ['brainstorming', 'team'],
      priority_tasks: ['Design new features'],
      estimated_completion: 60
    },
    {
      id: '3',
      start: new Date().setHours(16, 30, 0, 0),
      end: new Date().setHours(17, 30, 0, 0),
      quality_score: 78,
      reason: 'Planning and admin tasks',
      category: 'planning',
      energy_level: 'low',
      interruptions_expected: false,
      location: 'home',
      tags: ['planning', 'admin'],
      priority_tasks: ['Update project timeline'],
      estimated_completion: 60
    }
  ];

  const mockPreferences: FocusTimePreferences = {
    preferred_duration: 60,
    preferred_time_of_day: 'morning',
    preferred_location: 'office',
    energy_optimization: true,
    interruption_blocking: true,
    auto_scheduling: false,
    notification_reminders: true,
    break_intervals: 15,
    max_focus_sessions_per_day: 4
  };

  const mockAnalytics: FocusTimeAnalytics = {
    total_focus_time: 480, // 8 hours
    average_session_length: 75,
    completion_rate: 87,
    productivity_score: 92,
    most_productive_time: '9:00 AM',
    most_productive_location: 'Office',
    interruptions_reduced: 65,
    tasks_completed: 23,
    weekly_trend: [
      { date: '2024-01-15', focus_time: 120, productivity_score: 88 },
      { date: '2024-01-16', focus_time: 180, productivity_score: 92 },
      { date: '2024-01-17', focus_time: 150, productivity_score: 85 },
      { date: '2024-01-18', focus_time: 200, productivity_score: 95 },
      { date: '2024-01-19', focus_time: 160, productivity_score: 90 }
    ]
  };

  const handleStartSession = (slot: FocusTimeSlot) => {
    setCurrentSession(slot);
    setSessionStartTime(new Date());
    setIsSessionActive(true);
    setShowPanel(false);
  };

  const handlePauseSession = () => {
    // Handle pause logic
    console.log('Session paused');
  };

  const handleCompleteSession = (slot: FocusTimeSlot, actualDuration: number) => {
    setIsSessionActive(false);
    setCurrentSession(undefined);
    setSessionStartTime(undefined);
    console.log(`Session completed: ${actualDuration} minutes`);
  };

  const handleSchedule = (slot: FocusTimeSlot) => {
    console.log('Scheduling focus time:', slot);
    setShowPanel(false);
  };

  const handlePreferencesChange = (newPreferences: FocusTimePreferences) => {
    console.log('Preferences updated:', newPreferences);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#a259ff] to-[#377dff] rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Focus Time Optimizer</h3>
              <p className="text-sm text-[#b0b0d0]">AI-powered productivity insights</p>
            </div>
          </div>
          <Button
            onClick={() => setShowPanel(true)}
            variant="secondary"
            size="sm"
            icon={Settings}
            className="w-8 h-8 p-0"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#a259ff]">{mockAnalytics.completion_rate}%</p>
            <p className="text-xs text-[#b0b0d0]">Completion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#377dff]">{Math.round(mockAnalytics.total_focus_time / 60)}h</p>
            <p className="text-xs text-[#b0b0d0]">Total Focus Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#43e7ad]">{mockAnalytics.productivity_score}</p>
            <p className="text-xs text-[#b0b0d0]">Productivity Score</p>
          </div>
        </div>

        {/* Active Session Indicator */}
        {isSessionActive && currentSession && (
          <div className="mb-4 p-3 bg-gradient-to-r from-[#43e7ad]/20 to-[#377dff]/20 rounded-lg border border-[#43e7ad]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#43e7ad] rounded-full animate-pulse"></div>
                <span className="text-sm text-white font-medium">Active Focus Session</span>
              </div>
              <span className="text-xs text-[#b0b0d0]">{currentSession.reason}</span>
            </div>
          </div>
        )}

        {/* Next Best Slot */}
        <div className="mb-4 p-3 bg-[#23233a]/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Next Best Focus Time</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#43e7ad] rounded-full"></div>
              <span className="text-xs text-[#b0b0d0]">95/100</span>
            </div>
          </div>
          <p className="text-sm text-white mb-1">Today, 9:00 AM - 10:30 AM</p>
          <p className="text-xs text-[#b0b0d0]">Deep work session - no meetings scheduled</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-auto">
          <Button
            onClick={() => setShowPanel(true)}
            variant="gradient"
            size="sm"
            icon={Clock}
            className="flex-1"
          >
            View All Slots
          </Button>
          {!isSessionActive && (
            <Button
              onClick={() => handleStartSession(mockSlots[0])}
              variant="success"
              size="sm"
              icon={Play}
            >
              Start Now
            </Button>
          )}
        </div>

        {/* Productivity Tip */}
        <div className="mt-4 p-3 bg-blue-600/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Productivity Tip</p>
              <p className="text-xs text-gray-400">
                Your most productive time is 9:00 AM. Schedule important tasks during this window.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Time Panel Modal */}
      {showPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FocusTimePanel
              focusSlots={mockSlots}
              preferences={mockPreferences}
              analytics={mockAnalytics}
              onClose={() => setShowPanel(false)}
              onSchedule={handleSchedule}
              onPreferencesChange={handlePreferencesChange}
              onStartSession={handleStartSession}
              onPauseSession={handlePauseSession}
              onCompleteSession={handleCompleteSession}
              isSessionActive={isSessionActive}
              currentSession={currentSession}
              sessionStartTime={sessionStartTime}
            />
          </div>
        </div>
      )}
    </>
  );
}; 