import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlanTier {
  code: string;
  name: string;
  max_attorneys: number | null;
  features: Record<string, any>;
  sort_order: number;
}

export interface OrgPlan {
  tier: PlanTier | null;
  attorneyCount: number;
  loading: boolean;
  reload: () => void;
}

export function useOrgPlan(orgId: string | null | undefined, tierCode: string | null | undefined): OrgPlan {
  const [tier, setTier] = useState<PlanTier | null>(null);
  const [attorneyCount, setAttorneyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!orgId || !tierCode) return;
    setLoading(true);
    Promise.all([
      supabase.from("plan_tiers").select("*").eq("code", tierCode).maybeSingle(),
      supabase.from("attorneys").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    ]).then(([tierRes, attRes]) => {
      setTier((tierRes.data as PlanTier | null) ?? null);
      setAttorneyCount(attRes.count ?? 0);
      setLoading(false);
    });
  }, [orgId, tierCode, nonce]);

  return { tier, attorneyCount, loading, reload: () => setNonce((n) => n + 1) };
}

export function planHasFeature(tier: PlanTier | null, feature: string): boolean {
  if (!tier) return false;
  return !!tier.features?.[feature];
}
