import { queryOptions } from "@tanstack/react-query";
import { getPublicStream, getPublicStreams, getAllStreams } from "./live.functions";

export type StreamStatus = "scheduled" | "live" | "ended";
export type StreamVisibility = "public" | "code";
export type StreamSourceType = "youtube" | "hls";

export type LiveStream = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: StreamStatus;
  visibility: StreamVisibility;
  starts_at: string;
  poster_url: string | null;
  published: boolean;
};

export type AdminStream = LiveStream & {
  source_type: StreamSourceType;
  source_value: string;
  access_code: string;
};

export const streamsQueryOptions = queryOptions({
  queryKey: ["streams", "public"],
  queryFn: () => getPublicStreams(),
  staleTime: 1000 * 30,
  refetchInterval: 1000 * 60,
});

export const streamQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["streams", "detail", slug],
    queryFn: () => getPublicStream({ data: { slug } }),
    staleTime: 1000 * 20,
  });

export const adminStreamsQueryOptions = queryOptions({
  queryKey: ["streams", "admin"],
  queryFn: () => getAllStreams(),
  staleTime: 0,
});

export function formatStreamStart(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

export const STATUS_LABEL: Record<StreamStatus, string> = {
  scheduled: "Scheduled",
  live: "Live now",
  ended: "Replay",
};