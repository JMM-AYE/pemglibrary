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