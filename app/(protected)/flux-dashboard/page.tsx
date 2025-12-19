'use client'

import { Suspense } from 'react';
import FluxDashboard from '@/app/components/flux/FluxDashboard';

export default function FluxDashboardPage() {
  return (
    <Suspense fallback={<div>Loading Flux Dashboard...</div>}>
      <FluxDashboard />
    </Suspense>
  );
}
