'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireRole } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { user, loading, authorized } = useRequireRole(...roles);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && user && !authorized) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        professor: '/professor',
        student: '/student',
      };
      router.replace(redirectMap[user.role] || '/login');
    }
  }, [loading, user, authorized, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !authorized) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        professor: '/professor',
        student: '/student',
      };
      router.replace(redirectMap[user.role] || '/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  return <>{children}</>;
}
