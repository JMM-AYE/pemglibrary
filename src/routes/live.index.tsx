import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/reveal";
import { ReminderButton } from "@/components/reminder-button";
import { formatStreamStart, STATUS_LABEL, streamsQueryOptions, type LiveStream } from "@/lib/live";

const DESCRIPTION =
  "Watch PEMG live services and private sessions inside the library — no need to leave for another app.";

export const Route = createFileRoute("/live/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(streamsQueryOptions),
  head: () => ({
    meta: [
      { title: "Live sessions — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Live sessions — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveIndexPage,
});

function LiveIndexPage() {
  const { data } = useSuspenseQuery(streamsQueryOptions);
  const streams = (data ?? []) as LiveStream[];
  const liveNow = streams.filter((s) => s.status === "live");
  const upcoming = streams
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = streams.filter((s) => s.status === "ended");

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow">Streaming</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Live</h1>
      <p className="mt-5 max-w-xl text-muted-foreground">{DESCRIPTION}</p>

      {streams.length === 0 && (
        <p className="mt-16 text-muted-foreground">
          No sessions scheduled yet. Check back soon — or set a reminder on a message in the
          meantime.
        </p>
      )}

      <Section title="On air" items={liveNow} />
      <Section title="Coming up" items={upcoming} />
      <Section title="Past sessions" items={past} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: LiveStream[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((stream, i) => (
          <Reveal key={stream.id} delay={i * 70}>
            <StreamCard stream={stream} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function StreamCard({ stream }: { stream: LiveStream }) {
  return (
    <article className="card-lift overflow-hidden rounded-3xl border border-border bg-surface">
      <Link to="/live/$slug" params={{ slug: stream.slug }} className="block">
        <div className="relative aspect-video overflow-hidden bg-background">
          {stream.poster_url ? (
            <img
              src={stream.poster_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[image:var(--gradient-ember)] opacity-70" />
          )}
          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
              stream.status === "live"
                ? "bg-primary text-primary-foreground"
                : "bg-background/75 backdrop-blur"
            }`}
          >
            {stream.status === "live" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true" />
            )}
            {STATUS_LABEL[stream.status]}
          </span>
          {stream.visibility === "code" && (
            <span className="absolute right-4 top-4 rounded-full bg-background/75 px-3 py-1 text-[11px] font-semibold backdrop-blur">
              Private
            </span>
          )}
        </div>
      </Link>
      <div className="p-6">
        <Link to="/live/$slug" params={{ slug: stream.slug }}>
          <h3 className="font-display text-xl font-bold leading-tight">{stream.title}</h3>
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">{formatStreamStart(stream.starts_at)}</p>
        {stream.status !== "ended" && (
          <ReminderButton
            className="mt-5 w-full"
            kind="stream"
            targetId={stream.slug}
            title={stream.title}
            href={`/live/${stream.slug}`}
            posterUrl={stream.poster_url}
            remindAt={stream.starts_at}
            labels={{ on: "You'll be notified", off: "Notify me" }}
          />
        )}
      </div>
    </article>
  );
}