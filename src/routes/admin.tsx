import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminStreams } from "@/components/admin-streams";
import { ImageUpload } from "@/components/image-upload";
import { deleteEvent, getAllEvents, getIsAdmin, saveEvent } from "@/lib/events.functions";
import { formatEventDate, formatEventTime, type LibraryEvent } from "@/lib/events";

const DESCRIPTION = "Manage the PEMG Library events calendar — add, edit, publish and remove events.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Events admin — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Events admin — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Draft = Omit<LibraryEvent, "id"> & { id?: string };

const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  kind: "Gathering",
  starts_at: new Date().toISOString().slice(0, 16),
  location: "",
  summary: "",
  cta: "Find out more",
  href: "",
  image_url: null,
  published: true,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<"loading" | "out" | "in">("loading");
  const [draft, setDraft] = useState<Draft | null>(null);

  const isAdminFn = useServerFn(getIsAdmin);
  const listFn = useServerFn(getAllEvents);
  const saveFn = useServerFn(saveEvent);
  const removeFn = useServerFn(deleteEvent);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ? "in" : "out"));
    supabase.auth.getSession().then(({ data: s }) => setSession(s.session ? "in" : "out"));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === "out") navigate({ to: "/auth", search: { mode: "signin" } });
  }, [session, navigate]);

  const adminQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => isAdminFn({}),
    enabled: session === "in",
  });

  const eventsQuery = useQuery({
    queryKey: ["events", "admin"],
    queryFn: () => listFn({}),
    enabled: adminQuery.data === true,
  });

  const save = useMutation({
    mutationFn: (values: Draft) =>
      saveFn({
        data: {
          ...values,
          slug: values.slug || slugify(values.title),
          starts_at: new Date(values.starts_at).toISOString(),
        },
      }),
    onSuccess: () => {
      toast.success("Event saved");
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save event"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete event"),
  });

  if (session !== "in" || adminQuery.isLoading) {
    return <div className="mx-auto max-w-4xl px-5 pb-24 pt-36 text-muted-foreground">Loading…</div>;
  }

  if (adminQuery.data !== true) {
    return (
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-36 sm:px-8">
        <h1 className="display text-4xl">No access</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This account is signed in but is not an admin, so it can't edit events. Ask an existing
          admin to grant your account the admin role.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-8 rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.16em]"
        >
          Sign out
        </button>
      </div>
    );
  }

  const list = (eventsQuery.data ?? []) as LibraryEvent[];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="eyebrow-cool">Admin</p>
          <h1 className="display mt-3 truncate text-[clamp(2.25rem,7vw,4rem)]">Events</h1>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="shrink-0 rounded-full border border-border px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em]"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="rounded-full bg-[color:var(--sage)] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)]"
        >
          New event
        </button>
        <Link
          to="/events"
          className="rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.16em]"
        >
          View public page
        </Link>
      </div>

      {draft && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(draft);
          }}
          className="mt-8 grid gap-4 rounded-3xl border border-border bg-surface p-6"
        >
          <Field label="Title">
            <input
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kind">
              <input
                value={draft.kind}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Starts at (UTC)">
              <input
                type="datetime-local"
                required
                value={draft.starts_at.slice(0, 16)}
                onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Button label">
              <input
                value={draft.cta}
                onChange={(e) => setDraft({ ...draft, cta: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Link">
            <input
              value={draft.href}
              onChange={(e) => setDraft({ ...draft, href: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Summary">
            <textarea
              rows={3}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              className={inputClass}
            />
          </Field>
          <ImageUpload
            label="Event image"
            folder="events"
            value={draft.image_url}
            onChange={(url) => setDraft({ ...draft, image_url: url })}
          />
          <label className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
            />
            Published
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-full bg-[color:var(--sage)] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)] disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save event"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.16em]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-10 grid gap-4">
        {list.map((event) => (
          <article
            key={event.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-3xl border border-border bg-surface p-5"
          >
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[color:var(--sage)]">
                {event.kind} {event.published ? "" : "· draft"}
              </p>
              <h2 className="mt-2 truncate font-display text-lg font-bold">{event.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...event, starts_at: new Date(event.starts_at).toISOString().slice(0, 16) })
                }
                className="rounded-full border border-border px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove.mutate(event.id)}
                className="rounded-full border border-destructive/50 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-destructive"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <AdminStreams />
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-[color:var(--sage)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
