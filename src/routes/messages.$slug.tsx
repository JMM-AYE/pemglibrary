import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatDate, messages } from "@/data/library";
import { MessageCard } from "@/components/cards";
import { VideoPlayer } from "@/components/video-player";

export const Route = createFileRoute("/messages/$slug")({
  loader: ({ params }) => {
    const message = messages.find((m) => m.slug === params.slug);
    if (!message) throw notFound();
    return message;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — PEMG Library` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.summary },
        ]
      : [],
  }),
  component: MessagePage,
});

function MessagePage() {
  const message = Route.useLoaderData();
  const related = messages.filter((m) => m.slug !== message.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <Link
        to="/messages"
        className="text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        &larr; All messages
      </Link>

      <div className="mt-8">
        <VideoPlayer src={message.video} poster={message.cover} title={message.title} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="eyebrow">
            {message.series} &middot; {message.part}
          </p>
          <h1 className="display mt-3 text-[clamp(2.25rem,6vw,4.5rem)]">{message.title}</h1>
          <p className="mt-6 text-lg text-muted-foreground">{message.summary}</p>

          <h2 className="display mt-12 text-2xl">Message notes</h2>
          <ul className="mt-5 space-y-4">
            {message.notes.map((note: string) => (
              <li key={note} className="flex gap-4 border-b border-border pb-4 text-sm">
                <span className="text-primary" aria-hidden="true">
                  &#9679;
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-6">
          <h2 className="display text-lg">Details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Scripture", message.scripture],
              ["Duration", message.duration],
              ["Language", message.language],
              ["Released", formatDate(message.date)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <section className="mt-24">
        <h2 className="display text-3xl sm:text-4xl">Keep watching</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {related.map((m) => (
            <MessageCard key={m.slug} message={m} />
          ))}
        </div>
      </section>
    </div>
  );
}