import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAttorneys() {
  return useQuery({
    queryKey: ['attorneys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAttorney(id: string) {
  return useQuery({
    queryKey: ['attorney', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useAttorneyStats() {
  return useQuery({
    queryKey: ['attorney-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attorneys')
        .select('capacity_status, is_active, practice_areas');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        active: data.filter(a => a.is_active).length,
        available: data.filter(a => a.capacity_status === 'available').length,
        atCapacity: data.filter(a => a.capacity_status === 'at_capacity').length,
        practiceAreas: [...new Set(data.flatMap(a => a.practice_areas || []))],
      };
      
      return stats;
    },
  });
}
