'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Shield } from 'lucide-react';

interface GlobalLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function GlobalLayout({ children, rightSidebar }: GlobalLayoutProps) {
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
                ${!isMobile && isSidebarOpen ? 'ml-64' : ''}
                ${!isMobile && !isSidebarOpen ? 'ml-16' : ''}
                ${isMobile ? 'ml-0' : ''}
            `}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Feed / Content */}
                <div className="md:col-span-8 lg:col-span-9 space-y-4">
                    {children}
                </div>

                {/* Right Sidebar - Hidden on mobile */}
                <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
                    {rightSidebar || (
                    <>
                        <Card>
                            <CardHeader className="bg-primary/10 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-heading">
                                    <Shield className="w-4 h-4 text-primary" />
                                    Community Rules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 pt-4">
                                <p className="text-gray-600">1. Be respectful to others.</p>
                                <p className="text-gray-600">2. No spam or self-promotion.</p>
                                <p className="text-gray-600">3. Keep discussions relevant.</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-xs text-gray-400">
                                    © 2024 Community Portal. All rights reserved.
                                </div>
                            </CardContent>
                        </Card>
                    </>
                    )}
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
