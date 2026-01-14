import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Scale,
  Bell,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const navigation = [
  { name: 'Dashboard', href: '/demo/attorney/dashboard', icon: LayoutDashboard },
  { name: 'Referred Clients', href: '/demo/attorney/referrals', icon: Users },
  { name: 'My Profile', href: '/demo/attorney/profile', icon: User },
  { name: 'Availability', href: '/demo/attorney/availability', icon: Settings },
];

export function AttorneyLayout() {
  const { user, logout } = useDemoAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get pending referral count
  const { data: pendingCount } = useQuery({
    queryKey: ['pending-referrals', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('attorney_profiles')
        .select('attorney_id')
        .eq('demo_user_id', user?.id || '')
        .maybeSingle();

      if (!profile) return 0;

      const { count } = await supabase
        .from('referral_responses')
        .select('*', { count: 'exact', head: true })
        .eq('attorney_id', profile.attorney_id)
        .eq('status', 'pending');

      return count || 0;
    },
    enabled: !!user?.id,
  });

  const handleLogout = () => {
    logout();
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Demo Mode Banner */}
      <div className="bg-emerald-600 text-white text-center py-2 text-sm font-medium">
        🎭 DEMO MODE - Attorney Portal - All data is simulated
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-12 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-10 left-0 z-40 h-[calc(100vh-2.5rem)] w-64 bg-card border-r transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">LawyerReferral</span>
            </div>
            {pendingCount && pendingCount > 0 ? (
              <div className="flex items-center gap-1 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium">
                <Bell className="h-3 w-3" />
                {pendingCount}
              </div>
            ) : null}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.name === 'Referred Clients' && pendingCount && pendingCount > 0 ? (
                  <span className="ml-auto bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs">
                    {pendingCount}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">Attorney</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Demo
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 min-h-[calc(100vh-2.5rem)]">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
