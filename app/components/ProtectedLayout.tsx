'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
        setIsMobileMenuOpen(false); // Reset mobile menu when switching to desktop
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header onMenuClick={toggleSidebar} />
      
      <div className="flex flex-1 pt-0">
        <LeftSidebar 
            isOpen={isMobile ? isMobileMenuOpen : isSidebarOpen} 
            onToggle={toggleSidebar}
            isMobile={isMobile}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        
        <main 
            className={`
                flex-1 px-4 py-6 transition-all duration-300 ease-in-out
                ${!isMobile && isSidebarOpen ? 'ml-60' : ''}
                ${!isMobile && !isSidebarOpen ? 'ml-20' : ''}
                ${isMobile ? 'ml-0' : ''}
            `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

