import { Link } from "@tanstack/react-router";
import { covers } from "@/data/library";
import { formatSermonDate } from "@/lib/sermons";
import type { Sermon } from "@/lib/youtube-types";

const fallbackTiles = [
  covers.seriesDawn,
  covers.seriesWord,
  covers.heroAuditorium,
  covers.seriesVoice,
  covers.articleStudy,
  covers.articlePrayer,
];

const COLS = 7;
const ROWS = 5;

/** Subtle sermon wall — kept behind the ember wash as texture, not as the subject. */
function PosterWall({ sermons }: { sermons: Sermon[] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 opacity-[0.22] mix-blend-luminosity"
      style={{ perspective: "1400px" }}
    >
      {Array.from({ length: ROWS }, (_, r) => (
        <div
          key={r}
          className="flex shrink-0 gap-4"
          style={{ transform: `translateX(${r % 2 === 0 ? "-6%" : "-13%"}) rotate(-4deg)` }}
        >
          {Array.from({ length: COLS }, (_, c) => {
            const i = r * COLS + c;
            const sermon = sermons.length ? sermons[i % sermons.length] : null;
            return (
              <div
                key={c}
                className="aspect-[16/10] w-[30vw] shrink-0 overflow-hidden rounded-xl sm:w-[22vw] lg:w-[17vw]"
              >
                <img
                  src={sermon ? sermon.coverFallback : fallbackTiles[(r + c) % 6]}
                  alt=""
                  loading={r < 2 ? "eager" : "lazy"}
                  width={640}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function HeroMosaic({ sermons = [] }: { sermons?: Sermon[] }) {
  const exclusive = sermons[0];
  const newMessages = sermons.slice(1, 4);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      {/* ember field */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{ backgroundImage: "var(--gradient-ember)" }}
      />
      <div className="absolute inset-0 -z-10">
        <PosterWall sermons={sermons} />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_20%,transparent_0%,color-mix(in_oklab,var(--ember)_45%,transparent)_60%,color-mix(in_oklab,var(--background)_70%,transparent)_100%)]"
      />

      {/* wordmark */}
      <div className="relative px-4 pt-28 sm:px-8 sm:pt-32">
        <h1 className="display text-center text-[clamp(4rem,19vw,17rem)] leading-[0.82] text-white/95 drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          Library
        </h1>
        <p className="mt-2 text-center text-[0.7rem] uppercase tracking-[0.42em] text-white/70 sm:text-xs">
          Pastor Enoch Message Group
        </p>
      </div>

      {/* content deck */}
      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-end gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
            New messages
          </p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {newMessages.map((sermon) => (
              <Link
                key={sermon.slug}
                to="/messages/$slug"
                params={{ slug: sermon.slug }}
                className="group relative aspect-[16/10] w-56 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/25 transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:ring-2 hover:ring-white/70 sm:w-64"
              >
                <img
                  src={sermon.coverFallback}
                  alt={sermon.title}
                  loading="eager"
                  width={640}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                  <span className="line-clamp-2 text-left text-xs font-semibold leading-tight text-white">
                    {sermon.title}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {exclusive && (
              <Link
                to="/messages/$slug"
                params={{ slug: exclusive.slug }}
                className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[color:var(--ember)] transition-transform duration-300 hover:scale-[1.04]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start watching
              </Link>
            )}
            <Link
              to="/messages"
              className="inline-flex items-center gap-3 rounded-full border border-white/50 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse the library
            </Link>
          </div>

          <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3">
            <span className="font-display text-2xl font-extrabold tracking-tight text-[color:var(--ember)]">
              PEMG
            </span>
            <span aria-hidden="true" className="text-xl text-[color:var(--ember)]">
              &raquo;
            </span>
          </div>
        </div>

        {exclusive && (
          <div className="lg:justify-self-end">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
              Exclusive message of the week
            </p>
            <Link
              to="/messages/$slug"
              params={{ slug: exclusive.slug }}
              className="group mt-4 block overflow-hidden rounded-3xl bg-white/95 shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={exclusive.coverFallback}
                  alt={exclusive.title}
                  loading="eager"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-[color:var(--ember)]">
                    <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-current" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="p-5">
                <p className="line-clamp-2 font-display text-base font-bold uppercase leading-tight text-neutral-900">
                  {exclusive.title}
                </p>
                <p className="mt-2 text-xs text-neutral-600">
                  {exclusive.series} &middot; {formatSermonDate(exclusive.date)} &middot; Watch now
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* fade into the dark page body */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
