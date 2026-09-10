import { queryOptions } from "@tanstack/react-query";
import { getDevotionals, getDevotionalLanguages } from "./rhapsody.functions";
import { DEFAULT_LANGUAGE } from "./rhapsody.server";

export { DEFAULT_LANGUAGE };

export const LANGUAGE_STORAGE_KEY = "pemg:devotional-language";

export function devotionalsQueryOptions(language: string = DEFAULT_LANGUAGE) {
  const lang = (language || DEFAULT_LANGUAGE).toLowerCase();
  return queryOptions({
    queryKey: ["devotionals", lang],
    queryFn: () => getDevotionals({ data: { language: lang } }),
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export const devotionalLanguagesQueryOptions = queryOptions({
  queryKey: ["devotional-languages"],
  queryFn: () => getDevotionalLanguages(),
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 24,
});

export function formatLanguageName(language: string) {
  return language.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDevotionalDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
