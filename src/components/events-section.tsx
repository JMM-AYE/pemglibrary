import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import {
  eventDay,
  eventMonth,
  eventsQueryOptions,
  formatEventDate,
  formatEventTime,
  type LibraryEvent,
} from "@/lib/events";

/** Cream "ticket" bills — cool editorial contrast to the warm hero. */
export function EventsSection({ limit }: { limit?: number }) {
  const { data, isLoading } = useQuery(eventsQueryOptions);
  const all = (data ?? []) as LibraryEvent[];
  const list = limit ? all.slice(0, limit) : all;

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {Array.from({ length: limit ?? 3 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[2rem] bg-surface" />
        ))}
      </div>
    );
  }

  if (!list.length) {
    return (
      <p className="rounded-[2rem] border border-border bg-surface p-8 text-sm text-muted-foreground">
        No events scheduled right now — check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:gap-7">
      {list.map((event, i) => (
        <Reveal key={event.id} delay={i * 80}>
          <article className="card-lift-cool group relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 overflow-hidden rounded-[1.75rem] rounded-tl-[0.4rem] border border-[color:var(--parchment-2)] bg-[color:var(--parchment)] p-5 text-[color:var(--ink)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-7 sm:rounded-[2rem] sm:rounded-tl-[0.5rem] sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(80% 130% at 100% 0%, color-mix(in oklab, var(--sage) 26%, transparent) 0%, transparent 68%)",
              }}
            />

            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-[1.4rem] rounded-bl-[0.4rem] bg-[color:var(--ink)] text-[color:var(--parchment)] sm:h-24 sm:w-24">
              <div className="text-center">
                <p className="display text-3xl leading-none sm:text-4xl">
                  {eventDay(event.starts_at)}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--sage)]">
                  {eventMonth(event.starts_at)}
                </p>
              </div>
            </div>

            <div className="relative min-w-0">
              <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--sage-deep)]">
                {event.kind}
              </p>
              <h3 className="mt-2 font-display text-xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-3xl">
                <Link
                  to="/events/$slug"
                  params={{ slug: event.slug }}
                  className="after:absolute after:inset-0 hover:text-[color:var(--sage-deep)]"
                >
                  {event.title}
                </Link>
              </h3>
              {event.summary && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--ink)]/70">
                  {event.summary}
                </p>
              )}
              <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--ink)]/55">
                {formatEventDate(event.starts_at)} &middot; {formatEventTime(event.starts_at)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>

            <Link
              to="/events/$slug"
              params={{ slug: event.slug }}
              className="relative z-10 col-span-2 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--parchment)] transition-transform duration-300 hover:scale-[1.04] sm:col-span-1 sm:px-7 sm:py-4"
            >
              {event.cta}
              <span aria-hidden="true">&#8594;</span>
            </Link>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
