import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/use-session";
import { markNotificationsRead } from "@/lib/reminders.functions";
import { notificationsQueryOptions, type AppNotification } from "@/lib/reminders";

export function NotificationBell() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const markFn = useServerFn(markNotificationsRead);

  const list = useQuery({ ...notificationsQueryOptions, enabled: status === "in" });
  const items = (list.data ?? []) as AppNotification[];
  const unread = items.filter((n) => !n.read_at).length;

  const markRead = useMutation({
    mutationFn: () => markFn({}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (status !== "in") return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unread ? `${unread} new notifications` : "Notifications"}
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread) markRead.mutate();
        }}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5.3-6.8V3.5a1.7 1.7 0 1 0-3.4 0v.7A7 7 0 0 0 5 11v5l-1.6 1.6v.8h17.2v-.8Z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <p className="border-b border-border px-4 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Notifications
          </p>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Nothing yet. Set a reminder on a stream and we'll ping you here when it starts.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="border-b border-border/60 last:border-0">
                  <Link
                    to={n.href || "/live"}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <p className="text-sm font-semibold">{n.title}</p>
                    {n.body && <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>}
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