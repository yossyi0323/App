'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getSession } from '@/lib/supabase-client';
import { Session } from '@supabase/supabase-js';

type SupabaseContextType = {
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  isLoading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { session, error } = await getSession();
      setSession(session);
      setIsLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);