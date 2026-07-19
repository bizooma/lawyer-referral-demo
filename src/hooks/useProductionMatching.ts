import { supabase } from "@/integrations/supabase/client";

export const PRACTICE_AREAS = [
  "personal_injury",
  "family_law",
  "criminal_defense",
  "estate_probate",
  "immigration",
  "business",
] as const;
export type PracticeArea = (typeof PRACTICE_AREAS)[number];

export const LANGUAGES = ["English", "Spanish", "French", "Mandarin", "Vietnamese", "Creole"];

// Default rule weights used if a rule row is absent or inactive
const DEFAULT_WEIGHTS: Record<string, number> = {
  "Practice Area Match": 40,
  "County Match": 15,
  "Language Match": 10,
  "Capacity Penalty": -30,
  "Exclusion Penalty": -50,
};

export interface RuleWeights {
  practiceArea: number;
  county: number;
  language: number;
  capacity: number;
  exclusion: number;
}

export async function fetchRuleWeights(orgId: string): Promise<RuleWeights> {
  const { data } = await supabase
    .from("matching_rules")
    .select("rule_name, weight, is_active")
    .eq("organization_id", orgId);

  const active = new Map<string, number>();
  (data ?? []).forEach((r) => {
    if (r.is_active !== false) active.set(r.rule_name, r.weight);
  });

  const get = (name: string) => (active.has(name) ? (active.get(name) as number) : DEFAULT_WEIGHTS[name] ?? 0);
  return {
    practiceArea: get("Practice Area Match"),
    county: get("County Match"),
    language: get("Language Match"),
    capacity: get("Capacity Penalty"),
    exclusion: get("Exclusion Penalty"),
  };
}

export interface ScoredAttorney {
  attorney: {
    id: string;
    name: string;
    firm_name: string | null;
    email: string;
    practice_areas: string[];
    counties: string[];
    languages: string[] | null;
    capacity_status: string | null;
    max_active_referrals: number | null;
    active_count: number;
  };
  score: number;
  breakdown: RuleWeights;
}

export async function runMatching(
  orgId: string,
  intake: { area_of_law: string; county: string; language_preference: string | null }
): Promise<ScoredAttorney[]> {
  const weights = await fetchRuleWeights(orgId);

  const { data: attorneys } = await supabase
    .from("attorneys")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_active", true);

  if (!attorneys?.length) return [];

  // Fetch active referral counts for capacity check
  const ids = attorneys.map((a) => a.id);
  const { data: activeIntakes } = await supabase
    .from("intakes")
    .select("assigned_attorney_id, status")
    .eq("organization_id", orgId)
    .in("status", ["matched", "referred"])
    .in("assigned_attorney_id", ids);
  const activeCounts = new Map<string, number>();
  (activeIntakes ?? []).forEach((i: any) => {
    if (i.assigned_attorney_id)
      activeCounts.set(i.assigned_attorney_id, (activeCounts.get(i.assigned_attorney_id) ?? 0) + 1);
  });

  const scored: ScoredAttorney[] = attorneys.map((a: any) => {
    const active = activeCounts.get(a.id) ?? 0;
    const atCap =
      (a.max_active_referrals != null && active >= a.max_active_referrals) ||
      a.capacity_status === "at_capacity";

    const breakdown: RuleWeights = {
      practiceArea: a.practice_areas?.includes(intake.area_of_law) ? weights.practiceArea : 0,
      county: a.counties?.includes(intake.county) ? weights.county : 0,
      language:
        intake.language_preference && a.languages?.includes(intake.language_preference)
          ? weights.language
          : 0,
      capacity: atCap ? weights.capacity : 0,
      exclusion: (a.excluded_flags?.length ?? 0) > 0 ? weights.exclusion : 0,
    };
    const score = Object.values(breakdown).reduce((s, v) => s + v, 0);

    return {
      attorney: {
        id: a.id,
        name: a.name,
        firm_name: a.firm_name,
        email: a.email,
        practice_areas: a.practice_areas ?? [],
        counties: a.counties ?? [],
        languages: a.languages,
        capacity_status: a.capacity_status,
        max_active_referrals: a.max_active_referrals,
        active_count: active,
      },
      score,
      breakdown,
    };
  });

  // Filter out hard-blocked (exclusions / at cap) from top of list is optional; keep them ranked but sorted low
  return scored
    .filter((s) => s.attorney.active_count < (s.attorney.max_active_referrals ?? Infinity) || s.score > 0)
    .sort((a, b) => b.score - a.score);
}
