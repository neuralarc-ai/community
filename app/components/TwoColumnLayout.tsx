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
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed / Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {children}
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
          {rightSidebar || (
            <>
              <Card className="bg-card/30 backdrop-blur-md border-white/5 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.05)] hover:bg-white/[0.02]">
                <CardHeader className="bg-white/5 border-b border-white/5 pb-4 group-hover:bg-yellow-500/5 transition-colors">
                  <CardTitle className="flex items-center gap-2 text-sm font-heading font-medium tracking-wide text-white group-hover:text-yellow-50 transition-colors">
                    <Shield className="w-4 h-4 text-white group-hover:text-yellow-200 transition-colors" />
                    COMMUNITY RULES
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 pt-5 group-hover:text-white/90 transition-colors">
                  <p className="text-muted-foreground leading-relaxed pl-2 border-l border-white/10 group-hover:border-yellow-500/20 group-hover:text-white/80 transition-colors">1. Be respectful to others.</p>
                  <p className="text-muted-foreground leading-relaxed pl-2 border-l border-white/10 group-hover:border-yellow-500/20 group-hover:text-white/80 transition-colors">2. No spam or self-promotion.</p>
                  <p className="text-muted-foreground leading-relaxed pl-2 border-l border-white/10 group-hover:border-yellow-500/20 group-hover:text-white/80 transition-colors">3. Keep discussions relevant.</p>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="pt-0 px-0">
                  <div className="text-xs text-muted-foreground/60 text-center">
                    © 2025 Community Portal. All rights reserved.
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
