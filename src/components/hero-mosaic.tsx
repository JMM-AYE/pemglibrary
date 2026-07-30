import { Link } from "@tanstack/react-router";
import { covers, messages } from "@/data/library";

const tiles = [
  covers.seriesDawn,
  covers.seriesWord,
  covers.heroAuditorium,
  covers.seriesVoice,
  covers.articleStudy,
  covers.articlePrayer,
];

/** Rows of the poster wall. `hero` tiles sit in front, lit and glowing. */
const rows = [
  [0, 1, 2, 3, 4, 5],
  [5, 2, 0, 1, 3, 4],
  [4, 3, 5, 2, 0, 1],
  [1, 0, 4, 5, 2, 3],
  [2, 5, 1, 3, 4, 0],
  [3, 4, 2, 0, 5, 1],
];

const heroKeys = new Set(["1-1", "1-3", "2-2", "2-4", "3-1"]);

export function HeroMosaic() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* poster wall */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-3 sm:gap-5"
        style={{ perspective: "1400px" }}
      >
        {rows.map((row, r) => (
          <div
            key={r}
            className="flex shrink-0 gap-3 sm:gap-5"
            style={{
              transform: `translateX(${r % 2 === 0 ? "-4%" : "-11%"}) rotate(-4deg)`,
            }}
          >
            {row.map((t, c) => {
              const isHero = heroKeys.has(`${r}-${c}`);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative aspect-[16/10] w-[34vw] shrink-0 overflow-hidden rounded-xl sm:w-[24vw] lg:w-[19vw] ${
                    isHero
                      ? "z-10 scale-[1.06] shadow-[var(--shadow-glow)] ring-1 ring-[color-mix(in_oklab,var(--gold)_60%,transparent)]"
                      : "opacity-45 blur-[2px]"
                  }`}
                >
                  <img
                    src={tiles[t]}
                    alt=""
                    loading={r < 2 ? "eager" : "lazy"}
                    width={640}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                  {!isHero && <span className="absolute inset-0 bg-background/45" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* atmospheric wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_10%,transparent_0%,color-mix(in_oklab,var(--background)_75%,transparent)_55%,var(--background)_100%)]"
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
            <Link
              to="/messages/$slug"
              params={{ slug: messages[0].slug }}
              className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.04]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start watching
            </Link>
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