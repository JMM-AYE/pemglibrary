import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HlsPlayer } from "@/components/hls-player";
import { ReminderButton } from "@/components/reminder-button";
import { WatchGate } from "@/components/watch-gate";
import { useSession } from "@/hooks/use-session";
import { getStreamPlayback } from "@/lib/live.functions";
import { formatStreamStart, STATUS_LABEL, streamQueryOptions, type LiveStream } from "@/lib/live";

export const Route = createFileRoute("/live/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    key: typeof search["key"] === "string" ? (search["key"] as string) : undefined,
  }),
  loader: async ({ context, params }) => {
    const stream = await context.queryClient.ensureQueryData(streamQueryOptions(params.slug));
    if (!stream) throw notFound();
    return stream as LiveStream;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — PEMG Library Live` },
          { name: "description", content: loaderData.summary.slice(0, 155) },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.summary.slice(0, 155) },
          { property: "og:type", content: "video.other" },
          { name: "twitter:card", content: "summary_large_image" },
          ...(loaderData.poster_url
            ? [
                { property: "og:image", content: loaderData.poster_url },
                { name: "twitter:image", content: loaderData.poster_url },
              ]
            : []),
        ]
      : [],
  }),
  component: LiveStreamPage,
});

type Playback =
  | { ok: true; sourceType: "youtube" | "hls"; sourceValue: string }
  | { ok: false; reason: "missing" | "not-ready" | "code" };

function LiveStreamPage() {
  const { slug } = Route.useParams();
  const { key } = Route.useSearch();
  const { data } = useSuspenseQuery(streamQueryOptions(slug));
  const stream = data as LiveStream | null;
  const { status } = useSession();
  const [code, setCode] = useState("");
  const [playback, setPlayback] = useState<Playback | null>(null);
  const playbackFn = useServerFn(getStreamPlayback);

  const unlock = useMutation({
    mutationFn: (value: string) =>
      playbackFn({ data: { slug, code: value, token: key ?? "" } }),
    onSuccess: (result) => setPlayback(result as Playback),
  });

  // Public sessions — and private ones opened with a valid invite link —
  // resolve automatically once the visitor is signed in.
  useEffect(() => {
    if (
      status === "in" &&
      stream &&
      !playback &&
      (stream.visibility === "public" || key)
    ) {
      unlock.mutate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stream?.visibility, key]);

  if (!stream) return null;
  const live = stream.status === "live";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <Link to="/live" className="text-sm font-semibold text-muted-foreground hover:text-primary">
        &larr; All live sessions
      </Link>

      <div className="mt-8">
        <WatchGate
          poster={stream.poster_url}
          label="Sign in to join this session"
          note="Live services and private sessions are for signed-in members and guests."
        >
          {playback?.ok ? (
            playback.sourceType === "hls" ? (
              <HlsPlayer src={playback.sourceValue} poster={stream.poster_url} />
            ) : (
              <div className="aspect-video w-full overflow-hidden rounded-3xl border border-border bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playback.sourceValue}?autoplay=1&rel=0`}
                  title={stream.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )
          ) : (
            <LockedStage
              stream={stream}
              playback={playback}
              code={code}
              setCode={setCode}
              pending={unlock.isPending}
              onSubmit={() => unlock.mutate(code)}
            />
          )}
        </WatchGate>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="eyebrow">
            {STATUS_LABEL[stream.status]}
            {stream.visibility === "code" ? " · Private session" : ""}
          </p>
          <h1 className="display mt-3 text-[clamp(2.25rem,6vw,4.5rem)]">{stream.title}</h1>
          <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">{stream.summary}</p>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-6">
          <h2 className="display text-lg">Session details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Status", STATUS_LABEL[stream.status]],
              ["Starts", formatStreamStart(stream.starts_at)],
              ["Access", stream.visibility === "code" ? "Invite link" : "Open to signed-in users"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {!live && (
            <ReminderButton
              className="mt-6 w-full"
              kind="stream"
              targetId={stream.slug}
              title={stream.title}
              href={`/live/${stream.slug}`}
              posterUrl={stream.poster_url}
              remindAt={stream.starts_at}
              labels={{ on: "You'll be notified", off: "Notify me when live" }}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function LockedStage({
  stream,
  playback,
  code,
  setCode,
  pending,
  onSubmit,
}: {
  stream: LiveStream;
  playback: Playback | null;
  code: string;
  setCode: (value: string) => void;
  pending: boolean;
  onSubmit: () => void;
}) {
  const needsCode = stream.visibility === "code";
  const wrongCode = playback && !playback.ok && playback.reason === "code" && code.length > 0;
  const notReady = playback && !playback.ok && playback.reason === "not-ready";

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface">
      <div className="aspect-video w-full">
        {stream.poster_url ? (
          <img
            src={stream.poster_url}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover opacity-35 blur-[3px]"
          />
        ) : (
          <div className="h-full w-full bg-[image:var(--gradient-ember)] opacity-40" />
        )}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/75 px-6 text-center backdrop-blur-sm">
        <div className="w-full max-w-sm">
          <p className="eyebrow-cool">{STATUS_LABEL[stream.status]}</p>
          <h2 className="display mt-3 text-2xl sm:text-3xl">
            {notReady
              ? "Stream not started"
              : needsCode
                ? "Private session"
                : "Connecting…"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {notReady
              ? "The host hasn't opened this session yet. Set a reminder and we'll notify you."
              : needsCode
                ? "Open the private invite link the host shared with you, or enter your invite code below."
                : "Getting the stream ready."}
          </p>
          {needsCode && !notReady && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Invite code"
                aria-label="Invite code"
                className="w-full rounded-full border border-border bg-background px-5 py-3 text-center text-sm outline-none focus:border-primary sm:text-left"
              />
              <button
                type="submit"
                disabled={pending || !code.trim()}
                className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-50"
              >
                Join
              </button>
            </form>
          )}
          {wrongCode && (
            <p className="mt-3 text-xs font-semibold text-destructive">
              That code isn't valid for this session.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}