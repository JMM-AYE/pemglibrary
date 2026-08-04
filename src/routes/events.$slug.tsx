import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  eventDay,
  eventMonth,
  eventQueryOptions,
  formatEventDate,
  formatEventTime,
  type LibraryEvent,
} from "@/lib/events";

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ context, params }) => {
    const event = await context.queryClient.ensureQueryData(eventQueryOptions(params.slug));
    if (!event) throw notFound();
    return event as LibraryEvent;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — PEMG Library` : "Event — PEMG Library";
    const description = loaderData?.summary
      ? loaderData.summary.slice(0, 155)
      : "Details, date, time and location for this PEMG gathering.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData?.image_url?.startsWith("https://")
          ? [
              { property: "og:image", content: loaderData.image_url },
              { name: "twitter:image", content: loaderData.image_url },
            ]
          : []),
      ],
    };
  },
  component: EventDetailPage,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <h1 className="display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">We couldn't load this event right now.</p>
      <Link to="/events" className="mt-8 inline-block text-sm underline underline-offset-4">
        Back to all events
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <h1 className="display text-4xl">Event not found</h1>
      <p className="mt-4 text-muted-foreground">This event may have ended or been unpublished.</p>
      <Link to="/events" className="mt-8 inline-block text-sm underline underline-offset-4">
        Back to all events
      </Link>
    </div>
  ),
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(eventQueryOptions(slug));
  const event = data as LibraryEvent | null;
  if (!event) return null;

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8">
      <Link
        to="/events"
        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        &larr; All events
      </Link>

      <article className="mt-8 overflow-hidden rounded-[2rem] border border-[color:var(--parchment-2)] bg-[color:var(--parchment)] p-6 text-[color:var(--ink)] sm:p-10">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[1.4rem] rounded-bl-[0.4rem] bg-[color:var(--ink)] text-[color:var(--parchment)]">
            <div className="text-center">
              <p className="display text-4xl leading-none">{eventDay(event.starts_at)}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--sage)]">
                {eventMonth(event.starts_at)}
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--sage-deep)]">
              {event.kind}
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,5vw,3.25rem)] font-extrabold uppercase leading-[1.02] tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            className="mt-8 aspect-[16/9] w-full rounded-[1.5rem] object-cover"
          />
        )}

        {event.summary && (
          <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-[color:var(--ink)]/75">
            {event.summary}
          </p>
        )}

        <dl className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Date", formatEventDate(event.starts_at)],
            ["Time", formatEventTime(event.starts_at)],
            ["Location", event.location || "To be announced"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[color:var(--ink)]/5 p-4">
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[color:var(--ink)]/55">
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          {event.href && (
            <a
              href={event.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--parchment)]"
            >
              {event.cta}
              <span aria-hidden="true">&#8599;</span>
            </a>
          )}
          <Link
            to="/messages"
            className="inline-flex items-center rounded-full border border-[color:var(--ink)]/25 px-7 py-4 text-xs font-bold uppercase tracking-[0.16em]"
          >
            Watch messages
          </Link>
        </div>
      </article>
    </div>
  );
}