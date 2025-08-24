import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Star,
  Award,
  Crown,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  Flame,
  Medal,
  Gift,
  BarChart3,
  Clock,
  CheckCircle,
  Plus,
  Settings,
  Filter,
  Download,
  Share,
  Eye,
  Sparkles,
  Rocket,
  Shield,
  Heart,
  Diamond,
  Coins,
  Activity,
  ChevronUp,
  ChevronDown,
  PlayCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { BrandBackground, BrandPageLayout, BrandCard, BrandButton, BrandBadge } from '../contexts/BrandDesignContext';
import { gamificationService, UserGamification, UserBadge, UserAchievement, LeaderboardEntry, TeamChallenge } from '../services/gamificationService';
import GamificationDemo from '../components/gamification/GamificationDemo';

interface GamificationStats {
  totalUsers: number;
  totalPoints: number;
  totalBadges: number;
  activeAchievements: number;
  topPerformer: string;
  averageLevel: number;
}

const Gamification: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userGamification, setUserGamification] = useState<UserGamification | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('monthly');
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeDetails, setShowBadgeDetails] = useState<string | null>(null);
  const [showAchievementDetails, setShowAchievementDetails] = useState<string | null>(null);

  // Mock user ID (in real app, get from auth context)
  const currentUserId = 'current-user-id';
  const currentOrgId = 'current-org-id';

  // Load data on component mount
  useEffect(() => {
    loadGamificationData();
  }, []);

  // Reload leaderboard when period changes
  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardPeriod]);

  const loadGamificationData = async () => {
    setIsLoading(true);
    try {
      // Load all gamification data in parallel
      const [
        userGamificationData,
        userBadgesData,
        userAchievementsData,
        leaderboardData,
        teamChallengesData,
        statsData
      ] = await Promise.all([
        gamificationService.getUserGamification(currentUserId),
        gamificationService.getUserBadges(currentUserId),
        gamificationService.getUserAchievements(currentUserId),
        gamificationService.getLeaderboard(leaderboardPeriod, 10),
        gamificationService.getTeamChallenges(),
        gamificationService.getGamificationStats(currentOrgId)
      ]);

      setUserGamification(userGamificationData);
      setUserBadges(userBadgesData);
      setUserAchievements(userAchievementsData);
      setLeaderboard(leaderboardData);
      setTeamChallenges(teamChallengesData);
      setGamificationStats(statsData);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await gamificationService.getLeaderboard(leaderboardPeriod, 10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  // Helper Functions
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'secondary';
      case 'rare': return 'blue';
      case 'epic': return 'purple';
      case 'legendary': return 'orange';
      default: return 'secondary';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return Star;
      case 'rare': return Diamond;
      case 'epic': return Crown;
      case 'legendary': return Trophy;
      default: return Star;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      case 'legendary': return 'purple';
      default: return 'secondary';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'red';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getNextLevelPoints = (level: number) => {
    return level * 1000;
  };

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* User Profile Card */}
      {userGamification && (
        <BrandCard borderGradient="purple">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">{userGamification.level}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Level {userGamification.level}</h2>
                  <p className="text-white/70">
                    {formatNumber(userGamification.total_points)} total points
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white/70">{userGamification.current_streak} day streak</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white/70">{userBadges.length} badges</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-white/70 mb-1">Next Level</div>
                <div className="text-lg font-bold text-white">
                  {formatNumber(getNextLevelPoints(userGamification.level) - userGamification.experience_points)} pts
                </div>
                <div className="w-32 h-2 bg-black/20 rounded-full mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(userGamification.experience_points / getNextLevelPoints(userGamification.level)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{userGamification.deals_closed}</div>
                <div className="text-xs text-white/70">Deals Closed</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{userGamification.calls_made}</div>
                <div className="text-xs text-white/70">Calls Made</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{userGamification.tasks_completed}</div>
                <div className="text-xs text-white/70">Tasks Done</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Users className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{userGamification.leads_converted}</div>
                <div className="text-xs text-white/70">Leads Won</div>
              </div>
            </div>
          </div>
        </BrandCard>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Your Rank</p>
                <p className="text-2xl font-bold text-white">#{userGamification?.global_rank || '-'}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">This Month</p>
                <p className="text-2xl font-bold text-white">{formatNumber(userGamification?.monthly_points || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Coins className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Best Streak</p>
                <p className="text-2xl font-bold text-white">{userGamification?.longest_streak || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20">
                <Flame className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Achievements</p>
                <p className="text-2xl font-bold text-white">{userAchievements.filter(a => a.is_completed).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </BrandCard>
      </div>

      {/* Recent Badges & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Badges */}
        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Badges</h3>
              <BrandButton variant="secondary" size="sm" onClick={() => setActiveTab('badges')}>
                View All
              </BrandButton>
            </div>
            
            <div className="space-y-3">
              {userBadges.slice(0, 3).map((userBadge) => {
                const RarityIcon = getRarityIcon(userBadge.badge.rarity);
                return (
                  <div key={userBadge.id} className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className={`p-2 rounded-lg bg-${userBadge.badge.color}-500/20`}>
                      <RarityIcon className={`w-5 h-5 text-${userBadge.badge.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{userBadge.badge.name}</h4>
                      <p className="text-xs text-white/70">{userBadge.badge.description}</p>
                    </div>
                    <BrandBadge variant={getRarityColor(userBadge.badge.rarity)}>
                      {userBadge.badge.rarity}
                    </BrandBadge>
                  </div>
                );
              })}
            </div>
          </div>
        </BrandCard>

        {/* Progress on Achievements */}
        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Goals</h3>
              <BrandButton variant="secondary" size="sm" onClick={() => setActiveTab('achievements')}>
                View All
              </BrandButton>
            </div>
            
            <div className="space-y-4">
              {userAchievements.filter(a => !a.is_completed).slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white text-sm">{achievement.achievement.title}</h4>
                    <span className="text-xs text-white/70">
                      {achievement.current_progress}/{achievement.goal_value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full">
                    <div 
                      className={`h-full bg-gradient-to-r from-${achievement.achievement.color}-500 to-${achievement.achievement.color}-400 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(achievement.progress_percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{achievement.achievement.description}</span>
                    <span className={`text-${achievement.achievement.color}-400 font-medium`}>
                      {Math.round(achievement.progress_percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrandCard>
      </div>

      {/* Gamification Demo */}
      <GamificationDemo />
    </div>
  );

  // Leaderboard Tab
  const renderLeaderboard = () => (
    <div className="space-y-6">
      {/* Period Selector */}
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
            <div className="flex space-x-2">
              {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((period) => (
                <BrandButton
                  key={period}
                  variant={leaderboardPeriod === period ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setLeaderboardPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
                </BrandButton>
              ))}
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Top 3 Podium */}
      {leaderboard.length > 0 && (
        <BrandCard borderGradient="orange">
          <div className="p-6">
            <div className="flex items-end justify-center space-x-4 mb-6">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-300 flex items-center justify-center mb-2">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-white">{leaderboard[1].user_name}</div>
                  <div className="text-xs text-white/70">{formatNumber(leaderboard[1].points)} pts</div>
                  <div className="w-12 h-16 bg-gray-400/20 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-2">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-lg font-bold text-white">{leaderboard[0].user_name}</div>
                  <div className="text-sm text-white/70">{formatNumber(leaderboard[0].points)} pts</div>
                  <div className="w-16 h-20 bg-yellow-500/20 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center mb-2">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-white">{leaderboard[2].user_name}</div>
                  <div className="text-xs text-white/70">{formatNumber(leaderboard[2].points)} pts</div>
                  <div className="w-12 h-12 bg-amber-600/20 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </BrandCard>
      )}

      {/* Full Leaderboard */}
      <BrandCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rankings</h3>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.user_id} className={`flex items-center space-x-4 p-3 rounded-xl transition-colors ${
                entry.user_id === currentUserId ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'
              }`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                  <span className="font-bold text-white">#{entry.rank}</span>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-white">{entry.user_name || 'Unknown User'}</h4>
                  <div className="flex items-center space-x-4 text-xs text-white/70">
                    <span>Level {entry.level || 1}</span>
                    <span>{entry.deals_closed} deals</span>
                    <span>{entry.activities_completed} activities</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{formatNumber(entry.points)}</div>
                  <div className="text-xs text-white/70">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrandCard>
    </div>
  );

  // Badges Tab
  const renderBadges = () => (
    <div className="space-y-6">
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Your Badge Collection</h3>
            <div className="text-sm text-white/70">
              {userBadges.length} badges earned
            </div>
          </div>
        </div>
      </BrandCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userBadges.map((userBadge) => {
          const RarityIcon = getRarityIcon(userBadge.badge.rarity);
          return (
            <BrandCard key={userBadge.id} borderGradient={userBadge.badge.color as any}>
              <div className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${userBadge.badge.color}-500/20 mb-4`}>
                  <RarityIcon className={`w-8 h-8 text-${userBadge.badge.color}-400`} />
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2">{userBadge.badge.name}</h4>
                <p className="text-white/70 text-sm mb-4">{userBadge.badge.description}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <BrandBadge variant={getRarityColor(userBadge.badge.rarity)}>
                    {userBadge.badge.rarity}
                  </BrandBadge>
                  {userBadge.badge.points_reward > 0 && (
                    <BrandBadge variant="green">
                      +{userBadge.badge.points_reward} pts
                    </BrandBadge>
                  )}
                </div>
                
                <div className="text-xs text-white/50">
                  Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                </div>
                
                {userBadge.times_earned > 1 && (
                  <div className="mt-2">
                    <BrandBadge variant="orange">
                      Earned {userBadge.times_earned}x
                    </BrandBadge>
                  </div>
                )}
              </div>
            </BrandCard>
          );
        })}
      </div>

      {userBadges.length === 0 && (
        <BrandCard>
          <div className="p-12 text-center">
            <Award className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Badges Yet</h3>
            <p className="text-white/70 mb-6">Start completing activities to earn your first badges!</p>
            <BrandButton onClick={() => setActiveTab('dashboard')}>
              <Activity className="w-4 h-4 mr-2" />
              View Progress
            </BrandButton>
          </div>
        </BrandCard>
      )}
    </div>
  );

  // Achievements Tab
  const renderAchievements = () => (
    <div className="space-y-6">
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Achievements & Goals</h3>
            <div className="text-sm text-white/70">
              {userAchievements.filter(a => a.is_completed).length} of {userAchievements.length} completed
            </div>
          </div>
        </div>
      </BrandCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userAchievements.map((achievement) => (
          <BrandCard key={achievement.id} borderGradient={achievement.is_completed ? 'green' : getProgressColor(achievement.progress_percentage) as any}>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-${achievement.achievement.color}-500/20`}>
                  <Target className={`w-6 h-6 text-${achievement.achievement.color}-400`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white">{achievement.achievement.title}</h4>
                    <BrandBadge variant={getDifficultyColor(achievement.achievement.difficulty)}>
                      {achievement.achievement.difficulty}
                    </BrandBadge>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-4">{achievement.achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Progress</span>
                      <span className="text-white font-medium">
                        {achievement.current_progress} / {achievement.goal_value}
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-black/20 rounded-full">
                      <div 
                        className={`h-full bg-gradient-to-r from-${achievement.achievement.color}-500 to-${achievement.achievement.color}-400 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(achievement.progress_percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs text-${achievement.achievement.color}-400 font-medium`}>
                        {Math.round(achievement.progress_percentage)}% complete
                      </span>
                      {achievement.achievement.points_reward > 0 && (
                        <BrandBadge variant="yellow">
                          +{achievement.achievement.points_reward} pts
                        </BrandBadge>
                      )}
                    </div>
                  </div>
                  
                  {achievement.is_completed && achievement.completed_at && (
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">
                          Completed {new Date(achievement.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </BrandCard>
        ))}
      </div>
    </div>
  );

  // Team Challenges Tab
  const renderTeamChallenges = () => (
    <div className="space-y-6">
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Team Challenges</h3>
            <BrandButton variant="green">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamChallenges.map((challenge) => (
          <BrandCard key={challenge.id} borderGradient={challenge.color as any}>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-${challenge.color}-500/20`}>
                  <Users className={`w-6 h-6 text-${challenge.color}-400`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2">{challenge.title}</h4>
                  <p className="text-white/70 text-sm mb-4">{challenge.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Progress</span>
                      <span className="text-white font-medium">
                        {challenge.current_progress} / {challenge.goal_value}
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-black/20 rounded-full">
                      <div 
                        className={`h-full bg-gradient-to-r from-${challenge.color}-500 to-${challenge.color}-400 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min((challenge.current_progress / challenge.goal_value) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-white/70">
                        <span>{challenge.participants_count || 0} participants</span>
                        <span>Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                      </div>
                      <BrandBadge variant="green">
                        +{challenge.individual_reward_points} pts
                      </BrandBadge>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <BrandButton variant="secondary" size="sm" className="w-full">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Join Challenge
                    </BrandButton>
                  </div>
                </div>
              </div>
            </div>
          </BrandCard>
        ))}
      </div>

      {teamChallenges.length === 0 && (
        <BrandCard>
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Challenges</h3>
            <p className="text-white/70 mb-6">Create or join team challenges to compete together!</p>
            <BrandButton variant="green">
              <Plus className="w-4 h-4 mr-2" />
              Create First Challenge
            </BrandButton>
          </div>
        </BrandCard>
      )}
    </div>
  );

  // Tab configuration
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { key: 'badges', label: 'Badges', icon: Award },
    { key: 'achievements', label: 'Achievements', icon: Target },
    { key: 'challenges', label: 'Team Challenges', icon: Users }
  ];

  if (isLoading) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Gamification Hub" subtitle="Loading your achievements...">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Gamification Hub"
        subtitle="Compete, achieve, and level up your sales performance"
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </BrandButton>
            <BrandButton variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </BrandButton>
            <BrandButton variant="green">
              <Share className="w-4 h-4 mr-2" />
              Share Progress
            </BrandButton>
          </div>
        }
      >
        {/* Tab Navigation */}
        <BrandCard className="mb-6">
          <div className="p-6">
            <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </BrandCard>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'badges' && renderBadges()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'challenges' && renderTeamChallenges()}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Gamification;
