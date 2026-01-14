import { Navigate, useLocation } from 'react-router-dom';
import { useDemoAuth, getDashboardPath, DemoRole } from '@/contexts/DemoAuthContext';

interface DemoAuthGuardProps {
  children: React.ReactNode;
  allowedRoles: DemoRole[];
}

export function DemoAuthGuard({ children, allowedRoles }: DemoAuthGuardProps) {
  const { user, isLoading } = useDemoAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in - redirect to demo login
  if (!user) {
    return <Navigate to="/demo" state={{ from: location }} replace />;
  }

  // Logged in but wrong role - redirect to correct dashboard
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

// Wrapper components for each role group
export function StaffGuard({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthGuard allowedRoles={['intake_specialist', 'program_admin']}>
      {children}
    </DemoAuthGuard>
  );
}

export function ClientGuard({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthGuard allowedRoles={['client']}>
      {children}
    </DemoAuthGuard>
  );
}

export function AttorneyGuard({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthGuard allowedRoles={['attorney']}>
      {children}
    </DemoAuthGuard>
  );
}

// Redirect logged-in users away from login page
export function DemoLoginGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useDemoAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Already logged in - redirect to their dashboard
  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
