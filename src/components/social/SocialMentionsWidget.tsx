import React, { useState, useEffect } from 'react';
import { SocialMention } from '../../types/social';
import { SocialService } from '../../services/socialService';

interface SocialMentionsWidgetProps {
  className?: string;
}

export const SocialMentionsWidget: React.FC<SocialMentionsWidgetProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentMentions, setRecentMentions] = useState<SocialMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, mentionsData] = await Promise.all([
        SocialService.getMentionStats(),
        SocialService.getRecentMentions(24, 5)
      ]);

      setStats(statsData);
      setRecentMentions(mentionsData);
    } catch (err) {
      setError('Failed to load social mentions data');
      console.error('Error fetching social mentions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'twitter':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={`bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 ${className}`}>
        <div className="px-4 lg:px-6 py-4 border-b border-[#23233a]/30">
          <h3 className="text-lg font-semibold text-white">Social Mentions</h3>
        </div>
        <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-[#23233a]/50 rounded mb-2"></div>
                  <div className="h-4 bg-[#23233a]/50 rounded"></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-[#23233a]/50 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#23233a]/50 rounded w-3/4"></div>
                    <div className="h-3 bg-[#23233a]/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 ${className}`}>
        <div className="px-4 lg:px-6 py-4 border-b border-[#23233a]/30">
          <h3 className="text-lg font-semibold text-white">Social Mentions</h3>
        </div>
        <div className="p-4 lg:p-6 text-center">
          <div className="text-[#b0b0d0]">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No social mentions yet.<br/>Connect Supabase for live data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 ${className}`}>
      <div className="px-4 lg:px-6 py-4 border-b border-[#23233a]/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Social Mentions</h3>
          <span className="text-sm text-[#b0b0d0]">
            Last 24 hours
          </span>
        </div>
      </div>
      
      <div className="p-4 lg:p-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.recent24h}
              </div>
              <div className="text-sm text-[#b0b0d0]">
                Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.recent7d}
              </div>
              <div className="text-sm text-[#b0b0d0]">
                This Week
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.total}
              </div>
              <div className="text-sm text-[#b0b0d0]">
                Total
              </div>
            </div>
          </div>
        )}

        {/* Platform Breakdown */}
        {stats?.bySource && Object.keys(stats.bySource).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">By Platform</h4>
            <div className="space-y-2">
              {Object.entries(stats.bySource).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform)}
                    <span className="text-sm text-[#b0b0d0] capitalize">
                      {platform}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Mentions */}
        {recentMentions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {recentMentions.map((mention) => (
                <div key={mention.id} className="flex items-start space-x-3 p-3 bg-[#23233a]/30 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#23233a]/50 rounded-full flex items-center justify-center">
                      {getPlatformIcon(mention.source)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-white">
                        @{mention.author}
                      </span>
                      <span className="text-xs text-[#b0b0d0]">
                        {formatDate(mention.mention_time)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#b0b0d0] leading-relaxed">
                      {truncateContent(mention.content)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMentions.length === 0 && (
          <div className="text-center py-4">
            <div className="text-gray-500 dark:text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No recent mentions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 