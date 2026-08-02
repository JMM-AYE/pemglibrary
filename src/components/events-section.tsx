import { events, formatEventDate, formatEventTime } from "@/data/events";
import { Reveal } from "@/components/reveal";
import { covers } from "@/data/library";

const art = [covers.heroAuditorium, covers.seriesWord, covers.seriesDawn, covers.seriesVoice];

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" });
}

function month(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
}

/** Poster-style bill: alternating "ticket bubbles" over a dark textured field. */
export function EventsSection({ limit }: { limit?: number }) {
  const list = limit ? events.slice(0, limit) : events;

  return (
    <div className="grid gap-6 sm:gap-8">
      {list.map((event, i) => {
        const flip = i % 2 === 1;
        return (
          <Reveal key={event.slug} delay={i * 80}>
            <article
              data-flip={flip}
              className="card-lift group relative grid gap-6 overflow-hidden rounded-[2rem] border border-border bg-surface p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6 data-[flip=true]:rounded-tr-[0.4rem] data-[flip=false]:rounded-tl-[0.4rem]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage: `radial-gradient(70% 120% at ${flip ? "100%" : "0%"} 0%, color-mix(in oklab, var(--ember) 22%, transparent) 0%, transparent 70%)`,
                }}
              />

              <div className="relative flex items-center gap-4 sm:flex-col sm:gap-0">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[1.6rem] rounded-bl-[0.4rem] bg-[color:var(--ember)] text-white">
                  <div className="text-center">
                    <p className="display text-4xl leading-none">{day(event.start)}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80">
                      {month(event.start)}
                    </p>
                  </div>
                </div>
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-[1.2rem] rounded-tr-[0.4rem] sm:mt-3">
                  <img
                    src={art[i % art.length]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="relative min-w-0">
                <p className="eyebrow">{event.kind}</p>
                <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-3xl">
                  {event.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">{event.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {formatEventDate(event.start)} &middot; {formatEventTime(event.start)} &middot;{" "}
                  {event.location}
                </p>
              </div>

              <a
                href={event.href}
                target="_blank"
                rel="noreferrer"
                className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--ember)] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-transform duration-300 hover:scale-[1.04]"
              >
                {event.cta}
                <span aria-hidden="true">&#8599;</span>
              </a>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}