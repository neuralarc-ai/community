'use client'

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import StatCard from '@/app/components/StatCard';
import FluxLeaderboard from '@/app/components/FluxLeaderboard';
import ActivityItem from '@/app/components/ActivityItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Bolt, MessageSquare, Plus, Gauge, LucideIcon, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Stat {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  change?: string;
  period?: string;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  flux: number;
  activity: string;
}

interface RecentActivityEntry {
  id: string;
  username: string;
  avatar: string;
  action: string;
  fluxGained: number;
  timestamp: string;
}

function FluxDashboardContent() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityEntry[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('7-days'); // Default to 7 days

  useEffect(() => {
    fetchDashboardData();
    fetchLeaderboardAndActivityData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`/api/dashboard?timeFilter=${timeFilter}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLeaderboardAndActivityData = async () => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(`/api/leaderboard?timeFilter=${timeFilter}`);
      const data = await response.json();
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch leaderboard and activity data:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
  };

  const statIcons: { [key: string]: { icon: LucideIcon; bgColor: string; textColor: string } } = {
    'total-flux': { icon: Bolt, bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
    'posts-created': { icon: Plus, bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    'comments-added': { icon: MessageSquare, bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
    'community-rank': { icon: Gauge, bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400' },
  };

  return (
    <div className="container py-8 space-y-12 px-6 mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-muted-foreground hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Flux Leaderboard</h1>
          <p className="text-lg text-muted-foreground">Track your community impact</p>
          </div>
        </div>
        
        {/* Time Filter */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md gap-2">
          <button
            onClick={() => handleTimeFilterChange('7-days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              timeFilter === '7-days' 
                ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(156,39,176,0.3)]' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleTimeFilterChange('30-days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              timeFilter === '30-days' 
                ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(156,39,176,0.3)]' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/40 backdrop-blur-md border-white/10 h-40"></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const iconProps = statIcons[stat.id];
            return (
              <StatCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                unit={stat.unit}
                change={stat.change}
                period={stat.period}
                icon={iconProps.icon}
                iconBgColor={iconProps.bgColor}
                iconTextColor={iconProps.textColor}
              />
            );
          })}
        </div>
      )}

      {/* Leaderboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FluxLeaderboard title="Top Contributors" />
        </div>
        <Card className="bg-card/30 backdrop-blur-sm border-white/5 overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
            <CardTitle className="text-xl font-semibold text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingLeaderboard ? (
              <div className="divide-y divide-white/5 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 p-6"></div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FluxDashboardPage() {
  return (
    <Suspense fallback={<div>Loading Flux Dashboard...</div>}>
      <FluxDashboardContent />
    </Suspense>
  );
}
