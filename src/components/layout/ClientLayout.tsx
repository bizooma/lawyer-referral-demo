import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  User,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Scale,
} from 'lucide-react';

const navigation = [
  { name: 'My Dashboard', href: '/demo/client/dashboard', icon: LayoutDashboard },
  { name: 'My Referrals', href: '/demo/client/referrals', icon: FileText },
  { name: 'Request Referral', href: '/demo/client/intake', icon: PlusCircle },
  { name: 'My Profile', href: '/demo/client/profile', icon: User },
];

export function ClientLayout() {
  const { user, logout } = useDemoAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Demo Mode Banner */}
      <div className="bg-amber-500 text-amber-950 text-center py-2 text-sm font-medium">
        🎭 DEMO MODE - Client Portal - All data is simulated
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
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">LawyerReferral</span>
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
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">Client</p>
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
