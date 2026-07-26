import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { messages } from "@/data/library";
import { MessageCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";

const DESCRIPTION =
  "Every teaching series in one place. Filter by series, search by title and stream full-length messages.";

export const Route = createFileRoute("/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — LivingWord Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Messages — LivingWord Library" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const seriesList = useMemo(
    () => ["All", ...Array.from(new Set(messages.map((m) => m.series)))],
    [],
  );
  const [series, setSeries] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = messages.filter((m) => {
    const matchesSeries = series === "All" || m.series === series;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q);
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
          {filtered.map((message, i) => (
            <Reveal key={message.slug} delay={i * 70}>
              <MessageCard message={message} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}