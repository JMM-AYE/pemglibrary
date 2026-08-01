import { events, formatEventDate, formatEventTime } from "@/data/events";
import { Reveal } from "@/components/reveal";

export function EventsSection({ limit }: { limit?: number }) {
  const list = limit ? events.slice(0, limit) : events;

  return (
    <div className="grid gap-4">
      {list.map((event, i) => (
        <Reveal key={event.slug} delay={i * 70}>
          <article className="card-lift grid gap-5 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="rounded-2xl border border-border bg-background px-5 py-4 text-center">
              <p className="display text-3xl leading-none">
                {new Date(event.start).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  timeZone: "UTC",
                })}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {new Date(event.start).toLocaleDateString("en-GB", {
                  month: "short",
                  timeZone: "UTC",
                })}
              </p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">{event.kind}</p>
              <h3 className="mt-2 font-display text-xl font-bold leading-tight">{event.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{event.summary}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatEventDate(event.start)} &middot; {formatEventTime(event.start)} &middot;{" "}
                {event.location}
              </p>
            </div>
            <a
              href={event.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              {event.cta}
            </a>
          </article>
        </Reveal>
      ))}
    </div>
  );
}