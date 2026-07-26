import { useRef, useState } from "react";

export function VideoPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    requestAnimationFrame(() => void videoRef.current?.play());
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-surface">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={started}
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      />
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 grid place-items-center bg-background/35 transition-colors duration-500 hover:bg-background/20"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-500 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}