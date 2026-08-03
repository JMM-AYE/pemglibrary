import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articles } from "@/data/library";
import { ArticleCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { devotionalsQueryOptions, formatDevotionalDate } from "@/lib/devotionals";

const DESCRIPTION =
  "Daily devotional readings from Rhapsody of Realities and healing teaching from Healing Streams — companions to the message library.";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Articles — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(devotionalsQueryOptions),
  component: ArticlesPage,
});

const CATEGORIES = ["All", "Rhapsody of Realities", "Healing Streams"] as const;

function ArticlesPage() {
  const { data: devotionals } = useSuspenseQuery(devotionalsQueryOptions);
  const [category, setCategory] = useState<string>("All");
  const healing = articles.filter((a) => a.source === "Healing Streams");
  const showRhapsody = category === "All" || category === "Rhapsody of Realities";
  const showHealing = category === "All" || category === "Healing Streams";

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow-cool">The journal</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Articles</h1>
      <p className="mt-5 max-w-xl text-muted-foreground">{DESCRIPTION}</p>

      <div className="mt-12 flex flex-wrap gap-2 border-y border-border py-6">
        {CATEGORIES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategory(name)}
            data-active={category === name}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-transparent data-[active=true]:bg-[color:var(--sage)] data-[active=true]:text-[color:var(--ink)]"
          >
            {name}
          </button>
        ))}
      </div>

      {showRhapsody && devotionals.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow-cool">Rhapsody of Realities &middot; daily devotional</p>
          <div className="mt-5 grid gap-5">
            {devotionals.map((devotional, i) => (
              <Reveal key={devotional.slug} delay={i * 60}>
                <Link
                  to="/articles/$slug"
                  params={{ slug: devotional.slug }}
                  className="card-lift-cool group flex gap-5 rounded-3xl border border-[color:color-mix(in_oklab,var(--sage)_18%,transparent)] bg-[color:color-mix(in_oklab,var(--ink)_88%,var(--background))] p-4"
                >
                  {devotional.cover && (
                    <div className="hidden h-28 w-36 shrink-0 overflow-hidden rounded-2xl sm:block">
                      <img
                        src={devotional.cover}
                        alt={devotional.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="min-w-0 py-1">
                    <p className="eyebrow-cool">
                      Rhapsody of Realities &middot; {formatDevotionalDate(devotional.date)}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold uppercase leading-snug">
                      {devotional.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {devotional.excerpt}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {showHealing && (
        <section className="mt-14">
          <p className="eyebrow">Healing Streams &middot; teaching</p>
          <div className="mt-5 grid gap-5">
            {healing.map((article, i) => (
              <Reveal key={article.slug} delay={i * 70}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}