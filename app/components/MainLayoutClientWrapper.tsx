'use client';

import { useState, useCallback, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import Header from '@/app/components/Header';
import { useMediaQuery } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MOBILE_HEADER_HEIGHT = '56px'; // h-14
const DESKTOP_HEADER_HEIGHT = '64px'; // h-16

interface MainLayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function MainLayoutClientWrapper({ children }: MainLayoutClientWrapperProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseMobileSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  const currentHeaderHeight = isDesktop ? DESKTOP_HEADER_HEIGHT : MOBILE_HEADER_HEIGHT;

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      {/* Header is always rendered */}
      <Header onMenuClick={handleToggleSidebar} headerHeight={currentHeaderHeight} />
      
      <div className="flex flex-1 overflow-hidden"> {/* Ensure flex-1 for content area, overflow hidden to prevent horizontal scroll */}
        {/* LeftSidebar - Responsive visibility and positioning */}
      <LeftSidebar
        isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          isMobile={!isDesktop}
          onCloseMobile={handleCloseMobileSidebar}
          headerHeight={currentHeaderHeight} // Pass headerHeight to LeftSidebar
        />
        
        {/* Mobile sidebar overlay - only visible on mobile when sidebar is open */}
        {!isDesktop && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" // z-index lower than sidebar, only on mobile
            onClick={handleCloseMobileSidebar}
          ></div>
        )}
        
        {/* Main content area */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8", // Responsive padding, pt will be set by style
            `pt-[${currentHeaderHeight}]`, // Dynamic top padding for fixed header
            "transition-all duration-300 ease-in-out",
            isDesktop && isSidebarOpen ? "lg:ml-64 md:ml-56" : "ml-0" // Adjust ml based on sidebar open state and desktop/tablet/mobile
          )}
        >
          <div className="mx-auto max-w-screen-xl">
        {children}
          </div>
      </main>
      </div>
    </div>
  );
}

