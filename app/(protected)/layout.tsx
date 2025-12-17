'use client';

import ProtectedLayout from "@/app/components/ProtectedLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

