import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articles } from "@/data/library";
import { formatSermonDate, sermonsQueryOptions } from "@/lib/sermons";
import { SermonCard, SermonThumb } from "@/components/sermon-card";
import { HeroMosaic } from "@/components/hero-mosaic";
import { ArticleCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { EventsSection } from "@/components/events-section";

const DESCRIPTION =
  "Watch teaching series in full, catch the latest message and read articles that take the Word into everyday life.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PEMG Library — Messages & Articles" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "PEMG Library — Messages & Articles" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sermonsQueryOptions),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(sermonsQueryOptions);
  const featured = data.sermons[0];
  const latest = data.sermons.slice(1, 7);

  if (!featured) return <HeroMosaic sermons={data.sermons} />;

  return (
    <>
      <HeroMosaic sermons={data.sermons} />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 border-y border-border py-10 md:grid-cols-4">
            {[
              ["380+", "Messages"],
              ["24", "Series"],
              ["12", "Languages"],
              ["Weekly", "New uploads"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="display text-4xl sm:text-5xl">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">Now playing</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <Link
              to="/messages/$slug"
              params={{ slug: featured.slug }}
              className="group relative block aspect-video overflow-hidden rounded-3xl border border-border"
            >
              <SermonThumb
                sermon={featured}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-background/30">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-500 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </Link>
            <div>
              <p className="eyebrow">{featured.series}</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">{featured.title}</h2>
              <p className="mt-5 line-clamp-4 text-muted-foreground">{featured.summary}</p>
              <p className="mt-6 text-sm text-muted-foreground">
                {featured.series} &middot; {formatSermonDate(featured.date)}
              </p>
              <Link
                to="/messages/$slug"
                params={{ slug: featured.slug }}
                className="mt-8 inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                Watch the message <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-4xl sm:text-6xl">Latest messages</h2>
          <Link
            to="/messages"
            className="shrink-0 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((sermon, i) => (
            <Reveal key={sermon.slug} delay={i * 90}>
              <SermonCard sermon={sermon} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="display text-4xl sm:text-6xl">
              From the <span className="gold-text">journal</span>
            </h2>
            <Link
              to="/articles"
              className="shrink-0 text-sm font-semibold text-muted-foreground hover:text-primary"
            >
              All articles &rarr;
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Daily readings from Rhapsody of Realities and healing teaching from Healing Streams.
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {articles.slice(0, 4).map((article, i) => (
              <Reveal key={article.slug} delay={i * 80}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-4xl sm:text-6xl">
            Upcoming <span className="gold-text">events</span>
          </h2>
          <Link
            to="/events"
            className="shrink-0 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            All events &rarr;
          </Link>
        </div>
        <div className="mt-10">
          <EventsSection limit={3} />
        </div>
      </section>
    </>
  );
}
