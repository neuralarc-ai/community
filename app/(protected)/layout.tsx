import MainLayout from '@/app/components/MainLayout';
import React from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}