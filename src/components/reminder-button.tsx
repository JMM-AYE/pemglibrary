import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { addReminder, removeReminder } from "@/lib/reminders.functions";
import { remindersQueryOptions, type Reminder } from "@/lib/reminders";

/** Save-for-later / notify-me toggle for a message or a live session. */
export function ReminderButton({
  kind,
  targetId,
  title,
  href,
  posterUrl = null,
  remindAt = null,
  labels = { on: "Reminder set", off: "Remind me" },
  className = "",
}: {
  kind: "stream" | "video";
  targetId: string;
  title: string;
  href: string;
  posterUrl?: string | null;
  remindAt?: string | null;
  labels?: { on: string; off: string };
  className?: string;
}) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const addFn = useServerFn(addReminder);
  const removeFn = useServerFn(removeReminder);

  const list = useQuery({ ...remindersQueryOptions, enabled: status === "in" });
  const saved = ((list.data ?? []) as Reminder[]).some(
    (r) => r.kind === kind && r.target_id === targetId,
  );

  const toggle = useMutation({
    mutationFn: async () =>
      saved
        ? removeFn({ data: { kind, target_id: targetId } })
        : addFn({
            data: { kind, target_id: targetId, title, href, poster_url: posterUrl, remind_at: remindAt },
          }),
    onSuccess: () => {
      toast.success(saved ? "Reminder removed" : "We'll let you know");
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save that"),
  });

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] transition-colors";

  if (status !== "in") {
    return (
      <Link
        to="/auth"
        search={{ mode: "signin" }}
        className={`${base} border-border hover:border-primary ${className}`}
      >
        {labels.off}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      aria-pressed={saved}
      className={`${base} ${
        saved
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary"
      } ${className}`}
    >
      <span aria-hidden="true">{saved ? "\u2713" : "\u2295"}</span>
      {saved ? labels.on : labels.off}
    </button>
  );
}