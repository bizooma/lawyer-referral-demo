import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "program_admin" | "intake_specialist" | "attorney";

export interface OrgMembership {
  organization_id: string;
  role: AppRole;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string | null;
    is_demo: boolean;
    plan_tier: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  memberships: OrgMembership[];
  activeOrgId: string | null;
  setActiveOrgId: (id: string | null) => void;
  activeMembership: OrgMembership | null;
  refreshMemberships: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_ORG_KEY = "active_org_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_ORG_KEY)
  );

  const setActiveOrgId = (id: string | null) => {
    setActiveOrgIdState(id);
    if (id) localStorage.setItem(ACTIVE_ORG_KEY, id);
    else localStorage.removeItem(ACTIVE_ORG_KEY);
  };

  const loadMemberships = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select(
        "organization_id, role, organization:organizations(id, name, slug, logo_url, primary_color, is_demo, plan_tier)"
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to load memberships:", error);
      setMemberships([]);
      return;
    }

    const rows = (data ?? []) as unknown as OrgMembership[];
    setMemberships(rows);

    // Auto-select first org if none active or stored one is no longer valid
    const stored = localStorage.getItem(ACTIVE_ORG_KEY);
    const valid = rows.find((r) => r.organization_id === stored);
    if (!valid && rows.length > 0) {
      setActiveOrgId(rows[0].organization_id);
    } else if (rows.length === 0) {
      setActiveOrgId(null);
    }
  };

  const refreshMemberships = async () => {
    if (user) await loadMemberships(user.id);
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer Supabase calls to avoid deadlock inside the callback
        setTimeout(() => loadMemberships(newSession.user.id), 0);
      } else {
        setMemberships([]);
      }
    });

    // THEN fetch existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        loadMemberships(existing.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setActiveOrgId(null);
  };

  const activeMembership =
    memberships.find((m) => m.organization_id === activeOrgId) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        memberships,
        activeOrgId,
        setActiveOrgId,
        activeMembership,
        refreshMemberships,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
