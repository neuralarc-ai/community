'use client';

import { useState, useCallback, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import TopNavbar from './TopNavbar'; // Assuming you have a TopNavbar component

interface MainLayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function MainLayoutClientWrapper({ children }: MainLayoutClientWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebarMobile = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex min-h-screen">
      <LeftSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        isCollapsible={true} // Assuming it's collapsible
        onCloseMobile={closeSidebarMobile}
      />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen && isMobile ? 'ml-0' : 'lg:ml-[12rem]'}`}>
        {/* Assuming a TopNavbar exists and needs to adapt to the sidebar */}
        <TopNavbar onSidebarToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} /> 
        {children}
      </main>
    </div>
  );
}

