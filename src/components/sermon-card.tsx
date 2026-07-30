import { Link } from "@tanstack/react-router";
import type { Sermon } from "@/lib/youtube-types";
import { formatSermonDate } from "@/lib/sermons";

export function SermonThumb({ sermon, className }: { sermon: Sermon; className?: string }) {
  return (
    <img
      src={sermon.cover}
      alt={sermon.title}
      loading="lazy"
      width={1280}
      height={720}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== sermon.coverFallback) img.src = sermon.coverFallback;
      }}
      className={className}
    />
  );
}

export function SermonCard({ sermon }: { sermon: Sermon }) {
  return (
    <Link
      to="/messages/$slug"
      params={{ slug: sermon.slug }}
      className="card-lift group block overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="relative aspect-video overflow-hidden">
        <SermonThumb
          sermon={sermon}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <div className="absolute inset-0 veil" />
        <span className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {sermon.series}
        </span>
        <span className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold leading-tight">{sermon.title}</h3>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatSermonDate(sermon.date)}
          {sermon.views !== null ? ` · ${sermon.views.toLocaleString()} views` : ""}
        </p>
      </div>
    </Link>
  );
}
