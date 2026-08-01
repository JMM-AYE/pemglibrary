export type LibraryEvent = {
  slug: string;
  title: string;
  kind: string;
  start: string;
  location: string;
  summary: string;
  cta: string;
  href: string;
};

export const events: LibraryEvent[] = [
  {
    slug: "healing-streams-live-healing-services",
    title: "Healing Streams Live Healing Services",
    kind: "Global broadcast",
    start: "2026-08-14T18:00:00Z",
    location: "Streaming worldwide",
    summary:
      "Three days of healing ministration broadcast to every continent. Register your viewing centre and invite the sick and afflicted around you.",
    cta: "Register a centre",
    href: "https://www.healingstreams.tv/",
  },
  {
    slug: "rhapsody-partners-monthly-prayer",
    title: "Rhapsody Partners' Monthly Prayer",
    kind: "Prayer meeting",
    start: "2026-08-21T17:00:00Z",
    location: "Online · PEMG Prayer Room",
    summary:
      "An hour of focused intercession for the distribution of the daily devotional into every home, school and prison.",
    cta: "Join the prayer",
    href: "https://rhapsodyofrealities.org/",
  },
  {
    slug: "higher-life-conference",
    title: "The Higher Life Conference",
    kind: "Conference",
    start: "2026-09-04T09:00:00Z",
    location: "Abuja Zone 1 Auditorium",
    summary:
      "Two days of teaching with Pastor Enoch on living from above — sessions on the Word, prayer and the ministry of the Spirit.",
    cta: "Reserve a seat",
    href: "mailto:info@pemglibrary.org?subject=Higher%20Life%20Conference",
  },
  {
    slug: "midweek-word-clinic",
    title: "Midweek Word Clinic",
    kind: "Weekly · Wednesdays",
    start: "2026-08-05T18:30:00Z",
    location: "Live on the PEMG channel",
    summary:
      "A live teaching and Q&A session that unpacks the message of the week and the current devotional theme.",
    cta: "Set a reminder",
    href: "https://www.youtube.com/channel/UCrQeaCXWuaUa3pgAjvdUqnw",
  },
];

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatEventTime(iso: string) {
  return `${new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })} UTC`;
}