import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articles, formatDate } from "@/data/library";
import { ArticleCard } from "@/components/cards";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — PEMG Library` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
        ]
      : [],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const article = Route.useLoaderData();
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
        {article.category} &middot; {article.readTime} &middot; {formatDate(article.date)}
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
        <p className="text-xl text-foreground">{article.excerpt}</p>
        {article.body.map((paragraph: string) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
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