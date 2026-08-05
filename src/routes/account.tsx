import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import {
  emptyProfileDraft,
  ProfileFields,
  type ProfileDraft,
} from "@/components/profile-fields";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";
import type { Profile } from "@/lib/profile";
import { remindersQueryOptions, type Reminder } from "@/lib/reminders";
import { removeReminder } from "@/lib/reminders.functions";

const DESCRIPTION = "Your PEMG Library profile — update your details, cell group and contact number.";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "My account — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, status } = useSession();
  const [draft, setDraft] = useState<ProfileDraft>(emptyProfileDraft());

  const loadProfile = useServerFn(getMyProfile);
  const persistProfile = useServerFn(saveMyProfile);
  const dropReminder = useServerFn(removeReminder);

  const remindersQuery = useQuery({ ...remindersQueryOptions, enabled: status === "in" });
  const forget = useMutation({
    mutationFn: (r: Reminder) => dropReminder({ data: { kind: r.kind, target_id: r.target_id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  useEffect(() => {
    if (status === "out") navigate({ to: "/auth", search: { mode: "signin" } });
  }, [status, navigate]);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => loadProfile({}) as Promise<Profile | null>,
    enabled: status === "in",
  });

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setDraft({
      full_name: p.full_name,
      country: p.country,
      country_code: p.country_code,
      phone: p.phone,
      attendee_type: p.attendee_type,
      cell_group: p.cell_group,
    });
  }, [profileQuery.data]);

  const save = useMutation({
    mutationFn: (values: ProfileDraft) => persistProfile({ data: values }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update profile"),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  if (status !== "in" || profileQuery.isLoading) {
    return <div className="mx-auto max-w-2xl px-5 pb-24 pt-36 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-36 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow-cool">Your profile</p>
          <h1 className="display mt-3 text-[clamp(2rem,6vw,3.5rem)]">
            {draft.full_name || "Welcome"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{session?.user.email}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-full border border-border px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em]"
        >
          Sign out
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(draft);
        }}
        className="mt-10 grid gap-4 rounded-3xl border border-border bg-surface p-6"
      >
        <ProfileFields draft={draft} onChange={setDraft} />
        <button
          type="submit"
          disabled={save.isPending}
          className="mt-2 rounded-full bg-[color:var(--sage)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)] disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/messages" className="underline underline-offset-4">
          Watch messages
        </Link>
        <Link to="/events" className="underline underline-offset-4">
          Upcoming events
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="display text-2xl">Saved &amp; reminders</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Messages you kept for later and live sessions you'll be notified about.
        </p>
        {((remindersQuery.data ?? []) as Reminder[]).length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing saved yet — tap “Watch later” on a message or “Notify me” on a live session.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {((remindersQuery.data ?? []) as Reminder[]).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {r.kind === "stream" ? "Live session" : "Watch later"}
                  </p>
                  <a href={r.href} className="mt-1 block truncate font-semibold hover:underline">
                    {r.title || r.target_id}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => forget.mutate(r)}
                  className="shrink-0 rounded-full border border-border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
