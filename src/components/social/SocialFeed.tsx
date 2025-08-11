import React, { useState, useEffect } from 'react';
import { SocialMention } from '../../types/social';
import { SocialService } from '../../services/socialService';

interface SocialFeedProps {
  contactId?: string;
  author?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  contactId,
  author,
  limit = 5,
  showHeader = true,
  className = ''
}) => {
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMentions();
  }, [contactId, author, limit]);

  const fetchMentions = async () => {
    try {
      setLoading(true);
      setError(null);

      let mentionsData: SocialMention[] = [];

      if (contactId) {
        mentionsData = await SocialService.getContactMentions(contactId, limit);
      } else if (author) {
        mentionsData = await SocialService.getMentionsByAuthor(author, limit);
      } else {
        mentionsData = await SocialService.getRecentMentions(24, limit);
      }

      setMentions(mentionsData);
    } catch (err) {
      setError('Failed to load social mentions');
      console.error('Error fetching social mentions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'twitter':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={`bg-white/10 dark:bg-secondary-800/80 rounded-lg border border-gray-700 backdrop-blur-md ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Social Feed</h3>
          </div>
        )}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (window && window.localStorage && window.localStorage.getItem('demoMode') === 'true')) {
    return (
      <div className={`bg-white/10 dark:bg-secondary-800/80 rounded-lg border border-gray-700 backdrop-blur-md ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Social Feed</h3>
          </div>
        )}
        <div className="p-6 text-center">
          <div className="text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No social mentions yet.<br/>Connect Supabase for live data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (mentions.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Feed</h3>
          </div>
        )}
        <div className="p-6 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No social mentions found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Feed</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {mentions.length} mention{mentions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {mentions.map((mention) => (
          <div key={mention.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {getPlatformIcon(mention.source)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    @{mention.author}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(mention.mention_time)}
                  </span>
                  {mention.sentiment && (
                    <span className={`text-xs ${getSentimentColor(mention.sentiment)}`}>
                      {mention.sentiment}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {truncateContent(mention.content)}
                </p>
                
                {mention.url && (
                  <div className="flex items-center space-x-2">
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View on {mention.source}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 