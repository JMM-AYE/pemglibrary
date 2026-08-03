import { Link } from "@tanstack/react-router";
import pastorEnoch from "@/assets/pastor-enoch.png.asset.json";
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

const COLS = 6;
const ROWS = 4;

/** Sermon wall kept as a whisper of texture behind the ember field. */
function PosterWall({ sermons }: { sermons: Sermon[] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-3 opacity-[0.14] mix-blend-luminosity"
      style={{ perspective: "1400px" }}
    >
      {Array.from({ length: ROWS }, (_, r) => (
        <div
          key={r}
          className="flex shrink-0 gap-3"
          style={{ transform: `translateX(${r % 2 === 0 ? "-8%" : "-15%"}) rotate(-5deg)` }}
        >
          {Array.from({ length: COLS }, (_, c) => {
            const i = r * COLS + c;
            const sermon = sermons.length ? sermons[i % sermons.length] : null;
            return (
              <div
                key={c}
                className="aspect-[16/10] w-[34vw] shrink-0 overflow-hidden rounded-xl sm:w-[24vw]"
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

export function HeroStage({ sermons = [] }: { sermons?: Sermon[] }) {
  const exclusive = sermons[0];
  const upNext = sermons.slice(1, 4);

  return (
    <section className="px-3 pt-24 sm:px-5 sm:pt-28">
      <div className="relative isolate mx-auto grid w-full max-w-[100rem] overflow-hidden rounded-[1.75rem] sm:rounded-[2.75rem] lg:grid-cols-[1.55fr_1fr]">
        {/* ---------- ember stage ---------- */}
        <div className="relative isolate min-h-[32rem] overflow-hidden sm:min-h-[40rem] lg:min-h-[44rem]">
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
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_62%_38%,color-mix(in_oklab,var(--ember-2)_60%,transparent)_0%,transparent_70%)]"
          />

          {/* Pastor Enoch cutout — sits low-right and never crowds the wordmark. */}
          <img
            src={pastorEnoch.url}
            alt="Pastor Enoch"
            loading="eager"
            className="pointer-events-none absolute bottom-0 right-[-14%] z-0 h-[56%] w-auto max-w-none object-contain object-bottom drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)] xs:right-[-8%] sm:right-[-4%] sm:h-[70%] md:right-0 md:h-[80%] lg:right-[6%] lg:h-[88%]"
          />

          <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-6 sm:gap-10 sm:p-10 lg:p-12">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-white/85 sm:text-sm">
                PEMG <span className="text-white/55">Library</span>
              </p>
              <h1 className="display mt-5 text-[clamp(3rem,14vw,9rem)] leading-[0.84] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:mt-8 lg:text-[clamp(5rem,9vw,9rem)]">
                Library
              </h1>
              <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-white/85 sm:mt-6 sm:max-w-xs sm:text-base">
                Messages that build faith.
                <br />
                The Word, on demand.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
                <Link
                  to="/messages"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[color:var(--ember)] transition-transform duration-300 hover:scale-[1.04] sm:px-7 sm:py-4 sm:text-xs"
                >
                  Watch messages
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &#8599;
                  </span>
                </Link>
                <Link
                  to="/articles"
                  className="inline-flex items-center rounded-full border border-white/50 px-5 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/10 sm:px-7 sm:py-4 sm:text-xs"
                >
                  Daily devotional
                </Link>
              </div>
            </div>

            <div className="max-w-xs rounded-2xl bg-black/15 p-3 backdrop-blur-[2px] sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {upNext.map((sermon) => (
                    <img
                      key={sermon.slug}
                      src={sermon.coverFallback}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-full border-2 border-white/80 object-cover"
                    />
                  ))}
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[11px] font-bold text-[color:var(--ember)]">
                  380+
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/80">
                Hundreds of messages from Pastor Enoch, streamed free worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* ---------- light rail ---------- */}
        <div className="flex flex-col justify-between gap-8 bg-[oklch(0.97_0.006_80)] p-7 text-neutral-900 sm:p-10">
          <div>
            <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[color:var(--ember)]">
              Now streaming
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[color:var(--ember)]" />
            </p>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
              Exclusive
              <br />
              message of
              <br />
              the week
            </h2>
          </div>

          {exclusive && (
            <Link
              to="/messages/$slug"
              params={{ slug: exclusive.slug }}
              className="group block overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
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
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[color:var(--ember)]">
                    <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 fill-current" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="p-5">
                <p className="line-clamp-2 font-display text-sm font-bold uppercase leading-tight">
                  {exclusive.title}
                </p>
                <p className="mt-2 text-xs text-neutral-600">
                  {exclusive.series} &middot; {formatSermonDate(exclusive.date)}
                </p>
              </div>
            </Link>
          )}

          <div className="rounded-3xl bg-neutral-900 p-5 text-white">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-white/60">
              Up next
            </p>
            <ul className="mt-3 grid gap-3">
              {upNext.map((sermon) => (
                <li key={sermon.slug}>
                  <Link
                    to="/messages/$slug"
                    params={{ slug: sermon.slug }}
                    className="group flex items-center gap-3"
                  >
                    <img
                      src={sermon.coverFallback}
                      alt=""
                      loading="lazy"
                      className="h-11 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <span className="line-clamp-2 min-w-0 text-xs font-semibold leading-snug text-white/85 transition-colors group-hover:text-[color:var(--gold)]">
                      {sermon.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
