import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getZoomJoinConfig } from "@/lib/zoom.functions";

type Phase = "loading" | "joining" | "joined" | "external" | "error";

/**
 * Plays a Zoom session inside the page using the Zoom Meeting SDK. When Zoom
 * SDK credentials are not configured we degrade to the plain join link.
 */
export function ZoomStage({
  slug,
  code = "",
  token = "",
  poster,
  title,
}: {
  slug: string;
  code?: string;
  token?: string;
  poster: string | null;
  title: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [joinUrl, setJoinUrl] = useState("");
  const [message, setMessage] = useState("");
  const configFn = useServerFn(getZoomJoinConfig);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    let client: { leaveMeeting?: () => void } | null = null;

    (async () => {
      try {
        const config = (await configFn({ data: { slug, code, token } })) as
          | { ok: false; reason: string }
          | { ok: true; embeddable: false; joinUrl: string }
          | {
              ok: true;
              embeddable: true;
              joinUrl: string;
              sdkKey: string;
              signature: string;
              meetingNumber: string;
              password: string;
              userName: string;
              userEmail: string;
            };

        if (cancelled) return;
        if (!config.ok) {
          setPhase("error");
          setMessage(
            config.reason === "code"
              ? "This session needs a valid invite link."
              : "This session isn't ready yet.",
          );
          return;
        }

        setJoinUrl(config.joinUrl);
        if (!config.embeddable) {
          setPhase("external");
          return;
        }

        setPhase("joining");
        const { default: ZoomMtgEmbedded } = await import("@zoom/meetingsdk/embedded");
        if (cancelled || !rootRef.current) return;

        const zoomClient = ZoomMtgEmbedded.createClient();
        client = zoomClient as unknown as { leaveMeeting?: () => void };
        await zoomClient.init({
          zoomAppRoot: rootRef.current,
          language: "en-US",
          patchJsMedia: true,
          customize: {
            video: {
              isResizable: false,
              viewSizes: {
                default: {
                  width: rootRef.current.clientWidth,
                  height: Math.round((rootRef.current.clientWidth * 9) / 16),
                },
              },
            },
          },
        });
        await zoomClient.join({
          signature: config.signature,
          sdkKey: config.sdkKey,
          meetingNumber: config.meetingNumber,
          password: config.password,
          userName: config.userName,
          userEmail: config.userEmail || undefined,
        });
        if (!cancelled) setPhase("joined");
      } catch (e) {
        if (cancelled) return;
        setPhase("external");
        setMessage(e instanceof Error ? e.message : "Could not start the meeting here.");
      }
    })();

    return () => {
      cancelled = true;
      try {
        client?.leaveMeeting?.();
      } catch {
        /* meeting already closed */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, code, token]);

  const embedded = phase === "joining" || phase === "joined";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
      {poster && !embedded && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}

      <div
        ref={rootRef}
        className={embedded ? "relative min-h-[420px] w-full bg-black" : "hidden"}
      />

      {phase === "joining" && (
        <p className="absolute inset-x-0 bottom-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Connecting you to the meeting…
        </p>
      )}

      {!embedded && (
        <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center sm:py-24">
          <p className="eyebrow">Zoom session</p>
          <h2 className="display max-w-xl text-[clamp(1.5rem,4vw,2.5rem)]">{title}</h2>
          {phase === "loading" ? (
            <p className="text-sm text-muted-foreground">Checking your access…</p>
          ) : phase === "error" ? (
            <p className="max-w-md text-sm text-muted-foreground">{message}</p>
          ) : (
            <>
              <p className="max-w-md text-sm text-muted-foreground">
                {message ||
                  "Your access is confirmed. Open the meeting to join Pastor Enoch and the team."}
              </p>
              {joinUrl && (
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground"
                >
                  Join the Zoom meeting
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
