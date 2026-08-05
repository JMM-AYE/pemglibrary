import { useEffect, useRef, useState } from "react";

/**
 * Plays an .m3u8 stream in-app. hls.js is loaded lazily in the browser only;
 * Safari/iOS uses its native HLS support instead.
 */
export function HlsPlayer({ src, poster }: { src: string; poster?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let destroy: (() => void) | undefined;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      let cancelled = false;
      void import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) {
          if (!cancelled) setError("This browser can't play the stream.");
          return;
        }
        const hls = new Hls({ lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) setError("The stream dropped. Try refreshing in a moment.");
        });
        destroy = () => hls.destroy();
      });
      return () => {
        cancelled = true;
        destroy?.();
      };
    }
    return undefined;
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-black">
      <video
        ref={videoRef}
        poster={poster ?? undefined}
        controls
        playsInline
        autoPlay
        className="h-full w-full object-contain"
      />
      {error && (
        <p className="absolute inset-x-0 bottom-0 bg-background/85 px-4 py-3 text-center text-xs text-muted-foreground">
          {error}
        </p>
      )}
    </div>
  );
}