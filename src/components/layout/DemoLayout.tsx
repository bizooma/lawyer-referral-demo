import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Scale, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/demo/dashboard', icon: LayoutDashboard },
  { name: 'New Intake', href: '/demo/intake', icon: FileText },
  { name: 'Matching', href: '/demo/matching', icon: Scale },
  { name: 'Attorneys', href: '/demo/attorneys', icon: Users },
  { name: 'Reports', href: '/demo/reports', icon: BarChart3 },
  { name: 'Settings', href: '/demo/settings', icon: Settings },
];

export function DemoLayout() {
  const { user, logout } = useDemoAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Banner */}
      <div className="bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium">
        <span className="font-bold">DEMO MODE</span> — This is a demonstration environment with fictional data. No real legal advice or payment processing.
      </div>

      <div className="flex h-[calc(100vh-40px)]">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-[40px] left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-primary-foreground/20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">RefferEase</h1>
                  <p className="text-xs text-primary-foreground/70 mt-1">Lawyer Referral Platform</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary-foreground text-primary" 
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* User info & logout */}
            <div className="p-4 border-t border-primary-foreground/20">
              <div className="mb-3 px-4">
                <p className="text-sm font-medium">{user?.display_name}</p>
                <p className="text-xs text-primary-foreground/70 capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/demo/tour"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary-foreground text-primary" 
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  <HelpCircle className="h-5 w-5" />
                  Guided Tour
                </NavLink>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-4 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Exit Demo
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="lg:hidden bg-card border-b px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-primary">RefferEase</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
