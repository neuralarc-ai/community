import Avatar from '@/app/components/Avatar';
import { Card } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  username: string;
  avatar: string;
  action: string;
  fluxGained: number;
  timestamp: string;
}

export default function ActivityItem({
  username,
  avatar,
  action,
  fluxGained,
  timestamp,
}: ActivityItemProps) {
  return (
    <Card className="flex items-center gap-4 p-4 bg-card/30 backdrop-blur-sm border-white/5 hover:border-white/20 transition-all duration-300 group">
      <Avatar src={avatar} alt={username} size={40} className="w-10 h-10 ring-1 ring-white/10 group-hover:ring-green-400/50 transition-all" />
      <div className="flex-1">
        <p className="font-semibold text-white group-hover:text-green-200 transition-colors">
          <span className="text-purple-400">{username}</span> {action}
        </p>
        <p className="text-xs text-muted-foreground group-hover:text-white/60 transition-colors">{timestamp}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-bold text-green-400 group-hover:text-green-300 transition-colors">+{fluxGained}</span>
        <span className="text-sm text-muted-foreground">⚡</span>
      </div>
    </Card>
  );
}

