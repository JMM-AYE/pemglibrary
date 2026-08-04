import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Client-side session state: "loading" until Supabase reports in. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setStatus(next ? "in" : "out");
    });
    supabase.auth.getSession().then(({ data: s }) => {
      setSession(s.session);
      setStatus(s.session ? "in" : "out");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, status } as const;
}