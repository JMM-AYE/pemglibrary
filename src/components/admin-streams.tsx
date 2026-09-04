import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { deleteStream, getAllStreams, getStreamIngest, saveStream } from "@/lib/live.functions";
import { ImageUpload } from "@/components/image-upload";
import { formatStreamStart, STATUS_LABEL, type AdminStream } from "@/lib/live";

type Draft = Omit<
  AdminStream,
  "id" | "private_token" | "mux_stream_id" | "mux_playback_id" | "mux_stream_key"
> & { id?: string };

const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  summary: "",
  status: "scheduled",
  visibility: "public",
  starts_at: new Date().toISOString().slice(0, 16),
  poster_url: null,
  published: true,
  source_type: "youtube",
  source_value: "",
  access_code: "",
});

function toDraft(stream: AdminStream): Draft {
  const {
    private_token: _t,
    mux_stream_id: _m,
    mux_playback_id: _p,
    mux_stream_key: _k,
    ...rest
  } = stream;
  return { ...rest, starts_at: new Date(stream.starts_at).toISOString().slice(0, 16) };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AdminStreams() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const listFn = useServerFn(getAllStreams);
  const saveFn = useServerFn(saveStream);
  const removeFn = useServerFn(deleteStream);

  const streamsQuery = useQuery({ queryKey: ["streams", "admin"], queryFn: () => listFn({}) });

  const save = useMutation({
    mutationFn: (values: Draft) =>
      saveFn({
        data: {
          ...values,
          slug: values.slug || slugify(values.title),
          starts_at: new Date(values.starts_at).toISOString(),
          access_code: values.visibility === "code" ? values.access_code : "",
        },
      }),
    onSuccess: () => {
      toast.success("Session saved");
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save session"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Session deleted");
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete session"),
  });

  const list = (streamsQuery.data ?? []) as AdminStream[];

  return (
    <section className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow-cool">Admin</p>
          <h2 className="display mt-2 text-[clamp(1.8rem,5vw,3rem)]">Live sessions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDraft(emptyDraft())}
            className="rounded-full bg-[color:var(--sage)] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--ink)]"
          >
            New session
          </button>
          <Link
            to="/live"
            className="rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.16em]"
          >
            View public page
          </Link>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
        Set the status to <strong>Live now</strong> to open the stream and notify everyone who
        has an account. Private sessions get their own secret link — the playback source and that
        link never leave the server until a signed-in viewer opens the right URL. Use{" "}
        <strong>Broadcast details</strong> on a saved session to get the RTMP server and stream key
        for vMix or OBS.
      </p>

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
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminStream["status"] })}
                className={inputClass}
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live now</option>
                <option value="ended">Ended / replay</option>
              </select>
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
            <Field label="Who can watch">
              <select
                value={draft.visibility}
                onChange={(e) =>
                  setDraft({ ...draft, visibility: e.target.value as AdminStream["visibility"] })
                }
                className={inputClass}
              >
                <option value="public">Any signed-in member or guest</option>
                <option value="code">Private — secret link only</option>
              </select>
            </Field>
            <Field label="Source">
              <select
                value={draft.source_type}
                onChange={(e) =>
                  setDraft({ ...draft, source_type: e.target.value as AdminStream["source_type"] })
                }
                className={inputClass}
              >
                <option value="youtube">YouTube (public or unlisted)</option>
                <option value="hls">Direct stream / RTMP broadcast (.m3u8)</option>
                <option value="zoom">Zoom meeting link</option>
              </select>
            </Field>
            <Field
              label={
                draft.source_type === "youtube"
                  ? "YouTube video ID"
                  : draft.source_type === "zoom"
                    ? "Zoom join link"
                    : "Stream URL"
              }
            >
              <input
                value={draft.source_value}
                onChange={(e) => setDraft({ ...draft, source_value: e.target.value })}
                placeholder={
                  draft.source_type === "youtube"
                    ? "dQw4w9WgXcQ"
                    : draft.source_type === "zoom"
                      ? "https://zoom.us/j/1234567890?pwd=…"
                      : "https://…/index.m3u8"
                }
                className={inputClass}
              />
            </Field>
          </div>
          <ImageUpload
            label="Poster image"
            folder="streams"
            value={draft.poster_url}
            onChange={(url) => setDraft({ ...draft, poster_url: url })}
          />
          <Field label="Summary">
            <textarea
              rows={3}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
            />
            Visible on the public live page
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-50"
            >
              Save session
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
        {list.map((stream) => (
          <StreamRow
            key={stream.id}
            stream={stream}
            onEdit={() => setDraft(toDraft(stream))}
            onDelete={() => remove.mutate(stream.id)}
          />
        ))}
      </div>
    </section>
  );
}

function StreamRow({
  stream,
  onEdit,
  onDelete,
}: {
  stream: AdminStream;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const queryClient = useQueryClient();
  const ingestFn = useServerFn(getStreamIngest);
  const [ingest, setIngest] = useState<{
    rtmpUrl: string;
    streamKey: string;
    playbackUrl: string;
  } | null>(null);

  const broadcast = useMutation({
    mutationFn: () => ingestFn({ data: { id: stream.id } }),
    onSuccess: (data) => {
      setIngest(data);
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not reach the broadcaster"),
  });

  const shareLink =
    stream.visibility === "code" && stream.private_token
      ? `/live/${stream.slug}?key=${stream.private_token}`
      : null;

  return (
    <article className="rounded-3xl border border-border bg-surface p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[color:var(--sage)]">
            {STATUS_LABEL[stream.status]}
            {stream.visibility === "code" ? " · private" : ""}
            {stream.published ? "" : " · draft"}
          </p>
          <h3 className="mt-2 truncate font-display text-lg font-bold">{stream.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatStreamStart(stream.starts_at)} · {stream.source_type.toUpperCase()}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => broadcast.mutate()}
            disabled={broadcast.isPending}
            className="rounded-full border border-border px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {broadcast.isPending ? "Preparing…" : "Broadcast details"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-border px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-destructive/50 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-destructive"
          >
            Delete
          </button>
        </div>
      </div>

      {shareLink && (
        <CopyRow
          label="Private invite link"
          value={typeof window === "undefined" ? shareLink : `${window.location.origin}${shareLink}`}
        />
      )}

      {ingest && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">
            Paste these into vMix or OBS (Settings → Stream → Custom). Keep the stream key private.
          </p>
          <CopyRow label="RTMP server" value={ingest.rtmpUrl} />
          <CopyRow label="Stream key" value={ingest.streamKey} secret />
          <CopyRow label="Playback URL" value={ingest.playbackUrl} />
        </div>
      )}
    </article>
  );
}

function CopyRow({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [shown, setShown] = useState(!secret);
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <code className="truncate rounded-xl border border-border bg-surface px-3 py-2 text-xs">
        {shown ? value : "•".repeat(24)}
      </code>
      <span className="flex gap-2">
        {secret && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            className="rounded-full border border-border px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em]"
          >
            {shown ? "Hide" : "Show"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
          }}
          className="rounded-full border border-border px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em]"
        >
          Copy
        </button>
      </span>
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