import { Link } from "@tanstack/react-router";
import { covers } from "@/data/library";
import type { Sermon } from "@/lib/youtube-types";

const fallbackTiles = [
  covers.seriesDawn,
  covers.seriesWord,
  covers.heroAuditorium,
  covers.seriesVoice,
  covers.articleStudy,
  covers.articlePrayer,
];

const COLS = 6;
const ROWS = 6;

/** Tiles that sit in front by default — lit and glowing like the reference wall. */
const heroKeys = new Set(["1-1", "1-3", "2-2", "2-4", "3-1"]);

export function HeroMosaic({ sermons = [] }: { sermons?: Sermon[] }) {
  // Each tile is a distinct sermon so hovering previews the message it opens.
  const wall = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const i = r * COLS + c;
      return sermons.length ? sermons[i % sermons.length] : null;
    }),
  );

  const firstSlug = sermons[0]?.slug;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* poster wall */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-3 sm:gap-5"
        style={{ perspective: "1400px" }}
      >
        {wall.map((row, r) => (
          <div
            key={r}
            className="flex shrink-0 gap-3 sm:gap-5"
            style={{
              transform: `translateX(${r % 2 === 0 ? "-4%" : "-11%"}) rotate(-4deg)`,
            }}
          >
            {row.map((sermon, c) => {
              const isHero = heroKeys.has(`${r}-${c}`);
              const tileClass = `group/tile relative aspect-[16/10] w-[34vw] shrink-0 overflow-hidden rounded-xl transition-all duration-500 ease-[var(--ease-out-expo)] sm:w-[24vw] lg:w-[19vw] ${
                isHero
                  ? "z-10 scale-[1.06] shadow-[var(--shadow-glow)] ring-1 ring-[color-mix(in_oklab,var(--gold)_60%,transparent)]"
                  : "opacity-45 blur-[2px]"
              } hover:z-20 hover:scale-[1.12] hover:opacity-100 hover:blur-0 hover:shadow-[var(--shadow-glow)] hover:ring-2 hover:ring-[color-mix(in_oklab,var(--gold)_80%,transparent)] focus-visible:z-20 focus-visible:scale-[1.12] focus-visible:opacity-100 focus-visible:blur-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`;

              const media = (
                <>
                  <img
                    src={sermon ? sermon.coverFallback : fallbackTiles[(r + c) % 6]}
                    alt={sermon ? sermon.title : ""}
                    loading={r < 2 ? "eager" : "lazy"}
                    width={640}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover/tile:scale-105"
                  />
                  {!isHero && (
                    <span className="absolute inset-0 bg-background/45 transition-opacity duration-500 group-hover/tile:opacity-0" />
                  )}
                  {sermon && (
                    <span className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100">
                      <span className="flex items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-3 w-3 fill-current" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span className="line-clamp-2 text-left text-[11px] font-semibold leading-tight sm:text-xs">
                          {sermon.title}
                        </span>
                      </span>
                    </span>
                  )}
                </>
              );

              return sermon ? (
                <Link
                  key={`${r}-${c}`}
                  to="/messages/$slug"
                  params={{ slug: sermon.slug }}
                  title={sermon.title}
                  className={tileClass}
                >
                  {media}
                </Link>
              ) : (
                <div key={`${r}-${c}`} aria-hidden="true" className={tileClass}>
                  {media}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* atmospheric wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_70%_at_50%_10%,transparent_0%,color-mix(in_oklab,var(--background)_75%,transparent)_55%,var(--background)_100%)]"
      />

      {/* curved brand plate */}
      <div className="relative w-full">
        <div
          aria-hidden="true"
          className="absolute inset-x-[-20%] bottom-0 top-[-6rem] rounded-t-[100%] bg-[radial-gradient(100%_100%_at_50%_100%,color-mix(in_oklab,var(--gold)_16%,var(--background))_0%,var(--background)_70%)] ring-1 ring-[color-mix(in_oklab,var(--gold)_25%,transparent)]"
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-10 text-center sm:px-8 sm:pb-20">
          <h1 className="display text-[clamp(3rem,12vw,7rem)] leading-none">
            <span className="gold-text">PEMG</span> Library
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Pastor Enoch Message Group
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Every message, every series — streaming on demand, with articles that carry the
            Word into everyday life.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {firstSlug && (
              <Link
                to="/messages/$slug"
                params={{ slug: firstSlug }}
                className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.04]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start watching
              </Link>
            )}
            <Link
              to="/messages"
              className="inline-flex items-center gap-3 rounded-full border border-border px-7 py-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              Browse the library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
