import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DemoRole = 'intake_specialist' | 'program_admin';

interface DemoUser {
  id: string;
  email: string;
  display_name: string;
  role: DemoRole;
}

interface DemoAuthContextType {
  user: DemoUser | null;
  isLoading: boolean;
  login: (role: DemoRole) => Promise<void>;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored demo session
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (role: DemoRole) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('demo_users')
        .select('*')
        .eq('role', role)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const demoUser: DemoUser = {
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          role: data.role as DemoRole,
        };
        setUser(demoUser);
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return (
    <DemoAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}
