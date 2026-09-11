import { devotionalSlug } from "./devotional-slug";

const HOME = "https://read.rhapsodyofrealities.org/";
const DEVOTIONAL = `${HOME}api/daily-devotional/`;
const TRANSLATION = `${HOME}api/ror-translations/`;
const LANGUAGE_LIST = `${HOME}api/list-ror-translations`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export const DEFAULT_LANGUAGE = "english";

export type Devotional = {
  slug: string;
  language: string;
  title: string;
  date: string;
  fullDate: string;
  cover: string;
  excerpt: string;
  bodyHtml: string;
  confessionTitle: string;
  confessionHtml: string;
  furtherStudy: string;
  readingA: string;
  readingB: string;
  audioUrl: string;
  sourceUrl: string;
};

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

const MONTHS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
];

/** Rhapsody hosts the read-aloud version at /YYYY/monthname/DD.mp3 on their CDN. */
function audioUrlFor(date: string) {
  const [year, month, day] = date.split("-");
  return `https://roraudio.b-cdn.net/${year}/${MONTHS[parseInt(month ?? "1", 10) - 1]}/${day}.mp3`;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "\u2019")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** The reader mints a short-lived `_read_IPA` bearer token on page load. */
async function fetchToken(): Promise<string | null> {
  const res = await fetch(HOME, { headers: { "user-agent": UA } });
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const raw = headers.getSetCookie ? headers.getSetCookie().join("; ") : (headers.get("set-cookie") ?? "");
  const match = /_read_IPA=([^;,\s]+)/.exec(raw);
  return match ? match[1] : null;
}

function authHeaders(token: string) {
  return { authorization: `Bearer ${token}`, accept: "application/json", "user-agent": UA };
}

async function fetchOne(date: string, token: string): Promise<Devotional | null> {
  const res = await fetch(DEVOTIONAL + date, { headers: authHeaders(token) });
  if (!res.ok) return null;
  const payload = (await res.json()) as {
    result?: Array<Record<string, string>>;
  };
  const entry = payload.result?.[0];
  if (!entry?.title) return null;

  const bodyHtml = entry["body"] ?? "";
  return {
    slug: devotionalSlug(DEFAULT_LANGUAGE, date, entry["title"]),
    language: DEFAULT_LANGUAGE,
    title: entry["title"],
    date,
    fullDate: entry["fulldate"] ?? date,
    cover: entry["image"] ?? "",
    excerpt: stripHtml(bodyHtml).slice(0, 220),
    bodyHtml,
    confessionTitle: entry["confess_title"] ?? "Confession",
    confessionHtml: entry["confess"] ?? "",
    furtherStudy: stripHtml(entry["study"] ?? ""),
    readingA: stripHtml(entry["BA"] ?? ""),
    readingB: stripHtml(entry["BB"] ?? ""),
    audioUrl: audioUrlFor(date),
    sourceUrl: HOME,
  };
}

/** Translated editions come from a separate endpoint with different field names. */
async function fetchTranslated(
  date: string,
  language: string,
  token: string,
): Promise<Devotional | null> {
  const res = await fetch(`${TRANSLATION}${date}/${encodeURIComponent(language)}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return null;
  const payload = (await res.json()) as { devotionals?: Array<Record<string, string>> };
  const entry = payload.devotionals?.[0];
  if (!entry?.["title"]) return null;

  const bodyHtml = entry["content_body"] ?? "";
  const confession = entry["confession_or_prayer"] ?? "";
  return {
    slug: devotionalSlug(language, date, entry["title"]),
    language,
    title: entry["title"],
    date,
    fullDate: entry["upload_date"] ?? date,
    cover: entry["photo_link"] ?? "",
    excerpt: (entry["excerpt"] ? stripHtml(entry["excerpt"]) : stripHtml(bodyHtml)).slice(0, 220),
    bodyHtml,
    confessionTitle: entry["option"] ?? "Confession",
    confessionHtml: confession.startsWith("<") ? confession : `<p>${confession}</p>`,
    furtherStudy: stripHtml(entry["further_study"] ?? ""),
    readingA: stripHtml(entry["one_yearbb"] ?? ""),
    readingB: stripHtml(entry["two_yearbb"] ?? ""),
    audioUrl: language === DEFAULT_LANGUAGE ? audioUrlFor(date) : "",
    sourceUrl: HOME,
  };
}

/* ---------------------------------------------------------------- caching */

/** Per-day devotionals never change once published, so cache them for good. */
const dayCache = new Map<string, Devotional>();

type Cached = { at: number; value: Devotional[] };
const listCache = new Map<string, Cached>();
const inFlight = new Map<string, Promise<Devotional[]>>();

const LIST_TTL_MS = 1000 * 60 * 60 * 6;
const TOKEN_TTL_MS = 1000 * 60 * 20;

let tokenCache: { at: number; value: string } | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && Date.now() - tokenCache.at < TOKEN_TTL_MS) return tokenCache.value;
  const token = await fetchToken();
  if (token) tokenCache = { at: Date.now(), value: token };
  return token;
}

async function loadDevotionals(days: number, language: string): Promise<Devotional[]> {
  const token = await getToken();
  if (!token) return [];
  const results = await Promise.all(
    Array.from({ length: days }, (_, i) => {
      const date = isoDate(i);
      const key = `${language}:${date}`;
      const hit = dayCache.get(key);
      if (hit) return Promise.resolve(hit);
      const request =
        language === DEFAULT_LANGUAGE
          ? fetchOne(date, token)
          : fetchTranslated(date, language, token);
      return request
        .then((entry) => {
          if (entry) dayCache.set(key, entry);
          return entry;
        })
        .catch(() => null);
    }),
  );
  return results.filter((d): d is Devotional => d !== null);
}

/** Today's devotional plus the previous `days - 1` readings, cached per day. */
export async function fetchDevotionals(
  days = 7,
  language: string = DEFAULT_LANGUAGE,
): Promise<Devotional[]> {
  const lang = (language || DEFAULT_LANGUAGE).toLowerCase();
  const cached = listCache.get(lang);
  if (cached && Date.now() - cached.at < LIST_TTL_MS) return cached.value;
  const pending = inFlight.get(lang);
  if (pending) return pending;

  const request = loadDevotionals(days, lang)
    .then((value) => {
      if (value.length) listCache.set(lang, { at: Date.now(), value });
      return value.length ? value : (listCache.get(lang)?.value ?? []);
    })
    .catch(() => listCache.get(lang)?.value ?? [])
    .finally(() => {
      inFlight.delete(lang);
    });

  inFlight.set(lang, request);
  return request;
}

/* -------------------------------------------------------------- languages */

let languageCache: { at: number; value: string[] } | null = null;
const LANG_TTL_MS = 1000 * 60 * 60 * 24;

/** Every language Rhapsody currently publishes the daily reading in. */
export async function fetchLanguages(): Promise<string[]> {
  if (languageCache && Date.now() - languageCache.at < LANG_TTL_MS) return languageCache.value;
  try {
    const token = await getToken();
    if (!token) return languageCache?.value ?? [DEFAULT_LANGUAGE];
    const res = await fetch(LANGUAGE_LIST, { headers: authHeaders(token) });
    if (!res.ok) return languageCache?.value ?? [DEFAULT_LANGUAGE];
    const payload = (await res.json()) as { languages?: string[] };
    const list = (payload.languages ?? [])
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);
    const value = Array.from(new Set([DEFAULT_LANGUAGE, ...list]));
    languageCache = { at: Date.now(), value };
    return value;
  } catch {
    return languageCache?.value ?? [DEFAULT_LANGUAGE];
  }
}
