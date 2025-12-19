import React, { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabaseClient';
import { Zap, MessageSquare, Users, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  total_flux: number;
  posts_count: number;
  comments_count: number;
  conclaves_attended: number;
}

interface FluxLog {
  id: string;
  amount: number;
  action_type: 'POST_CREATE' | 'COMMENT_CREATE' | 'CONCLAVE_JOIN';
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  }[];
}

const FluxDashboard = () => {
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<Profile | null>(null);
  const [recentActivity, setRecentActivity] = useState<FluxLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!user) return;

      // Fetch Leaderboard
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, total_flux, posts_count, comments_count, conclaves_attended')
        .order('total_flux', { ascending: false })
        .limit(50);

      if (leaderboardError) {
        console.error('Error fetching leaderboard:', leaderboardError);
      } else {
        setLeaderboard(leaderboardData || []);
      }

      // Fetch Current User Stats
      const { data: userStatsData, error: userStatsError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, total_flux, posts_count, comments_count, conclaves_attended')
        .eq('id', user.id)
        .single();

      if (userStatsError) {
        console.error('Error fetching user stats:', userStatsError);
      } else {
        setCurrentUserStats(userStatsData);
      }

      // Fetch Recent Activity
      const { data: activityData, error: activityError } = await supabase
        .from('flux_logs')
        .select(`
          id,
          amount,
          action_type,
          created_at,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) {
        console.error('Error fetching recent activity:', activityError);
      } else {
        setRecentActivity(activityData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Calculate current user rank
  const currentUserRank = leaderboard.findIndex(p => p.id === user?.id) + 1;

  // Utility function for relative time
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `less than a minute ago`;
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-zinc-100 p-8 flex items-center justify-center">Loading Flux Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8">
      <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 rounded-full bg-white/5 hover:bg-yellow-500/20 text-muted-foreground hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Flux Dashboard</h1>
              <p className="text-muted-foreground font-sans">Track your community impact and see your rank</p>
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-700">
          <h3 className="text-zinc-400 text-sm mb-2">Total Flux</h3>
          <p className="text-3xl font-bold text-[#e6b31c]">{currentUserStats?.total_flux || 0}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-700">
          <h3 className="text-zinc-400 text-sm mb-2">Posts Created</h3>
          <p className="text-3xl font-bold">{currentUserStats?.posts_count || 0}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-700">
          <h3 className="text-zinc-400 text-sm mb-2">Comments Added</h3>
          <p className="text-3xl font-bold">{currentUserStats?.comments_count || 0}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-700">
          <h3 className="text-zinc-400 text-sm mb-2">Your Rank</h3>
          <p className="text-3xl font-bold">{currentUserRank > 0 ? `#${currentUserRank}` : 'N/A'}</p>
        </div>
      </div>

      {/* Section B: Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leaderboard Table */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-700">
          <h2 className="text-2xl font-bold mb-6">Flux Leaderboard</h2>
          {/* Placeholder for Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4 flex items-center"><Zap size={16} className="inline mr-1 text-[#e6b31c]" /> Total Flux</th>
                  <th className="py-3 px-4">Posts</th>
                  <th className="py-3 px-4">Comments</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((profile, index) => (
                  <tr key={profile.id} className={`border-b border-zinc-800 last:border-b-0 ${profile.id === user?.id ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 flex items-center">
                      <Image
                        src={profile.avatar_url || '/default-avatar.png'} // Fallback for avatar
                        alt={profile.full_name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full mr-3"
                      />
                      <span>{profile.full_name}</span>
                    </td>
                    <td className="py-3 px-4">{profile.total_flux}</td>
                    <td className="py-3 px-4">{profile.posts_count}</td>
                    <td className="py-3 px-4">{profile.comments_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-1 bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-700">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <ul className="space-y-4">
            {recentActivity.map(activity => (
              <li key={activity.id} className="flex items-start">
                <Image
                  src={activity.profiles?.[0]?.avatar_url || '/default-avatar.png'}
                  alt={activity.profiles?.[0]?.full_name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full mr-3 flex-shrink-0"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{activity.profiles?.[0]?.full_name || 'Unknown User'}</span>
                    {' '}
                    {activity.action_type === 'POST_CREATE' && 'posted a discussion'}
                    {activity.action_type === 'COMMENT_CREATE' && 'added a comment'}
                    {activity.action_type === 'CONCLAVE_JOIN' && 'joined a conclave'}
                    {' '}
                    <span className="text-[#e6b31c]">+<Zap size={12} className="inline" />{activity.amount}</span>
                  </p>
                  <p className="text-xs text-zinc-500">{timeAgo(activity.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FluxDashboard;