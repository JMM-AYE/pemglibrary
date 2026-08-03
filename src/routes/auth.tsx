import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PEMG Library" },
      { name: "description", content: "Sign in to manage PEMG Library events and content." },
      { property: "og:title", content: "Sign in — PEMG Library" },
      {
        property: "og:description",
        content: "Sign in to manage PEMG Library events and content.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/admin" });
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) navigate({ to: "/admin" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow-cool">Team access</p>
      <h1 className="display mt-4 text-[clamp(2.25rem,7vw,3.5rem)]">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Admin access is required to publish and edit upcoming events.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-[color:var(--sage)]"
          />
        </label>
        <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-[color:var(--sage)]"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-full bg-[color:var(--sage)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)] disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        type="button"
        onClick={onGoogle}
        className="mt-3 rounded-full border border-border px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-[color:var(--sage)]"
      >
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-xs text-muted-foreground underline underline-offset-4"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
