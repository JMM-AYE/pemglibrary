import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { articles } from "@/data/library";
import { ArticleCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";

const DESCRIPTION =
  "Short, practical writing on study, prayer, faith and growth — companions to the message library.";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — LivingWord Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Articles — LivingWord Library" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category)))],
    [],
  );
  const [category, setCategory] = useState("All");
  const filtered = articles.filter((a) => category === "All" || a.category === category);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow">The journal</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Articles</h1>
      <p className="mt-5 max-w-xl text-muted-foreground">{DESCRIPTION}</p>

      <div className="mt-12 flex flex-wrap gap-2 border-y border-border py-6">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategory(name)}
            data-active={category === name}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-5">
        {filtered.map((article, i) => (
          <Reveal key={article.slug} delay={i * 70}>
            <ArticleCard article={article} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}