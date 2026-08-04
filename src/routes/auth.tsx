import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  emptyProfileDraft,
  fieldClass,
  Field,
  ProfileFields,
  type ProfileDraft,
} from "@/components/profile-fields";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";
import { isProfileComplete, type Profile } from "@/lib/profile";

const DESCRIPTION =
  "Create a free PEMG Library account — as a church member or a guest — to watch messages and live services.";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search['mode'] === "signup" ? ("signup" as Mode) : ("signin" as Mode),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Sign in — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<ProfileDraft>(emptyProfileDraft());
  const [busy, setBusy] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [checked, setChecked] = useState(false);

  const loadProfile = useServerFn(getMyProfile);
  const persistProfile = useServerFn(saveMyProfile);

  // After any successful sign-in, make sure we have their details on file.
  useEffect(() => {
    let active = true;

    async function afterSession() {
      try {
        const profile = (await loadProfile({})) as Profile | null;
        if (!active) return;
        if (isProfileComplete(profile)) {
          navigate({ to: "/account" });
          return;
        }
        if (profile) {
          setDraft({
            full_name: profile.full_name,
            country: profile.country,
            country_code: profile.country_code,
            phone: profile.phone,
            attendee_type: profile.attendee_type,
            cell_group: profile.cell_group,
          });
        }
        setNeedsProfile(true);
      } catch {
        if (active) setNeedsProfile(true);
      } finally {
        if (active) setChecked(true);
      }
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void afterSession();
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) void afterSession();
      else if (active) setChecked(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadProfile, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!draft.country || !draft.country_code) {
          throw new Error("Please select your country and dialling code.");
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/account",
            data: {
              full_name: draft.full_name,
              country: draft.country,
              country_code: draft.country_code,
              phone: draft.phone,
              attendee_type: draft.attendee_type,
              cell_group: draft.attendee_type === "member" ? draft.cell_group : "",
            },
          },
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

  async function onCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await persistProfile({ data: draft });
      toast.success("Profile saved");
      navigate({ to: "/account" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your details");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
  }

  if (needsProfile) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-5 pb-24 pt-36 sm:px-8">
        <p className="eyebrow-cool">One last step</p>
        <h1 className="display mt-4 text-[clamp(2rem,6vw,3rem)]">Complete your profile</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Tell us a little about you so we know who's joining our services.
        </p>
        <form onSubmit={onCompleteProfile} className="mt-8 grid gap-4">
          <ProfileFields draft={draft} onChange={setDraft} />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-[color:var(--sage)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)] disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow-cool">Members &amp; guests</p>
      <h1 className="display mt-4 text-[clamp(2.25rem,7vw,3.5rem)]">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in to watch messages and live services."
          : DESCRIPTION}
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        {mode === "signup" && <ProfileFields draft={draft} onChange={setDraft} />}

        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <button
          type="submit"
          disabled={busy || !checked}
          className="mt-2 rounded-full bg-[color:var(--sage)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)] disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
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
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
