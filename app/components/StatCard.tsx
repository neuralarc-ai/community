import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: string;
  period?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
}

export default function StatCard({
  title,
  value,
  unit,
  change,
  period,
  icon: Icon,
  iconBgColor,
  iconTextColor,
}: StatCardProps) {
  const isPositiveChange = change?.includes('+');

  return (
    <Card className="bg-card/40 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg border border-white/5 group-hover:border-white/20 transition-all duration-300", iconBgColor)}>
          <Icon size={18} className={cn("group-hover:text-white transition-colors", iconTextColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-4xl font-heading font-bold text-white tracking-tighter group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}{unit}
          </span>
          {change && period && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full border border-white/5 transition-all duration-300",
                  isPositiveChange ? 'text-green-400 bg-green-500/10 group-hover:bg-green-500/20 group-hover:border-green-500/20' : 'text-red-400 bg-red-500/10 group-hover:bg-red-500/20 group-hover:border-red-500/20'
                )}
              >
                {change}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-white/60 transition-colors">
                {period}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

