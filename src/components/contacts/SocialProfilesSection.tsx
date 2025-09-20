import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  MessageCircle,
  CheckCircle,
  Globe,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Eye,
  Activity,
  Link2,
  Verify,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { BrandCard, BrandButton, BrandBadge } from '../../contexts/BrandDesignContext';

// Types
interface SocialProfile {
  id: string;
  contact_id: string;
  platform_id: string;
  platform_name: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  profile_url?: string;
  follower_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  account_type: 'personal' | 'business' | 'organization';
  location?: string;
  website_url?: string;
  joined_date?: string;
  last_post_date?: string;
  avg_engagement_rate: number;
  influence_score: number;
  is_private: boolean;
  is_verified_by_us: boolean;
  verification_method?: 'manual' | 'api' | 'oauth';
  verified_at?: string;
  is_active: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  color: string;
}

interface SocialProfilesSectionProps {
  contactId: string;
  isEditable?: boolean;
}

const SocialProfilesSection: React.FC<SocialProfilesSectionProps> = ({
  contactId,
  isEditable = true
}) => {
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState({
    platform_id: '',
    username: '',
    display_name: '',
    bio: '',
    profile_url: '',
    follower_count: 0,
    following_count: 0,
    is_verified: false,
    account_type: 'personal' as const,
    location: '',
    website_url: ''
  });

  // Mock data (replace with actual API calls)
  useEffect(() => {
    loadSocialProfiles();
    loadPlatforms();
  }, [contactId]);

  const loadSocialProfiles = async () => {
    try {
      // Mock social profiles data
      const mockProfiles: SocialProfile[] = [
        {
          id: '1',
          contact_id: contactId,
          platform_id: 'twitter',
          platform_name: 'twitter',
          username: 'johnsmith_ceo',
          display_name: 'John Smith',
          bio: 'CEO at TechCorp | Building the future of B2B SaaS | Investor',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          profile_url: 'https://twitter.com/johnsmith_ceo',
          follower_count: 15420,
          following_count: 892,
          posts_count: 3250,
          is_verified: true,
          account_type: 'business',
          location: 'San Francisco, CA',
          website_url: 'https://techcorp.com',
          joined_date: '2018-03-15',
          last_post_date: '2024-01-15T10:30:00Z',
          avg_engagement_rate: 3.2,
          influence_score: 85,
          is_private: false,
          is_verified_by_us: true,
          verification_method: 'api',
          verified_at: '2024-01-10T14:20:00Z',
          is_active: true,
          last_updated: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          contact_id: contactId,
          platform_id: 'linkedin',
          platform_name: 'linkedin',
          username: 'john-smith-techcorp',
          display_name: 'John Smith',
          bio: 'Chief Executive Officer at TechCorp | Serial Entrepreneur | Angel Investor',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          profile_url: 'https://linkedin.com/in/john-smith-techcorp',
          follower_count: 8750,
          following_count: 1250,
          posts_count: 180,
          is_verified: false,
          account_type: 'business',
          location: 'San Francisco Bay Area',
          website_url: 'https://techcorp.com',
          joined_date: '2016-08-22',
          last_post_date: '2024-01-14T16:45:00Z',
          avg_engagement_rate: 5.8,
          influence_score: 78,
          is_private: false,
          is_verified_by_us: true,
          verification_method: 'oauth',
          verified_at: '2024-01-05T09:15:00Z',
          is_active: true,
          last_updated: '2024-01-14T16:45:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-14T16:45:00Z'
        }
      ];

      setProfiles(mockProfiles);
    } catch (error) {
      console.error('Error loading social profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlatforms = async () => {
    try {
      // Mock platforms data
      const mockPlatforms: SocialPlatform[] = [
        { id: 'twitter', name: 'twitter', display_name: 'Twitter/X', icon: 'MessageCircle', color: '#1DA1F2' },
        { id: 'linkedin', name: 'linkedin', display_name: 'LinkedIn', icon: 'Users', color: '#0077B5' },
        { id: 'facebook', name: 'facebook', display_name: 'Facebook', icon: 'MessageCircle', color: '#1877F2' },
        { id: 'instagram', name: 'instagram', display_name: 'Instagram', icon: 'Camera', color: '#E4405F' }
      ];

      setPlatforms(mockPlatforms);
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'twitter': return MessageCircle;
      case 'linkedin': return Users;
      case 'facebook': return MessageCircle;
      case 'instagram': return MessageCircle;
      default: return Globe;
    }
  };

  const getPlatformColor = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName);
    return platform ? platform.color : '#6B7280';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getInfluenceLevel = (score: number) => {
    if (score >= 90) return { label: 'Thought Leader', color: 'red' };
    if (score >= 75) return { label: 'Influencer', color: 'orange' };
    if (score >= 50) return { label: 'Active User', color: 'blue' };
    if (score >= 25) return { label: 'Regular User', color: 'green' };
    return { label: 'New User', color: 'secondary' };
  };

  const handleAddProfile = async () => {
    try {
      // Mock adding profile (replace with actual API call)
      const profile: SocialProfile = {
        id: `new-${Date.now()}`,
        contact_id: contactId,
        platform_id: newProfile.platform_id,
        platform_name: platforms.find(p => p.id === newProfile.platform_id)?.name || '',
        username: newProfile.username,
        display_name: newProfile.display_name,
        bio: newProfile.bio,
        profile_url: newProfile.profile_url,
        follower_count: newProfile.follower_count,
        following_count: newProfile.following_count,
        posts_count: 0,
        is_verified: newProfile.is_verified,
        account_type: newProfile.account_type,
        location: newProfile.location,
        website_url: newProfile.website_url,
        avg_engagement_rate: 0,
        influence_score: Math.floor(Math.random() * 50) + 25,
        is_private: false,
        is_verified_by_us: false,
        is_active: true,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setProfiles([...profiles, profile]);
      setShowAddProfile(false);
      setNewProfile({
        platform_id: '',
        username: '',
        display_name: '',
        bio: '',
        profile_url: '',
        follower_count: 0,
        following_count: 0,
        is_verified: false,
        account_type: 'personal',
        location: '',
        website_url: ''
      });

      console.log('✅ Social profile added:', profile);
    } catch (error) {
      console.error('Error adding social profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      setProfiles(profiles.filter(p => p.id !== profileId));
      console.log('🗑️ Social profile deleted:', profileId);
    } catch (error) {
      console.error('Error deleting social profile:', error);
    }
  };

  const handleVerifyProfile = async (profileId: string) => {
    try {
      setProfiles(profiles.map(p => 
        p.id === profileId 
          ? { 
              ...p, 
              is_verified_by_us: true, 
              verification_method: 'manual',
              verified_at: new Date().toISOString()
            }
          : p
      ));
      console.log('✅ Profile verified:', profileId);
    } catch (error) {
      console.error('Error verifying profile:', error);
    }
  };

  if (isLoading) {
    return (
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </BrandCard>
    );
  }

  return (
    <BrandCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Social Media Profiles</h3>
          </div>
          
          {isEditable && (
            <BrandButton variant="secondary" size="sm" onClick={() => setShowAddProfile(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Profile
            </BrandButton>
          )}
        </div>

        {/* Add Profile Modal */}
        {showAddProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="blue" className="w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Add Social Profile</h3>
                  <button onClick={() => setShowAddProfile(false)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Platform</label>
                    <select
                      value={newProfile.platform_id}
                      onChange={(e) => setNewProfile({ ...newProfile, platform_id: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Select Platform</option>
                      {platforms.map(platform => (
                        <option key={platform.id} value={platform.id}>
                          {platform.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Username</label>
                    <input
                      type="text"
                      value={newProfile.username}
                      onChange={(e) => setNewProfile({ ...newProfile, username: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Display Name</label>
                    <input
                      type="text"
                      value={newProfile.display_name}
                      onChange={(e) => setNewProfile({ ...newProfile, display_name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Profile URL</label>
                    <input
                      type="url"
                      value={newProfile.profile_url}
                      onChange={(e) => setNewProfile({ ...newProfile, profile_url: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Followers</label>
                    <input
                      type="number"
                      value={newProfile.follower_count}
                      onChange={(e) => setNewProfile({ ...newProfile, follower_count: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Following</label>
                    <input
                      type="number"
                      value={newProfile.following_count}
                      onChange={(e) => setNewProfile({ ...newProfile, following_count: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-white/70 text-sm mb-2">Bio</label>
                    <textarea
                      value={newProfile.bio}
                      onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      rows={3}
                      placeholder="Profile bio..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Account Type</label>
                    <select
                      value={newProfile.account_type}
                      onChange={(e) => setNewProfile({ ...newProfile, account_type: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="personal">Personal</option>
                      <option value="business">Business</option>
                      <option value="organization">Organization</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Location</label>
                    <input
                      type="text"
                      value={newProfile.location}
                      onChange={(e) => setNewProfile({ ...newProfile, location: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={newProfile.is_verified}
                      onChange={(e) => setNewProfile({ ...newProfile, is_verified: e.target.checked })}
                      className="rounded border-white/20 bg-white/10"
                    />
                    <label htmlFor="verified" className="text-white/70 text-sm">Verified Account</label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <BrandButton variant="secondary" onClick={() => setShowAddProfile(false)}>
                      Cancel
                    </BrandButton>
                    <BrandButton 
                      variant="primary" 
                      onClick={handleAddProfile}
                      disabled={!newProfile.platform_id || !newProfile.username}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Add Profile
                    </BrandButton>
                  </div>
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Profiles List */}
        <div className="space-y-4">
          {profiles.map((profile) => {
            const PlatformIcon = getPlatformIcon(profile.platform_name);
            const influenceLevel = getInfluenceLevel(profile.influence_score);
            
            return (
              <div 
                key={profile.id} 
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-start space-x-4">
                  {/* Platform Icon */}
                  <div 
                    className="p-3 rounded-xl flex-shrink-0" 
                    style={{ backgroundColor: `${getPlatformColor(profile.platform_name)}20` }}
                  >
                    <PlatformIcon 
                      className="w-6 h-6" 
                      style={{ color: getPlatformColor(profile.platform_name) }} 
                    />
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-white truncate">
                        {profile.display_name || profile.username}
                      </h4>
                      <span className="text-white/70">@{profile.username}</span>
                      {profile.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                      {profile.is_verified_by_us && (
                        <BrandBadge variant="green">
                          <Verify className="w-3 h-3 mr-1" />
                          Verified
                        </BrandBadge>
                      )}
                    </div>
                    
                    {profile.bio && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{profile.bio}</p>
                    )}
                    
                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{formatNumber(profile.follower_count)}</div>
                        <div className="text-xs text-white/50">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{formatNumber(profile.following_count)}</div>
                        <div className="text-xs text-white/50">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{profile.avg_engagement_rate}%</div>
                        <div className="text-xs text-white/50">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{profile.influence_score}/100</div>
                        <div className="text-xs text-white/50">Influence</div>
                      </div>
                    </div>
                    
                    {/* Profile Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <BrandBadge variant={influenceLevel.color as any}>
                        <Star className="w-3 h-3 mr-1" />
                        {influenceLevel.label}
                      </BrandBadge>
                      
                      <BrandBadge variant="blue">
                        {profile.account_type}
                      </BrandBadge>
                      
                      {profile.location && (
                        <BrandBadge variant="secondary">
                          <MapPin className="w-3 h-3 mr-1" />
                          {profile.location}
                        </BrandBadge>
                      )}
                      
                      {profile.last_post_date && (
                        <BrandBadge variant="green">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </BrandBadge>
                      )}
                    </div>
                    
                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-xs text-white/50">
                      {profile.joined_date && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {new Date(profile.joined_date).getFullYear()}</span>
                        </span>
                      )}
                      {profile.website_url && (
                        <span className="flex items-center space-x-1">
                          <Link2 className="w-3 h-3" />
                          <span>Website</span>
                        </span>
                      )}
                      <span>Updated {new Date(profile.last_updated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <BrandButton size="sm" variant="secondary" onClick={() => window.open(profile.profile_url, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </BrandButton>
                    
                    {isEditable && (
                      <>
                        {!profile.is_verified_by_us && (
                          <BrandButton size="sm" variant="green" onClick={() => handleVerifyProfile(profile.id)}>
                            <CheckCircle className="w-4 h-4" />
                          </BrandButton>
                        )}
                        
                        <BrandButton size="sm" variant="blue" onClick={() => setEditingProfile(profile.id)}>
                          <Edit className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton 
                          size="sm" 
                          variant="red" 
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </BrandButton>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Social Profiles</h3>
            <p className="text-white/70 mb-6">
              Add social media profiles to get a complete view of this contact's online presence.
            </p>
            {isEditable && (
              <BrandButton variant="primary" onClick={() => setShowAddProfile(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Profile
              </BrandButton>
            )}
          </div>
        )}
      </div>
    </BrandCard>
  );
};

export default SocialProfilesSection;


