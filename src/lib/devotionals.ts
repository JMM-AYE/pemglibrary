import { queryOptions } from "@tanstack/react-query";
import { getDevotionals } from "./rhapsody.functions";

export const devotionalsQueryOptions = queryOptions({
  queryKey: ["devotionals"],
  queryFn: () => getDevotionals(),
  staleTime: 1000 * 60 * 60 * 6,
  gcTime: 1000 * 60 * 60 * 24,
});

export function formatDevotionalDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}