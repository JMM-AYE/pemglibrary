import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SermonCard } from "@/components/sermon-card";
import { YouTubePlayer } from "@/components/youtube-player";
import { formatSermonDate, sermonsQueryOptions } from "@/lib/sermons";

export const Route = createFileRoute("/messages/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(sermonsQueryOptions);
    const sermon = data.sermons.find((s) => s.slug === params.slug);
    if (!sermon) throw notFound();
    return sermon;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — PEMG Library` },
          { name: "description", content: loaderData.summary.slice(0, 155) },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.summary.slice(0, 155) },
          { property: "og:image", content: loaderData.cover },
          { name: "twitter:image", content: loaderData.cover },
        ]
      : [],
  }),
  component: MessagePage,
});

function MessagePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(sermonsQueryOptions);
  const sermon = data.sermons.find((s) => s.slug === slug);
  if (!sermon) return null;
  const related = data.sermons.filter((s) => s.slug !== sermon.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <Link
        to="/messages"
        className="text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        &larr; All messages
      </Link>

      <div className="mt-8">
        <YouTubePlayer sermon={sermon} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="eyebrow">{sermon.series}</p>
          <h1 className="display mt-3 text-[clamp(2.25rem,6vw,4.5rem)]">{sermon.title}</h1>
          <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">
            {sermon.summary}
          </p>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-6">
          <h2 className="display text-lg">Details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Service", sermon.series],
              ["Released", formatSermonDate(sermon.date)],
              ["Views", sermon.views !== null ? sermon.views.toLocaleString() : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={sermon.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-primary"
          >
            Watch on YouTube
          </a>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display text-3xl sm:text-4xl">Keep watching</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <SermonCard key={s.slug} sermon={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
