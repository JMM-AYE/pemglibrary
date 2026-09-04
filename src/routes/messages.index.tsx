import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { SermonCard } from "@/components/sermon-card";
import { Reveal } from "@/components/reveal";
import { sermonsQueryOptions } from "@/lib/sermons";

const DESCRIPTION =
  "Every message from the Pastor Enoch channel in one place. Filter by service, search by title and stream full-length messages.";

const PAGE_SIZE = 12;

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "popular", label: "Most watched" },
  { id: "az", label: "A–Z" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

export const Route = createFileRoute("/messages/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(sermonsQueryOptions),
  head: () => ({
    meta: [
      { title: "Messages — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Messages — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { data } = useSuspenseQuery(sermonsQueryOptions);
  const sermons = data.sermons;

  // Playlist names come from YouTube; keep only the ones that have videos.
  const seriesList = useMemo(() => {
    const present = new Set(sermons.map((s) => s.series));
    const ordered = (data.series ?? []).filter((name) => present.has(name));
    const extras = [...present].filter((name) => !ordered.includes(name));
    return ["All", ...ordered, ...extras];
  }, [sermons, data.series]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sermons) map.set(s.series, (map.get(s.series) ?? 0) + 1);
    return map;
  }, [sermons]);

  const [series, setSeries] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const list = sermons.filter((s) => {
      if (series !== "All" && s.series !== series) return false;
      if (words.length === 0) return true;
      const haystack = `${s.title} ${s.summary} ${s.series}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "popular") return (b.views ?? 0) - (a.views ?? 0);
      return b.date.localeCompare(a.date);
    });
    return sorted;
  }, [sermons, series, query, sort]);

  // Reset the window whenever the result set changes.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [series, query, sort]);

  const sentinel = useRef<HTMLDivElement | null>(null);
  const hasMore = visible < filtered.length;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, filtered.length]);

  const shown = filtered.slice(0, visible);
  const isFiltered = series !== "All" || query.trim() !== "" || sort !== "newest";

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow">Video library</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Messages</h1>
      <p className="mt-5 max-w-xl text-muted-foreground">{DESCRIPTION}</p>

      <div className="sticky top-0 z-30 -mx-5 mt-12 bg-background/85 px-5 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-5 border-y border-border py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative lg:w-80">
              <span className="sr-only">Search messages</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, topic or service"
                className="w-full rounded-full border border-border bg-surface px-5 py-3 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-primary"
                >
                  ✕
                </button>
              )}
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Sort
              </span>
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
                  data-active={sort === s.id}
                  className="rounded-full border border-border px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

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
                <span className="ml-2 opacity-70">
                  {name === "All" ? sermons.length : (counts.get(name) ?? 0)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              Showing {shown.length} of {filtered.length}
              {filtered.length === 1 ? " message" : " messages"}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSeries("All");
                  setQuery("");
                  setSort("newest");
                }}
                className="font-bold uppercase tracking-[0.14em] hover:text-primary"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-muted-foreground">No messages match that search yet.</p>
      ) : (
        <>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((sermon, i) => (
              <Reveal key={sermon.slug} delay={(i % PAGE_SIZE) * 60}>
                <SermonCard sermon={sermon} />
              </Reveal>
            ))}
          </div>

          <div ref={sentinel} className="h-px" aria-hidden="true" />

          {hasMore ? (
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {Array.from({ length: Math.min(3, filtered.length - visible) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-3xl border border-border bg-surface"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))}
                className="rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:border-primary"
              >
                Load more messages
              </button>
            </div>
          ) : (
            <p className="mt-12 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
              You've reached the end of the library
            </p>
          )}
        </>
      )}
    </div>
  );
}
