import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import {
  clearNotifications,
  dismissNotification,
  markNotificationsRead,
} from "@/lib/reminders.functions";
import {
  notificationsQueryOptions,
  countdownLabel,
  timeAgo,
  type AppNotification,
} from "@/lib/reminders";
import { streamsQueryOptions, type LiveStream } from "@/lib/live";

export function NotificationBell() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"inbox" | "upcoming">("inbox");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const markFn = useServerFn(markNotificationsRead);
  const dismissFn = useServerFn(dismissNotification);
  const clearFn = useServerFn(clearNotifications);

  const list = useQuery({ ...notificationsQueryOptions, enabled: status === "in" });
  const streamsQuery = useQuery({ ...streamsQueryOptions, enabled: status === "in" });

  const items = (list.data ?? []) as AppNotification[];
  const unread = items.filter((n) => !n.read_at).length;

  const streams = (streamsQuery.data ?? []) as LiveStream[];
  const liveNow = streams.filter((s) => s.status === "live");
  const upcoming = streams
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 4);
  const upcomingCount = liveNow.length + upcoming.length;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const markRead = useMutation({ mutationFn: () => markFn({}), onSuccess: refresh });
  const dismiss = useMutation({
    mutationFn: (id: string) => dismissFn({ data: { id } }),
    onSuccess: refresh,
  });
  const clear = useMutation({
    mutationFn: (scope: "all" | "read") => clearFn({ data: { scope } }),
    onSuccess: (_d, scope) => {
      toast.success(scope === "all" ? "Notifications cleared" : "Read notifications cleared");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not clear those"),
  });

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status !== "in") return null;

  const badge = unread || (liveNow.length > 0 ? liveNow.length : 0);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={unread ? `${unread} new notifications` : "Notifications"}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) {
            setTab(unread === 0 && upcomingCount > 0 ? "upcoming" : "inbox");
            if (unread) markRead.mutate();
          }
        }}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5.3-6.8V3.5a1.7 1.7 0 1 0-3.4 0v.7A7 7 0 0 0 5 11v5l-1.6 1.6v.8h17.2v-.8Z" />
        </svg>
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {badge}
          </span>
        )}
        {liveNow.length > 0 && (
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center gap-1 border-b border-border p-2">
            {(["inbox", "upcoming"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                data-active={tab === t}
                className="rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
              >
                {t === "inbox" ? `Inbox${unread ? ` (${unread})` : ""}` : `Coming up${upcomingCount ? ` (${upcomingCount})` : ""}`}
              </button>
            ))}
            {tab === "inbox" && items.length > 0 && (
              <button
                type="button"
                onClick={() => clear.mutate("all")}
                disabled={clear.isPending}
                className="ml-auto mr-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary disabled:opacity-50"
              >
                Clear all
              </button>
            )}
          </div>

          {tab === "inbox" ? (
            items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Nothing yet. Set a reminder on a stream or message and we'll ping you here.
              </p>
            ) : (
              <>
                <ul className="max-h-80 overflow-y-auto">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className="group relative flex items-start gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-surface"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read_at ? "bg-border" : "bg-primary"
                        }`}
                      />
                      <a
                        href={n.href || "/live"}
                        onClick={() => setOpen(false)}
                        className="min-w-0 flex-1"
                      >
                        <p className="text-sm font-semibold leading-snug">{n.title}</p>
                        {n.body && (
                          <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                        )}
                        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {timeAgo(n.created_at)}
                        </p>
                      </a>
                      <button
                        type="button"
                        aria-label="Dismiss notification"
                        onClick={() => dismiss.mutate(n.id)}
                        className="shrink-0 rounded-full px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => clear.mutate("read")}
                    disabled={clear.isPending}
                    className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary disabled:opacity-50"
                  >
                    Clear read
                  </button>
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary"
                  >
                    Reminders
                  </Link>
                </div>
              </>
            )
          ) : upcomingCount === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No services scheduled right now.{" "}
              <Link to="/live" onClick={() => setOpen(false)} className="underline underline-offset-4">
                See the live page
              </Link>
              .
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {[...liveNow, ...upcoming].map((s) => (
                <li key={s.id} className="border-b border-border/60 last:border-0">
                  <Link
                    to="/live/$slug"
                    params={{ slug: s.slug }}
                    search={{ key: undefined }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <span
                      className={`h-9 w-9 shrink-0 overflow-hidden rounded-xl ${
                        s.poster_url ? "" : "bg-[image:var(--gradient-ember)]"
                      }`}
                    >
                      {s.poster_url && (
                        <img src={s.poster_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{s.title}</span>
                      <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {s.status === "live" ? "Live now — join in" : countdownLabel(s.starts_at)}
                      </span>
                    </span>
                    {s.status === "live" && (
                      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
