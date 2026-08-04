import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/use-session";

/**
 * Wraps any playable surface. Visitors must be signed in (member or guest
 * profile) before a message or live service starts.
 */
export function WatchGate({
  children,
  poster,
  label = "Sign in to watch",
  note = "Create a free account — as a church member or a guest — to watch messages and live services.",
}: {
  children: ReactNode;
  poster?: string | null;
  label?: string;
  note?: string;
}) {
  const { status } = useSession();

  if (status === "in") return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface">
      <div className="aspect-video w-full">
        {poster ? (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover opacity-35 blur-[3px]"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/70 px-6 text-center backdrop-blur-sm">
        <div className="max-w-sm">
          <p className="eyebrow-cool">Members &amp; guests</p>
          <h2 className="display mt-3 text-2xl sm:text-3xl">{label}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {status === "loading" ? "Checking your session…" : note}
          </p>
          {status === "out" && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground"
              >
                Create account
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.16em]"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}