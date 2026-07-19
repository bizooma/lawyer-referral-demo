import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { LayoutDashboard, Send, User, ToggleRight, LogOut, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { name: "Dashboard", href: "/attorney", end: true, icon: LayoutDashboard },
  { name: "My Referrals", href: "/attorney/referrals", icon: Send },
  { name: "My Profile", href: "/attorney/profile", icon: User },
  { name: "Availability", href: "/attorney/availability", icon: ToggleRight },
];

export function AttorneyPortalLayout() {
  const { user, memberships, activeMembership, signOut } = useAuth();
  const navigate = useNavigate();

  const attorneyMembership =
    activeMembership?.role === "attorney"
      ? activeMembership
      : memberships.find((m) => m.role === "attorney");

  if (!attorneyMembership) {
    // Signed in but not an attorney anywhere — send to the admin app.
    return <Navigate to="/app" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col"
        style={attorneyMembership.organization.primary_color ? { backgroundColor: attorneyMembership.organization.primary_color } : undefined}>
        <div className="p-6 border-b border-primary-foreground/20">
          {attorneyMembership.organization.logo_url ? (
            <img src={attorneyMembership.organization.logo_url} alt="" className="h-10 w-auto mb-3 bg-white/95 rounded p-1" />
          ) : (
            <Scale className="h-8 w-8 mb-3" />
          )}
          <p className="text-xs uppercase tracking-wider text-primary-foreground/60">Attorney Portal</p>
          <p className="font-semibold">{attorneyMembership.organization.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary-foreground text-primary" : "text-primary-foreground/80 hover:bg-primary-foreground/10"
              )}>
              <item.icon className="h-5 w-5" /> {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-foreground/20">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-primary-foreground/70">Attorney</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" /> Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
