'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import MainLayoutClientWrapper from './MainLayoutClientWrapper';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isSpecialPage = pathname.startsWith('/conclave/') || pathname === '/login' || pathname === '/complete-profile';

  if (isSpecialPage) {
    return <>{children}</>;
  }

  return (
    <MainLayoutClientWrapper>
      {children}
    </MainLayoutClientWrapper>
  );
}

