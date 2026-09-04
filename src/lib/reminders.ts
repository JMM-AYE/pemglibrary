import { queryOptions } from "@tanstack/react-query";
import { getMyNotifications, getMyReminders } from "./reminders.functions";

export type Reminder = {
  id: string;
  kind: "stream" | "video";
  target_id: string;
  title: string;
  href: string;
  poster_url: string | null;
  remind_at: string | null;
  created_at: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

export const remindersQueryOptions = queryOptions({
  queryKey: ["reminders"],
  queryFn: () => getMyReminders(),
  staleTime: 1000 * 30,
});

export const notificationsQueryOptions = queryOptions({
  queryKey: ["notifications"],
  queryFn: () => getMyNotifications(),
  staleTime: 1000 * 30,
  refetchInterval: 1000 * 60,
});

/** "just now" / "3h ago" / "12 Sep" — client-side only, so no SSR skew. */
export function timeAgo(iso: string) {
  const diff = Date.now() - Date.parse(iso);
  if (!Number.isFinite(diff)) return "";
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** "Starts in 40m" / "Live now" / "Sat 12 Sep, 10:00" */
export function countdownLabel(iso: string) {
  const ms = Date.parse(iso) - Date.now();
  if (!Number.isFinite(ms)) return "";
  if (ms <= 0) return "Starting now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Starts in ${hours}h`;
  return `Starts in ${Math.round(hours / 24)}d`;
}
