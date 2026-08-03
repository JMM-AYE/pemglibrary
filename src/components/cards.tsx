import { Link } from "@tanstack/react-router";
import { formatDate, type Article, type Message } from "@/data/library";

export function MessageCard({ message }: { message: Message }) {
  return (
    <Link
      to="/messages/$slug"
      params={{ slug: message.slug }}
      className="card-lift group block overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={message.cover}
          alt={message.title}
          loading="lazy"
          width={1280}
          height={800}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <div className="absolute inset-0 veil" />
        <span className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {message.part}
        </span>
        <span className="absolute bottom-4 right-4 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {message.duration}
        </span>
        <span className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="p-6">
        <p className="eyebrow">{message.series}</p>
        <h3 className="mt-2 font-display text-xl font-bold leading-tight">{message.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{message.summary}</p>
        <p className="mt-4 text-xs text-muted-foreground">{formatDate(message.date)}</p>
      </div>
    </Link>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="card-lift-cool group flex gap-5 rounded-3xl border border-[color:color-mix(in_oklab,var(--sage)_18%,transparent)] bg-[color:color-mix(in_oklab,var(--ink)_88%,var(--background))] p-4"
    >
      <div className="hidden h-28 w-36 shrink-0 overflow-hidden rounded-2xl sm:block">
        <img
          src={article.cover}
          alt={article.title}
          loading="lazy"
          width={1280}
          height={800}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 py-1">
        <p className="eyebrow-cool">
          {article.source} &middot; {article.readTime}
        </p>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
      </div>
    </Link>
  );
}