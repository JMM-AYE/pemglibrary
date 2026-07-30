import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SermonCard } from "@/components/sermon-card";
import { Reveal } from "@/components/reveal";
import { sermonsQueryOptions } from "@/lib/sermons";

const DESCRIPTION =
  "Every message from the Pastor Enoch channel in one place. Filter by service, search by title and stream full-length messages.";

export const Route = createFileRoute("/messages/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(sermonsQueryOptions),
  head: () => ({
    meta: [
      { title: "Messages — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Messages — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { data } = useSuspenseQuery(sermonsQueryOptions);
  const sermons = data.sermons;

  const seriesList = useMemo(
    () => ["All", ...Array.from(new Set(sermons.map((s) => s.series)))],
    [sermons],
  );
  const [series, setSeries] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = sermons.filter((s) => {
    const matchesSeries = series === "All" || s.series === series;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q);
    return matchesSeries && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow">Video library</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Messages</h1>
      <p className="mt-5 max-w-xl text-muted-foreground">{DESCRIPTION}</p>

      <div className="mt-12 flex flex-col gap-5 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {seriesList.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSeries(name)}
              data-active={series === name}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            >
              {name}
            </button>
          ))}
        </div>
        <label className="lg:w-72">
          <span className="sr-only">Search messages</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages"
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-muted-foreground">No messages match that search yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sermon, i) => (
            <Reveal key={sermon.slug} delay={i * 70}>
              <SermonCard sermon={sermon} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
