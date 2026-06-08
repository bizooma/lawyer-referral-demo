import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, Scale, Settings, LogOut, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/app", end: true, icon: LayoutDashboard },
  { name: "Attorneys", href: "/app/attorneys", icon: Users },
  { name: "Matching Rules", href: "/app/matching", icon: Scale },
  { name: "Domains", href: "/app/domains", icon: Globe },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function AppLayout() {
  const { user, memberships, activeMembership, activeOrgId, setActiveOrgId, signOut } = useAuth();
  const navigate = useNavigate();

  // No org yet? Show a guided onboarding nudge.
  if (memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md text-center space-y-4">
          <Building2 className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">No organization yet</h1>
          <p className="text-muted-foreground">
            You're signed in as <strong>{user?.email}</strong> but you don't belong to any
            organization yet. An administrator needs to invite you, or you can create your own.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/signup")}>Create an Organization</Button>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeOrgId) {
    return <Navigate to="/app" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className="w-64 bg-primary text-primary-foreground flex flex-col"
        style={activeMembership?.organization.primary_color ? { backgroundColor: activeMembership.organization.primary_color } : undefined}
      >
        <div className="p-6 border-b border-primary-foreground/20">
          {activeMembership?.organization.logo_url && (
            <img
              src={activeMembership.organization.logo_url}
              alt={`${activeMembership.organization.name} logo`}
              className="h-10 w-auto mb-3 bg-white/95 rounded p-1"
            />
          )}
          <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-2">
            Organization
          </p>
          {memberships.length > 1 ? (
            <Select value={activeOrgId} onValueChange={setActiveOrgId}>
              <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {memberships.map((m) => (
                  <SelectItem key={m.organization_id} value={m.organization_id}>
                    {m.organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-semibold">{activeMembership?.organization.name}</p>
          )}
          {activeMembership?.organization.is_demo && (
            <p className="text-xs mt-2 px-2 py-1 rounded bg-amber-500/30 text-amber-100 inline-block">
              Demo Org
            </p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-foreground/20">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-primary-foreground/70 capitalize">
              {activeMembership?.role.replace("_", " ")}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
