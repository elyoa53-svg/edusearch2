'use client';

import { ProtectedRoute } from '@/components/protected-route';

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={['professor']}>
      {children}
    </ProtectedRoute>
  );
}
