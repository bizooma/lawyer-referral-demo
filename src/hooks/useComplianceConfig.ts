import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceConfig {
  attorney_qualification?: {
    malpractice_insurance_required?: boolean;
    min_coverage?: number;
    min_years_experience?: number;
    good_standing_required?: boolean;
  };
  disclosures?: Array<{ id?: string; title?: string; body: string; required?: boolean }>;
  fees?: any;
  [k: string]: any;
}

export function useComplianceProfile(orgId: string | null) {
  const [profile, setProfile] = useState<{ status: string; config: ComplianceConfig } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      supabase.from("org_compliance_profiles").select("status, config").eq("organization_id", orgId).maybeSingle(),
      supabase.from("organizations").select("is_demo").eq("id", orgId).maybeSingle(),
    ]).then(([p, o]) => {
      setProfile(p.data ? { status: p.data.status, config: (p.data.config as any) ?? {} } : null);
      setIsDemo(Boolean(o.data?.is_demo));
      setLoading(false);
    });
  }, [orgId]);

  const attested = profile?.status === "attested";
  return { profile, loading, attested, isDemo, canCreateIntakes: attested || isDemo };
}
