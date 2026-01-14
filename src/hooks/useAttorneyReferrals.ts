import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

export function useAttorneyProfile() {
  const { user } = useDemoAuth();

  return useQuery({
    queryKey: ['attorney-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('attorney_profiles')
        .select(`
          *,
          attorney:attorneys(*)
        `)
        .eq('demo_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useAttorneyReferrals() {
  const { user } = useDemoAuth();

  return useQuery({
    queryKey: ['attorney-referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get the attorney profile
      const { data: profile } = await supabase
        .from('attorney_profiles')
        .select('attorney_id')
        .eq('demo_user_id', user.id)
        .maybeSingle();

      if (!profile) return [];

      // Get intakes assigned to this attorney
      const { data, error } = await supabase
        .from('intakes')
        .select('*')
        .eq('assigned_attorney_id', profile.attorney_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useReferralResponses() {
  const { user } = useDemoAuth();

  return useQuery({
    queryKey: ['referral-responses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get the attorney profile
      const { data: profile } = await supabase
        .from('attorney_profiles')
        .select('attorney_id')
        .eq('demo_user_id', user.id)
        .maybeSingle();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('referral_responses')
        .select(`
          *,
          intake:intakes(*)
        `)
        .eq('attorney_id', profile.attorney_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
