import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articles, formatDate, type Article } from "@/data/library";
import { ArticleCard } from "@/components/cards";
import { devotionalsQueryOptions, formatDevotionalDate } from "@/lib/devotionals";
import type { Devotional } from "@/lib/rhapsody.server";

type LoaderData =
  | { kind: "article"; article: Article }
  | { kind: "devotional"; devotional: Devotional; more: Devotional[] };

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params, context }): Promise<LoaderData> => {
    const article = articles.find((a) => a.slug === params.slug);
    if (article) return { kind: "article", article };

    const devotionals = await context.queryClient.ensureQueryData(devotionalsQueryOptions);
    const devotional = devotionals.find((d) => d.slug === params.slug);
    if (!devotional) throw notFound();
    return {
      kind: "devotional",
      devotional,
      more: devotionals.filter((d) => d.slug !== devotional.slug).slice(0, 3),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const title =
      loaderData.kind === "article" ? loaderData.article.title : loaderData.devotional.title;
    const description =
      loaderData.kind === "article" ? loaderData.article.excerpt : loaderData.devotional.excerpt;
    return {
      meta: [
        { title: `${title} — PEMG Library` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const data = Route.useLoaderData();
  if (data.kind === "devotional") {
    return <DevotionalPage devotional={data.devotional} more={data.more} />;
  }
  const article = data.article;
  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <Link
        to="/articles"
        className="text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        &larr; All articles
      </Link>

      <p className="eyebrow mt-8">
        {article.source} &middot; {article.category} &middot; {article.readTime} &middot;{" "}
        {formatDate(article.date)}
      </p>
      <h1 className="display mt-4 text-[clamp(2.25rem,6vw,4rem)]">{article.title}</h1>

      <img
        src={article.cover}
        alt={article.title}
        loading="lazy"
        width={1280}
        height={800}
        className="mt-10 aspect-[16/9] w-full rounded-3xl border border-border object-cover"
      />

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground">
        {article.scripture && (
          <p className="rounded-3xl border border-border bg-surface p-6 text-base italic text-foreground">
            {article.scripture}
          </p>
        )}
        <p className="text-xl text-foreground">{article.excerpt}</p>
        {article.body.map((paragraph: string) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {article.confession && (
          <div className="rounded-3xl border border-border bg-surface p-6">
            <p className="eyebrow">Confession</p>
            <p className="mt-3 text-base text-foreground">{article.confession}</p>
          </div>
        )}
        <p className="text-sm">
          Adapted from{" "}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            {article.source}
          </a>
          .
        </p>
      </div>

      <section className="mt-20">
        <h2 className="display text-2xl">Read next</h2>
        <div className="mt-6 grid gap-5">
          {more.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </article>
  );
}