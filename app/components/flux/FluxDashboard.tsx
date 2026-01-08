import { createClient } from "@/app/lib/supabaseClient";
import { CircleStar, MessageSquareText, ScrollText, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  total_flux: number;
  posts_count: number;
  comments_count: number;
  conclaves_attended: number;
  is_archived?: boolean;
}

interface FluxLog {
  id: string;
  amount: number;
  action_type: "POST_CREATE" | "COMMENT_CREATE" | "CONCLAVE_JOIN";
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  }[];
}

const FluxDashboard = () => {
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<Profile | null>(
    null
  );
  const [recentActivity, setRecentActivity] = useState<FluxLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        .from("profiles")
        .select(
          "id, full_name, avatar_url, total_flux, posts_count, comments_count, conclaves_attended"
        )
        .order("total_flux", { ascending: false })
        .limit(50);

      if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);
      } else {
        setLeaderboard(leaderboardData || []);
      }

      // Fetch Current User Stats
      const { data: userStatsData, error: userStatsError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, avatar_url, total_flux, posts_count, comments_count, conclaves_attended"
        )
        .eq("id", user.id)
        .single();

      if (userStatsError) {
        console.error("Error fetching user stats:", userStatsError);
      } else {
        setCurrentUserStats(userStatsData);
      }

      // Fetch Recent Activity
      const { data: activityData, error: activityError } = await supabase
        .from("flux_logs")
        .select(
          `
          id,
          amount,
          action_type,
          created_at,
          profiles!inner (
            full_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (activityError) {
        console.error("Error fetching recent activity:", activityError);
      } else {
        setRecentActivity(activityData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Calculate current user rank
  const currentUserRank = leaderboard.findIndex((p) => p.id === user?.id) + 1;

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

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `less than a minute ago`;
  };

  const statsData = [
    {
      label: "Total Flux",
      value: currentUserStats?.total_flux || 0,
      valueColor: "text-[#e6b31c]",
      icon: Zap,
    },
    {
      label: "Posts Created",
      value: currentUserStats?.posts_count || 0,
      valueColor: "text-foreground",
      icon: ScrollText,
    },
    {
      label: "Comments Added",
      value: currentUserStats?.comments_count || 0,
      valueColor: "text-foreground",
      icon: MessageSquareText,
    },
    {
      label: "Your Rank",
      value: currentUserRank > 0 ? `#${currentUserRank}` : "N/A",
      valueColor: "text-foreground",
      icon: CircleStar,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen text-foreground p-8 flex items-center justify-center">
        Loading Flux Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground p-2 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
          Flux Dashboard
        </h1>
        <p className="text-muted-foreground font-sans">
          Track your community impact and see your rank
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between w-full bg-background rounded-xl p-3 md:p-6 border border-foreground/10 hover:border-pink-400 shadow-[0_0_20px_rgba(255,182,93,0.1)] hover:shadow-[0_0_20px_rgba(255,182,193,0.3)] hover:scale-[1.02] ease-in-out transition-all duration-300 glare-effect"
          >
            <div className="w-full flex flex-col items-start">
              <h3 className="text-muted-foreground text-sm mb-2">
                {stat.label}
              </h3>
              <p className={`text-3xl font-bold ${stat.valueColor}`}>
                {stat.value}
              </p>
            </div>
            <div className="flex items-center p-2 md:p-3 rounded-full bg-foreground/10">
              <stat.icon
                className={`${stat.valueColor} `}
                size={32}
                strokeWidth={1.5}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Section B: Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leaderboard Table */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-lg border border-foreground/10">
          <h2 className="text-2xl font-bold mb-6">Flux Leaderboard</h2>
          {/* Placeholder for Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-center">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground">
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 flex items-center justify-center">
                    <Zap size={16} className="inline mr-1 text-[#e6b31c]" />{" "}
                    Total Flux
                  </th>
                  <th className="py-3 px-4 text-center">Posts</th>
                  <th className="py-3 px-4 text-center">Comments</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((profile, index) => (
                  <tr
                    key={profile.id}
                    className={`border-b border-[#A6C8D5]/20 last:border-b-0 transition-all duration-300 group ${profile.id === user?.id ? "bg-card/60 border-[#A6C8D5]/30 shadow-[0_0_30px_rgba(166,200,213,0.1)]" : "hover:bg-card/60 hover:border-pink-400 hover:shadow-[0_0_30px_rgba(255,182,193,0.1)]"}`}
                  >
                    <td className="py-3 px-4 text-center text-foreground group-hover:text-foreground/80 transition-colors">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 flex items-center text-left">
                      <Image
                        src={profile.avatar_url || "/default-avatar.jpg"} // Fallback for avatar
                        alt={profile.full_name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full mr-3 ring-1 ring-foreground/10 group-hover:ring-pink-400/50 transition-all"
                      />
                      <span className="font-medium text-foreground group-hover:text-pink-400 transition-colors">
                        {profile.full_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-foreground group-hover:text-pink-400 transition-colors">
                      {profile.total_flux}
                    </td>
                    <td className="py-3 px-4 text-center text-foreground group-hover:text-pink-400 transition-colors">
                      {profile.posts_count}
                    </td>
                    <td className="py-3 px-4 text-center text-foreground group-hover:text-pink-400 transition-colors">
                      {profile.comments_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-1 bg-card rounded-xl p-6 shadow-lg border border-foreground/10">
          <h2 className="text-2xl font-bold mb-6">What is Flux?</h2>
          <div className="space-y-2 md:space-y-6">
            <p>
              Flux (⚡) is the definitive metric of your contribution to The
              Sphere. It tracks how much value you provide to the community. The
              more you help others grow, the higher your Flux potential rises.
            </p>

            <h3>Ways to Earn</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="font-semibold w-1/3">Start a Discussion</span>
                <span className="w-1/3 text-[#e6b31c]">+10 ⚡</span>
                <span className="text-muted-foreground w-1/3">
                  For initiating new ideas and knowledge sharing.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold w-1/3">Post a Comment</span>
                <span className="w-1/3 text-[#e6b31c]">+5 ⚡</span>
                <span className="text-muted-foreground w-1/3">
                  For adding perspective and helping peers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold w-1/3">Join a Conclave</span>
                <span className="w-1/3 text-[#e6b31c]">+20 ⚡</span>
                <span className="text-muted-foreground w-1/3">
                  For showing up, learning, and participating live.
                </span>
              </li>
            </ul>

            <h3>Ascend the Hierarchy</h3>
            <p>
              Accumulating Flux unlocks higher tiers on the global leaderboard.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <span className="font-semibold">Top 10%:</span> Earn the
                "Architect" Status.
              </li>
              <li>
                <span className="font-semibold">Top 1%:</span> Earn the
                "Luminary" Status (and exclusive access to private Conclaves).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluxDashboard;
