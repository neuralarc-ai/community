import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import LeaderboardRow from './LeaderboardRow';
import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  flux: number;
  won: number;
  trades: number;
  winRate: string;
  volume: number;
  activity: string;
  isCurrentUser?: boolean;
}

interface FluxLeaderboardProps {
  title: string;
}

export default function FluxLeaderboard({ title }: FluxLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();

      const fetchedLeaderboard: LeaderboardEntry[] = data.leaderboard.map((entry: any) => ({
        id: entry.id,
        rank: entry.rank,
        username: entry.username,
        avatar: entry.avatar,
        flux: entry.flux ?? 0,
        won: entry.won ?? 0,
        trades: entry.trades ?? 0,
        winRate: entry.winRate || "0.00%",
        volume: entry.volume ?? 0,
        activity: entry.activity || "", // Ensure activity is mapped
        isCurrentUser: entry.isCurrentUser || false,
      }));

      const currentUserEntry = fetchedLeaderboard.find(entry => entry.isCurrentUser);

      setLeaderboard(fetchedLeaderboard.filter(entry => !entry.isCurrentUser));
      setCurrentUserRank(currentUserEntry || null);

    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-white/5">
      <CardHeader className="px-8 pt-8 pb-4 border-b border-white/5">
        <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full text-left border-collapse">
          {/* Table Header */}
          <div className="grid grid-cols-7 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-8 py-4 border-b border-white/5">
            <div className="col-span-1">Rank</div>
            <div className="col-span-2">User</div>
            <div className="col-span-1 text-right">Won</div>
            <div className="col-span-1 text-right">Trades</div>
            <div className="col-span-1 text-right">Win Rate</div>
            <div className="col-span-1 text-right">Volume</div>
          </div>

          {/* Leaderboard Rows */}
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry) => (
              <LeaderboardRow key={entry.id} {...entry} />
            ))}
            {currentUserRank && ( // Render current user's rank if available
              <LeaderboardRow key={currentUserRank.id} {...currentUserRank} highlight={true} />
            )}
            {!currentUserRank && ( // Render unranked row if current user is not in leaderboard
                <LeaderboardRow 
                  rank={0} 
                  username="You" 
                  avatar="" 
                  flux={0} 
                  activity="Unranked" 
                  won={0} 
                  trades={0} 
                  winRate="0.00%" 
                  volume={0} 
                  highlight={true} 
                />
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-4 text-center border-t border-white/5">
        <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:border-blue-500/30">
          View All
        </button>
      </div>
    </Card>
  );
}
