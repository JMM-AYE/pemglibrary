import { useState } from "react";
import type { Sermon } from "@/lib/youtube-types";
import { SermonThumb } from "./sermon-card";

export function YouTubePlayer({ sermon }: { sermon: Sermon }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-surface">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${sermon.videoId}?autoplay=1&rel=0`}
          title={sermon.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${sermon.title}`}
          className="group absolute inset-0 grid place-items-center"
        >
          <SermonThumb sermon={sermon} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-background/35 transition-colors duration-500 group-hover:bg-background/20" />
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-500 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
