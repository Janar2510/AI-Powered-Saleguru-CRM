import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Badge } from '../ui/Badge';
import { User as UserIcon, Trophy } from 'lucide-react';

interface Leader {
  id: string;
  first_name: string;
  last_name: string;
  points: number;
  badges: string[];
}

function getInitials(firstName = '', lastName = '') {
  const name = `${firstName} ${lastName}`.trim();
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const currentUserId = 'demo-user-id'; // Demo user ID

  useEffect(() => {
    // Fetch top 5 users by points - using user_profiles table
    supabase
      .from('user_profiles')
      .select('id, first_name, last_name, points, badges')
      .order('points', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (!error && data) setLeaders(data);
      });

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:user_profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, payload => {
        if (payload.new.points !== payload.old.points) {
          supabase.from('user_profiles').select('id, first_name, last_name, points, badges').order('points', { ascending: false }).limit(5)
            .then(({ data }) => {
              if (data) setLeaders(data);
            });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); }
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Top Performers
      </h3>
      <div className="flex-1">
        <ol className="space-y-2">
          {leaders.map((user, idx) => {
            const isCurrent = user.id === currentUserId;
            return (
              <li
                key={user.id}
                className={`flex items-center gap-3 text-sm lg:text-base rounded-lg px-2 py-1 transition-all ${isCurrent ? 'bg-[#a259ff]/20 ring-1 ring-[#a259ff]/50' : ''}`}
              >
                <span className="font-mono text-[#b0b0d0] text-xs lg:text-sm">#{idx + 1}</span>
                {/* Avatar/Initials */}
                <span className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center bg-[#a259ff]/30 text-white font-bold text-sm lg:text-base overflow-hidden">
                  {user.first_name || user.last_name ? (
                    getInitials(user.first_name, user.last_name)
                  ) : (
                    <UserIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  )}
                </span>
                <span className="font-semibold text-white text-sm lg:text-base truncate">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Unknown User'}
                </span>
                <span className="ml-auto text-[#a259ff] font-bold text-sm lg:text-base">{user.points} pts</span>
                {/* Show badges if present */}
                {user.badges && Array.isArray(user.badges) && user.badges.length > 0 && (
                  <span className="ml-2 flex gap-1">
                    {user.badges.map((badge, i) => (
                      <Badge key={i} variant="warning" size="sm" className="flex items-center">
                        🏅
                      </Badge>
                    ))}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default Leaderboard; 