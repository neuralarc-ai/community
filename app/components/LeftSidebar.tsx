'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FloatingDock } from '@/components/ui/floating-dock';
import { LayoutDashboard as DashboardIcon, MessageSquare, Presentation, Calendar, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onCloseMobile: () => void;
}

export default function LeftSidebar({ isOpen, onToggle, isMobile, onCloseMobile }: LeftSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/posts', label: 'Posts', icon: MessageSquare },
    { href: '/workshops', label: 'Conclave', icon: Presentation },
    { href: '/meetings', label: 'Meetings', icon: Calendar },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/profile/settings', label: 'Settings', icon: Settings },
  ];

  const links = navItems.map(item => {
    const isActive = pathname.startsWith(item.href);
    return {
      title: item.label,
      href: item.href,
      icon: <item.icon className={cn("h-full w-full", isActive ? "text-white" : "text-neutral-500 dark:text-neutral-300")} />,
    };
  });

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <div className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out flex flex-col bg-[#0F0F0F] border-r border-white/5 backdrop-blur-xl",
        {
          "translate-x-0 w-20": isOpen && !isMobile,
          "-translate-x-full w-20": !isOpen && !isMobile,
          "translate-x-0 w-20 shadow-2xl shadow-black/50": isOpen && isMobile,
          "-translate-x-full w-20": !isOpen && isMobile,
        }
      )}>
        <FloatingDock
          mobileClassName="translate-y-20"
          desktopClassName="h-full w-full flex flex-col items-center py-8 gap-4 bg-[#0F0F0F]"
          items={links}
        />
      </div>
    </>
  );
}

