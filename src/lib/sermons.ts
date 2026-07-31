import { queryOptions } from "@tanstack/react-query";
import { getSermons } from "./youtube.functions";

export const sermonsQueryOptions = queryOptions({
  queryKey: ["sermons"],
  queryFn: () => getSermons(),
  staleTime: 1000 * 60 * 10,
});

export function formatSermonDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
