'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Check role hierarchy
        const roleHierarchy = {
          staff: 1,
          moderator: 2,
          admin: 3
        };

        const userLevel = roleHierarchy[user?.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        if (userLevel < requiredLevel) {
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [isAuthenticated, loading, user, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const roleHierarchy = {
      staff: 1,
      moderator: 2,
      admin: 3
    };

    const userLevel = roleHierarchy[user?.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return null;
    }
  }

  return children;
}
