'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import type { UserRole } from '@/types';

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(`/dashboard/${user?.role.toLowerCase()}`);
    }
  }, [isAuthenticated, user, requiredRole, router]);

  return { user, isAuthenticated };
}
