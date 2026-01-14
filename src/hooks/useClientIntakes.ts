import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

export function useClientIntakes() {
  const { user } = useDemoAuth();

  return useQuery({
    queryKey: ['client-intakes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('intakes')
        .select(`
          *,
          assigned_attorney:attorneys(id, name, email, phone, firm_name)
        `)
        .eq('demo_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useClientProfile() {
  const { user } = useDemoAuth();

  return useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('demo_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
