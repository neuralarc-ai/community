import Avatar from '@/app/components/Avatar';
import { Card } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';
import { Crown, BadgeCheck } from 'lucide-react';

interface LeaderboardRowProps {
  rank: number;
  username: string;
  avatar: string;
  flux: number;
  won: number;
  trades: number;
  winRate: string;
  volume: number;
  activity: string; // Added activity prop
  highlight?: boolean;
}

export default function LeaderboardRow({
  rank,
  username,
  avatar,
  flux,
  won,
  trades,
  winRate,
  volume,
  highlight,
}: LeaderboardRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-7 items-center gap-4 px-8 py-4 hover:bg-white/[0.04] transition-all duration-200 group",
        highlight ? "bg-white/5" : ""
      )}
    >
      <div className={cn("col-span-1 font-bold", highlight ? "text-purple-400" : "text-muted-foreground")}>
        {rank === 0 ? "UNRANKED" : rank}
      </div>
      <div className="col-span-2 flex items-center gap-3">
        <Avatar src={avatar} alt={username} size={32} className="ring-1 ring-white/10 group-hover:ring-purple-400/50 transition-all" />
        <p className={cn("font-semibold text-white group-hover:text-purple-200 transition-colors", highlight ? "text-purple-200" : "")}>{username}</p>
      </div>
      <div className="col-span-1 text-right flex items-center justify-end gap-1">
        <span className="font-bold text-white group-hover:text-purple-300 transition-colors">{won.toFixed(2)}</span>
        <span className="text-sm text-muted-foreground"></span>
      </div>
      <div className="col-span-1 text-right">
        <span className="text-muted-foreground group-hover:text-white/60 transition-colors">{trades}</span>
      </div>
      <div className="col-span-1 text-right">
        <span className="text-muted-foreground group-hover:text-white/60 transition-colors">{winRate}</span>
      </div>
      <div className="col-span-1 text-right flex items-center justify-end gap-1">
        <span className="font-bold text-white group-hover:text-purple-300 transition-colors">{volume.toFixed(2)}</span>
        <span className="text-sm text-muted-foreground"></span>
      </div>
    </div>
  );
}

