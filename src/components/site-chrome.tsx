import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/messages", label: "Messages" },
  { to: "/events", label: "Events" },
  { to: "/articles", label: "Articles" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border" : ""
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="display text-xl tracking-tight">
          <span className="gold-text">PEMG</span> Library
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ "data-active": "true" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/messages"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.04] sm:inline-flex"
          >
            Start watching
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden"
          >
            <span className="text-lg leading-none">{open ? "\u2715" : "\u2630"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-1 text-base font-medium text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="display text-3xl leading-none sm:text-4xl">
            <span className="gold-text">PEMG</span> Library
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            A digital library of messages and articles. Watch, read, and take the Word with
            you.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <Link to="/messages" className="hover:text-foreground">
            Messages
          </Link>
          <Link to="/articles" className="hover:text-foreground">
            Articles
          </Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} PEMG Library. All rights reserved.
      </div>
    </footer>
  );
}