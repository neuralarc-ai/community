import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Shield } from 'lucide-react';
import TrendingSection from '@/app/components/TrendingSection';

interface TwoColumnLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function TwoColumnLayout({ children, rightSidebar }: TwoColumnLayoutProps) {
  return (
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

              {/* Trending Section as part of the sidebar */}
              <TrendingSection />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

