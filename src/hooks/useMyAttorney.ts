import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMyAttorney() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-attorney", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attorneys")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyReferrals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-referrals", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: attorney } = await supabase
        .from("attorneys").select("id").eq("user_id", user!.id).maybeSingle();
      if (!attorney) return [];
      const { data, error } = await supabase
        .from("referral_responses")
        .select("*, intake:intakes(id, intake_number, caller_name, caller_phone, caller_email, area_of_law, county, language_preference, narrative, urgency, status, created_at)")
        .eq("attorney_id", attorney.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
