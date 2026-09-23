import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { timesheetSupabase } from "../lib/supabase-timesheet";

// Auth dédiée à /timesheet, sur son propre projet Supabase
// (timesheetSupabase), indépendante du client partagé utilisé par /poi
// (voir src/contexts/AuthContext.tsx + src/lib/supabase.ts, non touchés).
export function useTimesheetAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    timesheetSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = timesheetSupabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await timesheetSupabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await timesheetSupabase.auth.signUp({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await timesheetSupabase.auth.signOut();
  };

  const user: User | null = session?.user ?? null;

  return { user, session, loading, signIn, signUp, signOut };
}
