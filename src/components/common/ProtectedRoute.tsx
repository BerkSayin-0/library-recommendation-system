import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
  }>({
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  useEffect(() => {
    async function checkAuthState() {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
        const isAdmin = groups.includes('admin');

        setAuthState({
          isAuthenticated: !!user,
          isLoading: false,
          isAdmin: isAdmin,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          isAdmin: false,
        });
      }
    }

    checkAuthState();
  }, [requireAdmin]);

  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !authState.isAdmin) {
    console.warn('Unauthorized access attempt to admin route');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
