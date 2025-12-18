'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Presentation, Calendar, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
    { href: '/workshops', label: 'Workshops', icon: Presentation, color: 'hover:border-[#27584F]/50 hover:shadow-[0_0_20px_rgba(39,88,79,0.15)] hover:bg-[#27584F]/5', activeColor: 'border-[#27584F]/50 shadow-[0_0_20px_rgba(39,88,79,0.15)] bg-[#27584F]/10' },
    { href: '/meetings', label: 'Meetings', icon: Calendar, color: 'hover:border-[#EFB3AF]/50 hover:shadow-[0_0_20px_rgba(239,179,175,0.15)] hover:bg-[#EFB3AF]/5', activeColor: 'border-[#EFB3AF]/50 shadow-[0_0_20px_rgba(239,179,175,0.15)] bg-[#EFB3AF]/10' },
    { href: '/profile', label: 'Profile', icon: User, color: 'hover:border-[#A6C8D5]/50 hover:shadow-[0_0_20px_rgba(166,200,213,0.15)] hover:bg-[#A6C8D5]/5', activeColor: 'border-[#A6C8D5]/50 shadow-[0_0_20px_rgba(166,200,213,0.15)] bg-[#A6C8D5]/10' },
    { href: '/profile/settings', label: 'Settings', icon: Settings, color: 'hover:border-[#A69CBE]/50 hover:shadow-[0_0_20px_rgba(166,156,190,0.15)] hover:bg-[#A69CBE]/5', activeColor: 'border-[#A69CBE]/50 shadow-[0_0_20px_rgba(166,156,190,0.15)] bg-[#A69CBE]/10' },
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
                  "flex items-center gap-4 w-full transition-all duration-300",
                  isActive ? "text-white" : "text-muted-foreground hover:text-white",
                  // Apply padding, rounding and full color/hover effects to the Link itself when expanded
                  { "px-3 py-2 rounded-xl group": isOpen && !isMobile },
                  (isOpen && !isMobile) && (isActive ? item.activeColor : item.color)
                )}
                title={!isOpen && !isMobile ? item.label : undefined}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 border border-transparent shrink-0",
                  // When collapsed or mobile, apply full color/hover effects to the icon div
                  (!isOpen || isMobile) && (isActive ? item.activeColor : item.color),
                  // When expanded, the icon div should only have border/bg for visual, no hover effect
                  (isOpen && !isMobile) && (isActive 
                    ? item.activeColor.replace(/hover:bg-\S+|shadow-\[.+\]|bg-\S+/g, '') + ' ' + item.activeColor.match(/bg-\S+/)?.[0] || '' // Keep base bg if it exists for active
                    : 'bg-white/5 border-white/5' // Subtle bg for non-active expanded icon
                  )
                )}>
                  <item.icon 
                    size={22} 
                    className={cn(
                      "transition-colors duration-300", 
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-white"
                    )} 
                  />
                </div>
                
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 font-bold tracking-tight font-heading",
                  !isOpen && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto text-sm"
                )}>
                  {item.label}
                </span>
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
