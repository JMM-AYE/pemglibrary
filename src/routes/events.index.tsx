import { createFileRoute } from "@tanstack/react-router";
import { EventsSection } from "@/components/events-section";

const DESCRIPTION =
  "Upcoming PEMG gatherings, live healing services, partner prayer meetings and conferences — with dates, times and how to join.";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Upcoming Events — PEMG Library" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Upcoming Events — PEMG Library" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow-cool">What's ahead</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Upcoming events</h1>
      <p className="mt-5 max-w-xl text-muted-foreground">{DESCRIPTION}</p>
      <div className="mt-12">
        <EventsSection />
      </div>
    </div>
  );
}