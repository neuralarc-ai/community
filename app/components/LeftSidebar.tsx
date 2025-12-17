'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Presentation, Video, User, ChevronLeft, ChevronRight } from 'lucide-react';
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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/posts', label: 'Posts', icon: MessageSquare },
    { href: '/workshops', label: 'Workshops', icon: Presentation },
    { href: '/meetings', label: 'Meetings', icon: Video },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const sidebarClasses = cn(
    "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
    {
      "w-64": isOpen && !isMobile,
      "w-16": !isOpen && !isMobile,
      "translate-x-0 w-64 shadow-xl": isOpen && isMobile,
      "-translate-x-full w-64": !isOpen && isMobile,
    }
  );

  const Overlay = () => (
    isMobile && isOpen ? (
      <div 
        className="fixed inset-0 bg-black/50 z-30"
        onClick={onCloseMobile}
        aria-hidden="true"
      />
    ) : null
  );

  return (
    <>
      <Overlay />
      <aside className={sidebarClasses}>
        <div className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onCloseMobile : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={!isOpen && !isMobile ? item.label : undefined}
              >
                <item.icon className={cn("flex-shrink-0", isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-900")} size={20} />
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  !isOpen && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                )}>
                  {item.label}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isOpen && !isMobile && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                    </div>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Footer / Toggle Button (Desktop only) */}
        {!isMobile && (
            <div className="p-3 border-t border-gray-200">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-full flex items-center justify-center hover:bg-gray-100"
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

