import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../contexts/ModalContext';
import { 
  Clock, 
  X, 
  Calendar, 
  Check, 
  Brain,
  Sun,
  Sunrise,
  Sunset,
  Settings,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Bell,
  MapPin,
  Tag,
  Repeat,
  BarChart3,
  Play,
  Pause,
  SkipForward,
  Coffee,
  Home,
  Building,
  Smartphone,
  Timer,
  Star,
  AlertCircle,
  CheckCircle,
  Clock3,
  Users,
  Lightbulb,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { Card } from '../ui/Card';
import Dropdown from '../ui/Dropdown';
import { FocusTimeSlot, FocusTimePreferences, FocusTimeAnalytics } from '../../types/ai';

interface FocusTimePanelProps {
  focusSlots: FocusTimeSlot[];
  preferences?: FocusTimePreferences;
  analytics?: FocusTimeAnalytics;
  onClose: () => void;
  onSchedule: (slot: FocusTimeSlot) => void;
  onPreferencesChange?: (preferences: FocusTimePreferences) => void;
  onStartSession?: (slot: FocusTimeSlot) => void;
  onPauseSession?: () => void;
  onCompleteSession?: (slot: FocusTimeSlot, actualDuration: number) => void;
  isSessionActive?: boolean;
  currentSession?: FocusTimeSlot;
  sessionStartTime?: Date;
}

export const FocusTimePanel: React.FC<FocusTimePanelProps> = ({
  focusSlots,
  preferences = {
    preferred_duration: 60,
    preferred_time_of_day: 'any',
    preferred_location: 'anywhere',
    energy_optimization: true,
    interruption_blocking: true,
    auto_scheduling: false,
    notification_reminders: true,
    break_intervals: 15,
    max_focus_sessions_per_day: 4
  },
  analytics,
  onClose,
  onSchedule,
  onPreferencesChange,
  onStartSession,
  onPauseSession,
  onCompleteSession,
  isSessionActive = false,
  currentSession,
  sessionStartTime
}) => {
  const { openModal, closeModal } = useModal();
  const [selectedSlot, setSelectedSlot] = useState<number>(-1);

  // Open modal when component mounts
  useEffect(() => {
    openModal();
    return () => closeModal();
  }, [openModal, closeModal]);
  const [timePreference, setTimePreference] = useState<'morning' | 'afternoon' | 'evening' | 'any'>(preferences.preferred_time_of_day);
  const [duration, setDuration] = useState<number>(preferences.preferred_duration);
  const [location, setLocation] = useState<'office' | 'home' | 'coffee_shop' | 'anywhere'>(preferences.preferred_location);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'quality' | 'time' | 'date'>('quality');

  // Timer effect for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && !isPaused && sessionStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
        setSessionTimer(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isPaused, sessionStartTime]);

  const formatTimeSlot = (slot: FocusTimeSlot) => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    
    const dateStr = start.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const timeStr = `${start.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${end.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
    
    return { dateStr, timeStr };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-400';
    return 'bg-orange-400';
  };

  const getEnergyIcon = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'medium': return <Target className="w-4 h-4 text-blue-400" />;
      case 'low': return <Coffee className="w-4 h-4 text-gray-400" />;
      default: return <Zap className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLocationIcon = (loc?: string) => {
    switch (loc) {
      case 'office': return <Building className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'coffee_shop': return <Coffee className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'deep_work': return <Brain className="w-4 h-4" />;
      case 'meetings': return <Users className="w-4 h-4" />;
      case 'planning': return <Target className="w-4 h-4" />;
      case 'creative': return <Lightbulb className="w-4 h-4" />;
      case 'admin': return <Settings className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSlots = focusSlots
    .filter(slot => {
      // Time preference filter
      if (timePreference !== 'any') {
        const hour = new Date(slot.start).getHours();
        if (timePreference === 'morning' && (hour < 5 || hour >= 12)) return false;
        if (timePreference === 'afternoon' && (hour < 12 || hour >= 17)) return false;
        if (timePreference === 'evening' && hour < 17) return false;
      }

      // Location filter
      if (location !== 'anywhere' && slot.location && slot.location !== location) return false;

      // Category filter
      if (selectedCategory !== 'all' && slot.category !== selectedCategory) return false;

      // Search filter
      if (searchTerm && !slot.reason.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return b.quality_score - a.quality_score;
        case 'time':
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        case 'date':
          return new Date(b.start).getTime() - new Date(a.start).getTime();
        default:
          return 0;
      }
    });

  const handleStartSession = () => {
    if (selectedSlot >= 0 && onStartSession) {
      onStartSession(filteredSlots[selectedSlot]);
    }
  };

  const handlePauseSession = () => {
    setIsPaused(!isPaused);
    if (onPauseSession) {
      onPauseSession();
    }
  };

  const handleCompleteSession = () => {
    if (currentSession && onCompleteSession) {
      onCompleteSession(currentSession, Math.floor(sessionTimer / 60));
    }
  };

  const handlePreferencesSave = () => {
    if (onPreferencesChange) {
      onPreferencesChange({
        ...preferences,
        preferred_duration: duration,
        preferred_time_of_day: timePreference,
        preferred_location: location
      });
    }
    setShowPreferences(false);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 z-[9999999] !z-[9999999]">
      <Card className="p-4 sm:p-6 border-l-4 border-blue-400 max-w-5xl w-full max-h-[95vh] overflow-y-auto bg-[#23233a]/99 backdrop-blur-2xl border border-[#23233a]/60 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#a259ff] to-[#377dff] rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Focus Time Optimizer</h3>
            <p className="text-[#b0b0d0] text-xs sm:text-sm">
              AI-powered focus time recommendations for peak productivity
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {analytics && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 rounded-lg bg-[#23233a]/60 hover:bg-[#23233a]/80 transition-all border border-[#23233a]/40"
              title="View Analytics"
            >
              <BarChart3 className="w-4 h-4 text-[#b0b0d0]" />
            </button>
          )}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="p-2 rounded-lg bg-[#23233a]/60 hover:bg-[#23233a]/80 transition-all border border-[#23233a]/40"
            title="Preferences"
          >
            <Settings className="w-4 h-4 text-[#b0b0d0]" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#23233a]/60 hover:bg-[#23233a]/80 transition-all border border-[#23233a]/40"
          >
            <X className="w-4 h-4 text-[#b0b0d0]" />
          </button>
        </div>
      </div>

      {/* Active Session Display */}
      {isSessionActive && currentSession && (
        <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-[#43e7ad]/20 to-[#377dff]/20 rounded-xl border border-[#43e7ad]/30 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#43e7ad] to-[#377dff] rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base sm:text-lg">Active Focus Session</p>
                <p className="text-[#b0b0d0] text-xs sm:text-sm">{currentSession.reason}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-mono text-white font-bold">{formatDuration(sessionTimer)}</p>
                <p className="text-xs text-[#b0b0d0]">Elapsed</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePauseSession}
                  className="p-2 sm:p-3 rounded-xl bg-[#23233a]/60 hover:bg-[#23233a]/80 transition-all border border-[#23233a]/40"
                >
                  {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                </button>
                <button
                  onClick={handleCompleteSession}
                  className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-[#43e7ad] to-[#377dff] hover:from-[#43e7ad]/90 hover:to-[#377dff]/90 transition-all shadow-lg"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && analytics && (
        <div className="mb-6 p-6 bg-[#23233a]/60 rounded-xl border border-[#23233a]/40 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{Math.round(analytics.total_focus_time / 60)}h</p>
              <p className="text-xs text-[#b0b0d0] font-medium">Total Focus Time</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#43e7ad]">{analytics.completion_rate}%</p>
              <p className="text-xs text-[#b0b0d0] font-medium">Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#377dff]">{analytics.productivity_score}/100</p>
              <p className="text-xs text-[#b0b0d0] font-medium">Productivity Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#a259ff]">{analytics.tasks_completed}</p>
              <p className="text-xs text-[#b0b0d0] font-medium">Tasks Completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="mb-6 p-6 bg-[#23233a]/60 rounded-xl border border-[#23233a]/40 backdrop-blur-sm">
          <h4 className="text-white font-bold text-lg mb-4">Focus Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Duration</label>
              <Dropdown
                options={[
                  { value: '30', label: '30 minutes' },
                  { value: '45', label: '45 minutes' },
                  { value: '60', label: '1 hour' },
                  { value: '90', label: '1.5 hours' },
                  { value: '120', label: '2 hours' }
                ]}
                value={duration.toString()}
                onChange={(value) => setDuration(parseInt(value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Location</label>
              <Dropdown
                options={[
                  { value: 'anywhere', label: 'Anywhere' },
                  { value: 'office', label: 'Office' },
                  { value: 'home', label: 'Home' },
                  { value: 'coffee_shop', label: 'Coffee Shop' }
                ]}
                value={location}
                onChange={(value) => setLocation(value as 'office' | 'home' | 'coffee_shop' | 'anywhere')}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePreferencesSave}
                className="w-full bg-gradient-to-r from-[#a259ff] to-[#377dff] hover:from-[#a259ff]/90 hover:to-[#377dff]/90 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search focus slots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#23233a]/60 border border-[#23233a]/40 rounded-xl px-4 py-3 text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] transition-all text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dropdown
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'deep_work', label: 'Deep Work' },
                  { value: 'meetings', label: 'Meetings' },
                  { value: 'planning', label: 'Planning' },
                  { value: 'creative', label: 'Creative' },
                  { value: 'admin', label: 'Admin' }
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="min-w-[160px]"
              />
              <Dropdown
                options={[
                  { value: 'quality', label: 'Sort by Quality' },
                  { value: 'time', label: 'Sort by Time' },
                  { value: 'date', label: 'Sort by Date' }
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as 'quality' | 'time' | 'date')}
                className="min-w-[160px]"
              />
            </div>
          </div>

        {/* Time Preference Buttons */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">Preferred Time of Day</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { value: 'any', icon: Clock, label: 'Any' },
              { value: 'morning', icon: Sunrise, label: 'Morning' },
              { value: 'afternoon', icon: Sun, label: 'Afternoon' },
              { value: 'evening', icon: Sunset, label: 'Evening' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTimePreference(value as any)}
                className={`p-2 sm:p-3 md:p-4 rounded-xl text-xs sm:text-sm flex flex-col items-center justify-center transition-all duration-200 min-h-[60px] sm:min-h-[80px] ${
                  timePreference === value
                    ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white shadow-lg scale-105 border border-[#a259ff]/30'
                    : 'bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 hover:text-white border border-[#23233a]/40'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mb-1 sm:mb-2 flex-shrink-0" />
                <span className="font-medium text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Focus Time Benefits */}
      <div className="bg-gradient-to-r from-[#a259ff]/20 to-[#377dff]/20 p-4 sm:p-6 rounded-xl mb-6 border border-[#a259ff]/30 backdrop-blur-sm">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-[#a259ff] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base sm:text-lg mb-3">Focus Time Benefits</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-[#b0b0d0]">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#43e7ad] flex-shrink-0" />
                <span className="font-medium truncate">40% productivity increase</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#377dff] flex-shrink-0" />
                <span className="font-medium truncate">Reduced interruptions</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 sm:col-span-2 lg:col-span-1">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#a259ff] flex-shrink-0" />
                <span className="font-medium truncate">Better task completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Slots List */}
      <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto pr-2 mb-6">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot, index) => {
            const { dateStr, timeStr } = formatTimeSlot(slot);
            const slotDuration = Math.round((new Date(slot.end).getTime() - new Date(slot.start).getTime()) / (1000 * 60));
            
            return (
              <button
                key={slot.id || index}
                onClick={() => setSelectedSlot(index)}
                className={`w-full flex items-start p-4 sm:p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                  selectedSlot === index
                    ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white shadow-lg border border-[#a259ff]/30'
                    : 'bg-[#23233a]/60 hover:bg-[#23233a]/80 text-white border border-[#23233a]/40'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(slot.category)}
                      <p className="font-medium">{dateStr}</p>
                      {slot.recurring && <Repeat className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getQualityColor(slot.quality_score)} shadow-sm`}></div>
                      <span className="text-sm font-bold text-white">{slot.quality_score}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-80">{timeStr}</p>
                    <div className="flex items-center space-x-1">
                      <Timer className="w-3 h-3" />
                      <span className="text-xs">{slotDuration}min</span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-2 ${selectedSlot === index ? 'text-white/80' : 'text-gray-400'}`}>
                    {slot.reason}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    {getEnergyIcon(slot.energy_level)}
                    {getLocationIcon(slot.location)}
                    {slot.interruptions_expected && (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>Interruptions expected</span>
                      </div>
                    )}
                    {slot.priority_tasks && slot.priority_tasks.length > 0 && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <Star className="w-3 h-3" />
                        <span>{slot.priority_tasks.length} priority tasks</span>
                      </div>
                    )}
                  </div>
                  
                  {slot.tags && slot.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {slot.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-[#23233a]/60 rounded-full text-xs font-medium text-[#b0b0d0] border border-[#23233a]/40"
                        >
                          {tag}
                        </span>
                      ))}
                      {slot.tags.length > 3 && (
                        <span className="px-3 py-1 bg-[#23233a]/60 rounded-full text-xs font-medium text-[#b0b0d0] border border-[#23233a]/40">
                          +{slot.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedSlot === index && (
                  <Check className="w-5 h-5 ml-3 flex-shrink-0" />
                )}
              </button>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">No focus slots available</p>
            <p className="text-[#b0b0d0] text-sm mb-6">
              Try adjusting your filters or check your calendar
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setTimePreference('any');
                setLocation('anywhere');
              }}
              className="flex items-center space-x-3 mx-auto px-6 py-3 bg-[#23233a]/60 hover:bg-[#23233a]/80 rounded-xl transition-all border border-[#23233a]/40"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium">Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-[#b0b0d0]">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Excellent</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Fair</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              disabled={selectedSlot < 0 || filteredSlots.length === 0}
              className="bg-gradient-to-r from-[#a259ff] to-[#377dff] hover:from-[#a259ff]/90 hover:to-[#377dff]/90 disabled:opacity-50 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center space-x-2 sm:space-x-3 font-bold shadow-lg text-xs sm:text-sm md:text-base min-w-[140px] sm:min-w-[160px]"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Start Focus Session</span>
            </button>
          ) : (
            <button
              onClick={handleCompleteSession}
              className="bg-gradient-to-r from-[#43e7ad] to-[#377dff] hover:from-[#43e7ad]/90 hover:to-[#377dff]/90 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center space-x-2 sm:space-x-3 font-bold shadow-lg text-xs sm:text-sm md:text-base min-w-[140px] sm:min-w-[160px]"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Complete Session</span>
            </button>
          )}
          
          <button
            onClick={() => selectedSlot >= 0 && onSchedule(filteredSlots[selectedSlot])}
            disabled={selectedSlot < 0 || filteredSlots.length === 0}
            className="bg-[#23233a]/60 hover:bg-[#23233a]/80 disabled:opacity-50 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center space-x-2 sm:space-x-3 font-bold border border-[#23233a]/40 text-xs sm:text-sm md:text-base min-w-[140px] sm:min-w-[160px]"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">Schedule Later</span>
          </button>
        </div>
      </div>
    </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}; 