'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Presentation, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onCloseMobile: () => void;
}

export default function LeftSidebar({ isOpen, onToggle, isMobile, onCloseMobile }: LeftSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:bg-orange-500/5', activeColor: 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] bg-orange-500/10' },
    { href: '/posts', label: 'Posts', icon: MessageSquare, color: 'hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:bg-yellow-500/5', activeColor: 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-yellow-500/10' },
    { href: '/workshops', label: 'Workshops', icon: Presentation, color: 'hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:bg-green-500/5', activeColor: 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)] bg-green-500/10' },
    { href: '/meetings', label: 'Meetings', icon: Calendar, color: 'hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:bg-pink-500/5', activeColor: 'border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)] bg-pink-500/10' },
    { href: '/profile', label: 'Profile', icon: User, color: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:bg-red-500/5', activeColor: 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-red-500/10' },
  ];

  const sidebarClasses = cn(
    "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-[#0F0F0F] border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col backdrop-blur-xl",
    {
      "w-64": isOpen && !isMobile,
      "w-20": !isOpen && !isMobile,
      "translate-x-0 w-64 shadow-2xl shadow-black/50": isOpen && isMobile,
      "-translate-x-full w-64": !isOpen && isMobile,
    }
  );

  const Overlay = () => (
    isMobile && isOpen ? (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        onClick={onCloseMobile}
        aria-hidden="true"
      />
    ) : null
  );

  return (
    <>
      <Overlay />
      <aside className={sidebarClasses}>
        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onCloseMobile : undefined}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden border border-transparent",
                  isActive 
                    ? cn("bg-white/10 text-white", item.activeColor)
                    : cn("text-muted-foreground hover:bg-white/5 hover:text-white", item.color)
                )}
                title={!isOpen && !isMobile ? item.label : undefined}
              >
                <item.icon className={cn("flex-shrink-0 transition-colors duration-300", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} size={22} />
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 font-medium",
                  !isOpen && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Footer / Toggle Button (Desktop only) */}
        {!isMobile && (
            <div className="p-4 border-t border-white/5">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-full flex items-center justify-center hover:bg-white/5 text-muted-foreground hover:text-white transition-all duration-300"
                    onClick={onToggle}
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </Button>
            </div>
        )}
      </aside>
    </>
  );
}
