'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavbarProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

export default function TopNavbar({ onSidebarToggle, isSidebarOpen }: TopNavbarProps) {
  return (
    <nav className="bg-card/40 backdrop-blur-sm border-b border-white/5 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSidebarToggle}
        className="lg:hidden mr-4 text-white"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>
      {/* Add other navbar elements here like search, user menu, etc. */}
    </nav>
  );
}

