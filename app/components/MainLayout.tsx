'use client'
import React, { useState } from 'react';
import Header from '@/app/components/Header';
import LeftSidebar from '@/app/components/LeftSidebar';
import { useMediaQuery } from '@/lib/utils';
import Footer from '@/app/components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
  const logoHref = '/dashboard'; // Assuming default logo href for now

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarOpen(true);
    }
  };

  const handleCloseMobileSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      {isDesktop ? (
        // Desktop layout
        <div className="flex flex-1">
          <LeftSidebar
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
            isMobile={false}
            onCloseMobile={handleCloseMobileSidebar}
          />
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-20' : 'lg:ml-0'}`}
          >
            <Header onMenuClick={handleToggleSidebar} />
            <main className="flex-1 bg-background p-4 lg:max-w-[1600px] lg:mx-auto">
              {children}
            </main>
          </div>
        </div>
      ) : (
        // Mobile layout
        <div className="flex flex-col flex-1">
          <Header onMenuClick={handleToggleSidebar} />
          <LeftSidebar
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
            isMobile={true}
            onCloseMobile={handleCloseMobileSidebar}
          />
          <main className="flex-1 bg-background p-2 mt-16">
            {children}
          </main>
        </div>
      )}
      <Footer />
    </div>
  );
}

