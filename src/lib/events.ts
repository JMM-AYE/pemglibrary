import { queryOptions } from "@tanstack/react-query";
import { getAllEvents, getPublicEvent, getPublicEvents } from "./events.functions";

export type LibraryEvent = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  starts_at: string;
  location: string;
  summary: string;
  cta: string;
  href: string;
  image_url: string | null;
  published: boolean;
};

export const eventsQueryOptions = queryOptions({
  queryKey: ["events", "public"],
  queryFn: () => getPublicEvents(),
  staleTime: 1000 * 60 * 5,
});

export const adminEventsQueryOptions = queryOptions({
  queryKey: ["events", "admin"],
  queryFn: () => getAllEvents(),
  staleTime: 0,
});

export const eventQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["events", "detail", slug],
    queryFn: () => getPublicEvent({ data: { slug } }),
    staleTime: 1000 * 60 * 5,
  });

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

export function eventDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" });
}

export function eventMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
}
