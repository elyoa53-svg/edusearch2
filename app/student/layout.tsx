'use client';

import { ProtectedRoute } from '@/components/protected-route';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={['student']}>{children}</ProtectedRoute>;
}
