import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMatchingRules() {
  return useQuery({
    queryKey: ['matching-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matching_rules')
        .select('*')
        .order('weight', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export interface MatchScore {
  attorney: {
    id: string;
    name: string;
    email: string;
    firm_name: string | null;
    practice_areas: string[];
    counties: string[];
    languages: string[];
    capacity_status: string | null;
    excluded_flags: string[] | null;
  };
  score: number;
  breakdown: {
    practiceArea: number;
    county: number;
    language: number;
    capacity: number;
    exclusion: number;
  };
}

export function calculateMatchScores(
  intake: {
    area_of_law: string;
    county: string;
    language_preference: string | null;
  },
  attorneys: Array<{
    id: string;
    name: string;
    email: string;
    firm_name: string | null;
    practice_areas: string[];
    counties: string[];
    languages: string[] | null;
    capacity_status: string | null;
    excluded_flags: string[] | null;
    is_active: boolean | null;
  }>
): MatchScore[] {
  return attorneys
    .filter(a => a.is_active !== false)
    .map(attorney => {
      const breakdown = {
        practiceArea: attorney.practice_areas?.includes(intake.area_of_law) ? 40 : 0,
        county: attorney.counties?.includes(intake.county) ? 15 : 0,
        language: intake.language_preference && attorney.languages?.includes(intake.language_preference) ? 10 : 0,
        capacity: attorney.capacity_status === 'at_capacity' ? -30 : 0,
        exclusion: (attorney.excluded_flags?.length || 0) > 0 ? -50 : 0,
      };
      
      const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
      
      return {
        attorney: {
          id: attorney.id,
          name: attorney.name,
          email: attorney.email,
          firm_name: attorney.firm_name,
          practice_areas: attorney.practice_areas,
          counties: attorney.counties,
          languages: attorney.languages || [],
          capacity_status: attorney.capacity_status,
          excluded_flags: attorney.excluded_flags,
        },
        score,
        breakdown,
      };
    })
    .sort((a, b) => b.score - a.score);
}
