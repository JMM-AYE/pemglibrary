import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  devotionalLanguagesQueryOptions,
  formatLanguageName,
} from "@/lib/devotionals";

export function DevotionalLanguagePicker({
  language,
  onChange,
}: {
  language: string;
  onChange: (language: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const { data: languages = [], isLoading } = useQuery({
    ...devotionalLanguagesQueryOptions,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return q ? languages.filter((l) => l.includes(q)) : languages;
  }, [languages, term]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        {formatLanguageName(language)}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-3xl border border-border bg-surface p-4 shadow-2xl">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search language"
            className="w-full rounded-full border border-border bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <div className="mt-3 max-h-72 overflow-y-auto pr-1">
            {isLoading && <p className="px-2 py-3 text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="px-2 py-3 text-sm text-muted-foreground">No language found.</p>
            )}
            {filtered.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  onChange(l);
                  setOpen(false);
                  setTerm("");
                }}
                data-active={l === language}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-[color:color-mix(in_oklab,var(--sage)_12%,transparent)] hover:text-foreground data-[active=true]:text-foreground"
              >
                {formatLanguageName(l)}
                {l === language && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
