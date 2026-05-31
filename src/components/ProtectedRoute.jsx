import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

export default function ProtectedRoute({ requiredRole } = {}) {
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && !isAuthenticated && !authError) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isLoadingPublicSettings, isAuthenticated, authError, navigateToLogin]);

  if (isLoadingAuth || isLoadingPublicSettings) return <Spinner />;

  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;

  if (authError?.type === 'auth_required' || !isAuthenticated) {
    navigateToLogin();
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <p className="text-lg font-semibold text-foreground">Access denied</p>
        <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        <a href="/" className="text-sm text-primary hover:underline">Go home</a>
      </div>
    );
  }

  return <Outlet />;
}
