import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useIntakes() {
  return useQuery({
    queryKey: ['intakes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intakes')
        .select('*, attorneys:assigned_attorney_id(name, email)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useIntake(id: string) {
  return useQuery({
    queryKey: ['intake', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intakes')
        .select('*, attorneys:assigned_attorney_id(*)')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useIntakeStats() {
  return useQuery({
    queryKey: ['intake-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intakes')
        .select('status, created_at');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        new: data.filter(i => i.status === 'new').length,
        matched: data.filter(i => i.status === 'matched').length,
        referred: data.filter(i => i.status === 'referred').length,
        closed: data.filter(i => i.status === 'closed').length,
        thisWeek: data.filter(i => {
          const created = new Date(i.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created >= weekAgo;
        }).length,
      };
      
      return stats;
    },
  });
}
